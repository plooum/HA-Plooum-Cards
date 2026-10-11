#!/usr/bin/env python3
"""Where a sub-agent's time went, from its transcript (JSONL).

  python3 .claude/skills/pilot/agent_timing.py <transcript.jsonl> [...]

The transcript is the sub-agent's task output file (a symlink to its JSONL). Prints the wall time,
the model's own time (between a tool result and the next tool call: reading, thinking, writing),
the tools' time by category, the errors / refusals, and the slowest calls. Run by the pilot after
each sub-agent; the totals go in the handoff's sub-agent notes.
"""

import json
import re
import sys
from collections import defaultdict
from datetime import datetime


def ts(d):
    return datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00")).timestamp()


def category(name, inp):
    if name == "Bash":
        cmd = inp.get("command", "")
        for pat, cat in [
            (r"ui_test\.py", "suite (headless)"),
            (r"shot\.py|editor_shot", "screenshot"),
            (r"npm run build", "build"),
            (r"ha\.sh (start|restart)", "HA start"),
            (r"ha\.sh|api\.sh|bootstrap", "HA other"),
            (r"\bgh\b", "gh (PR/CI)"),
            (r"\bgit\b", "git"),
            (r"\b(grep|sed|cat|head|tail|awk|wc|ls|find)\b", "reading (shell)"),
        ]:
            if re.search(pat, cmd):
                return cat
        return "bash other"
    if name.startswith("mcp__Claude_Browser__"):
        return "browser pane"
    if name in ("Read", "Grep", "Glob"):
        return "reading"
    if name in ("Edit", "Write", "MultiEdit"):
        return "editing"
    if name == "Skill":
        return "skills"
    return name


def analyze(path):
    rows = [json.loads(l) for l in open(path) if l.strip()]
    rows = [r for r in rows if "timestamp" in r]
    calls = {}  # tool_use id -> (start, name, input)
    tool_time = defaultdict(float)
    tool_count = defaultdict(int)
    slow = []
    errors = []
    model_time = 0.0
    last_result = None
    for r in rows:
        msg = r.get("message") or {}
        content = msg.get("content")
        if not isinstance(content, list):
            continue
        t = ts(r)
        if msg.get("role") == "assistant":
            if last_result is not None:
                model_time += max(0.0, t - last_result)
                last_result = None
            for c in content:
                if c.get("type") == "tool_use":
                    calls[c["id"]] = (t, c["name"], c.get("input") or {})
        else:
            for c in content:
                if c.get("type") != "tool_result" or c.get("tool_use_id") not in calls:
                    continue
                start, name, inp = calls.pop(c["tool_use_id"])
                d = t - start
                cat = category(name, inp)
                tool_time[cat] += d
                tool_count[cat] += 1
                label = inp.get("command") or inp.get("file_path") or inp.get("url") or inp.get("text") or ""
                slow.append((d, cat, str(label).replace("\n", " ")[:90]))
                if c.get("is_error"):
                    text = c.get("content")
                    if isinstance(text, list):
                        text = " ".join(x.get("text", "") for x in text if isinstance(x, dict))
                    errors.append((cat, str(text).replace("\n", " ")[:110]))
                last_result = t
    wall = ts(rows[-1]) - ts(rows[0]) if rows else 0
    tools = sum(tool_time.values())
    print(f"== {path}")
    print(f"wall {wall/60:.1f} min | model {model_time/60:.1f} min | tools {tools/60:.1f} min | {sum(tool_count.values())} calls | {len(errors)} errors")
    for cat, sec in sorted(tool_time.items(), key=lambda x: -x[1]):
        print(f"  {cat:<18} {sec:6.0f} s  {tool_count[cat]:3d} calls")
    print("  slowest:")
    for d, cat, label in sorted(slow, reverse=True)[:6]:
        print(f"    {d:5.0f} s  {cat:<16} {label}")
    if errors:
        print("  errors:")
        for cat, text in errors[:8]:
            print(f"    {cat:<16} {text}")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        analyze(p)
