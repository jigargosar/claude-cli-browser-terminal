# First turns of the session on 2026-11-22

- Source: session `52304e6c-f81f-47b1-9642-becbebb2f670`, its first three turns, verbatim.
- Why kept: the user said this session started with good communication and turned bad later.
- Times are IST.
- Line numbers inside the replies are as written then.
- Tool calls are left out.

## Turn 1

User, 10:17

````text
I want to finish important features, but I tend to get sidetracked. 

I have two specific problems and you need to help me avoid it
````

Claude, 10:17

````text
What are the two problems?
````

## Turn 2

User, 10:28

````text
Getting side tracked from working on important features (I dont know what is important)

And spending too much time on documentation, which is good specifically when working through the list of planned features. But some how reduce that time. Measure that time, so that I can clearliy assess on what I have spend most part on.

measuring time, what actuvuttm, might be another sidetrack.

And when I day documentation it is the task list, expanding scope capturing new ideas which is good but too much is not cool.

Also spending disoritunate time on features. You can implement things at extremely high speed. As long as we are on the same page. And that is another timewaster. 

Also I am not sure how to fix these bottlenecks.

I also want to spend leasure time on doing all the funky stuff. But need cleaer seperation.

Now all this info, I am afraid it wont be captured, i.e. And will have to type these things on every session and across projects. I have added those as additional directories.

Keep myself on track.
Not to mix leasure time hacking with real work.

And I can continue with this rant. But I want to move fast.

Please advise
````

Claude, 10:29

````text
Three causes show in `docs/fvp-list.md` and the project `CLAUDE.md`.

- All three primary goals are ticked, so nothing defines "important" right now.
- Four tasks are dotted at once.
- Nothing separates work from play.

A short section in `~/.claude/CLAUDE.md` fixes the retyping, because that file loads in every session and every project.

```markdown
# Focus

- Every session is `work` or `play`. If the user doesn't say which, ask once at the start.
- Work: one active task, and it serves the project's open goal. Claude names it at the start.
- Work: a new idea gets one line at the end of the task list. It is expanded only when it becomes the active task.
- Work: when a request doesn't serve the active task, Claude says "sidetrack" and parks it in one line.
- Before building, Claude states the plan in five lines at most. The user says go, and Claude builds without further check-ins.
- Play: anything goes, and no list entry is needed.
- Commit subjects start with the kind: `feat:`, `docs:`, `meta:` or `play:`.
```

The commit prefix is the whole time measurement. A small script can later sum the time per kind from commit timestamps. Assumption: the gap between commits approximates the time spent.

Start with the open goal, since the rules above depend on it. Give me Goal 4 in one sentence, and I will mark which list tasks serve it. Shall I add the Focus section as drafted?
````

## Turn 3

User, 10:46

````text
I need you help me formulate it. First you give me understand of this project. And what is going on in this session. Remind me to put version no. and changelog full including unreleased tasks in changelog file. Because I keep wondering when I use this tool in other projects and missing out on features I developed.

Before adding anything anywhere lets get on same page, since this projects understand is critical, and should be obvious to any future session. put it in global file, and what to put what not to put. how it will guide me. Perhaps either we wait on putting these instructions in global claude, we keep them in local claude. You make the judgement, You have to be slightly stricter. Any change I suggest, should be evaluated by you. And I am supoosed to only respond on major issues. You can add to claude, remove from it, modify it. give strong reasons, which means you need to think hard and gather relevant information from me, and from project.

Now about the goal. There are 2 things. 1. some how add it as a portiolio project, scope unknown. 2. Issues have mostly come from my usage in this and other projects. that is kind of other goal.

Advise. Also you need to be challinging and not just blanketly accept. And you are in charge of what needs to be done. Whether we start in this project. and have some link so other projects also follow/guide me as you are going to do.

Also I will have to goback and look at the current list and put dots on what I think is imporant. All of working rules, I have established is my attempt to keep you and me both in check. But obviously it is not working, perhaps rules are problem, or rules are bad.
````

Claude, 10:48

````text
## The project

- ccw puts the Claude terminal and the rendered reply in one browser page, with click-to-comment on any sentence.
- It shipped 17 releases from 13 Oct to 12 Nov, then none in the 10 days since.
- `skills`, `scripts` and `quick-notes-v2` all install 0.1.17, which is the latest release.
- File refs are built per `docs/handoff.md:9`, yet `CHANGELOG.md:8` Unreleased is empty.
- So you are missing unreleased features, not released ones. A reminder would not fix that, a release would.

## This session

Thirty minutes of meta, no task touched. The active task is file refs, one step from solving its pain (`docs/tasks/file-refs/plan.md:25-33`, the system prompt awaiting your confirmation).

## Why the rules are not working

- Correction to my earlier point: dots are the FVP chain, so four dots is not a fault by itself.
- No task has a done condition. File refs has 19 sub-items and 5 ticked, and its pain needs one more.
- Releasing waits for a task to close (`docs/fvp-list.md:34`), and no task closes.
- Almost every rule polices how Claude replies. Two lines govern what gets worked on.
- Rules sit in five places, and two are unapplied drafts (`docs/tasks/collaboration/plan.md`, `skills/global-claude-md/pending.md`). Rule-writing is itself the documentation sink.

## The goal

- "Issues from my usage" is Goal 1 again. It never ends, and it makes every irritation important.
- Portfolio can have a finish line, so I recommend it as Goal 4.
- Usage issues get in only when they break a feature the README lists or stop daily use.
- `README.md:78` already claims "One task at a time", and a portfolio viewer can check that against the list.

Draft, assuming the viewer is a developer judging your work:

```markdown
- [ ] Goal 4: a stranger opens the README, understands ccw in one minute, installs it with one command, and every listed feature works on first use.
```

## Where the rules go

Project `CLAUDE.md` first, global after they hold through two releases. An unproven rule in the global file hits four projects, and global changes already stall as drafts.

```markdown
# Focus

- Work serves Goal 4 or fixes something that stops daily use. Anything else is play.
- A session is work or play. Claude asks once if unsaid. Play commits start with `play:`.
- Every task has a "Done when" line. Once met, the task closes and releases. Leftover sub-items become new undotted tasks.
- A user-visible change adds its line under Unreleased in `CHANGELOG.md`, in the same commit.
- In work, a new idea gets one line at the end of the list, and Claude says "parked".
- Claude challenges a request that fails the first rule, in one line, before doing it.
```

Kept out: reply style, which the global file covers, plus time tracking and items 2 to 6 of the collaboration plan, which add ceremony to every turn.

## Order of work

1. You answer the question below, and I put Goal 4 and Focus into `CLAUDE.md` as a diff.
2. File refs: you confirm the prompt, it goes into `server.mjs:53`, and 0.1.18 ships with its changelog lines.
3. Showing the version number in the page gets one line on the list.

Who is the portfolio viewer, and what should they conclude about you?
````

