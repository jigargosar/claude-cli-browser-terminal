#!/usr/bin/env bash
# One timed run: bench + claude -p, with or without the mod.
#   bash run.sh <mod|nomod> <n>
# Writes results/<mode>-<n>.jsonl (bench log) and results/<mode>-<n>.meta.json.
set -euo pipefail
mode=$1
n=$2
here=$(cd "$(dirname "$0")" && pwd -W 2>/dev/null || pwd)
cwd=C:/Windows/Temp/claude/C--Users-jigar-projects-claude-cli-browser-terminal/scratchpad/mods-vs-tail-cwd
mkdir -p "$cwd" "$here/results"
printf 'alpha\nbeta\ngamma\n' > "$cwd/hello.txt"

sid=$(node -e "console.log(crypto.randomUUID())")
port=$(node -e "const s=require('net').createServer().listen(0,()=>{console.log(s.address().port);s.close()})")
enc=$(node -e "console.log(process.argv[1].replace(/[^A-Za-z0-9]/g,'-'))" "$cwd")
transcript="$(cygpath -m "$HOME")/.claude/projects/$enc/$sid.jsonl"
out="$here/results/$mode-$n.jsonl"
rm -f "$out"

timeout 300 node "$here/bench.mjs" "$transcript" "$out" "$port" &
bench=$!
sleep 1

plugin=()
[ "$mode" = mod ] && plugin=(--plugin-dir "$here/mod")

prompt='Do these in order, one tool call each: 1. Read hello.txt. 2. Run the Bash command: node --version. 3. Glob *.txt. 4. Run the Bash command: node -e "console.log(1+1)". Then reply with one short sentence.'

start=$(node -e "console.log(Date.now())")
( cd "$cwd" && env $(env | grep -o '^CLAUDE[A-Z_]*' | sed 's/^/-u /') SPIKE_PORT="$port" \
  timeout 240 claude -p "$prompt" --model haiku --session-id "$sid" \
  --allowedTools "Read" "Glob" "Bash(node --version)" "Bash(node -e *)" "${plugin[@]}" > "$here/results/$mode-$n.reply.txt" )
end=$(node -e "console.log(Date.now())")

sleep 2
kill "$bench"
printf '{"mode":"%s","n":%s,"sessionId":"%s","transcript":"%s","wallMs":%s}\n' "$mode" "$n" "$sid" "$transcript" "$((end - start))" > "$here/results/$mode-$n.meta.json"
echo "done $mode $n $((end - start)) ms"
