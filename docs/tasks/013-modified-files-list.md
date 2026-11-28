Pain: three or four files get modified, and I can't tell which ones or what changed.

- Solution: each reply ends with a list of the files modified, outside the project first, in red, then inside the project. Each one links like a file reference.
- Not decided: how to find the modified files and their diff. Git inside the project. Outside it, perhaps chezmoi.
- Idea: the server finds the writes in the transcript, since it reads every line. Writes outside the project matter most.
