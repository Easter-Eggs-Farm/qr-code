---
name: check
description: Run this project's lint and test commands and report only what fails, with file and line. Use before committing or when asked whether the change is done.
allowed-tools: Bash(npm test *)
---

Run, in order, stopping at the first failing step:

1. `npm test`

Report failures only: command, file:line, one-line cause. Do not fix anything unless asked.
If everything passes, say so in one line.
