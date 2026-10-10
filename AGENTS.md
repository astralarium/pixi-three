## Subagents

Utilize subagents for self-contained tasks.
Pick the right model based on task complexity.

Be coy when launching subagent code reviews.
Set goals and scope, but let the agent explore on its own.

## Prose

State ground truth positively: what IS, in fewest words.
Avoid convoluted languate. Be clear and direct.
Condense information down to the essentials.
Avoid negations: "never", "not", "no", "without", "rather than", etc.
Negate when the negative is a fact.
Drop clauses restating the prior line.
Tests, comments, and code stand alone:
avoid referencing plan docs or chat conversations.

## Comments

Only comment what code/types can't state.
The best documentation is clear implementation.

Use telegraphic style. Be concrete, not aphoristic.
Comment the code it's attached to, not consumers elsewhere.

Document interfaces/types/functions/constants.
Top-level doc = one-line essence;
per-field detail on the fields.

Never address the reviewer:
no edit justifications, no debugging history.

## Reviews

Group findings by root cause.
One structural fix that deletes the mechanism beats per-finding patches,
but consider if simpler fixes are better.

## Plan Docs

Scope, sequencing, binding decisions only. No execution/review logs.
One line per changed decision; outcome, not deliberation.
The ideal plan focuses on what is important to implementers and reviewers.

## Design

Extract generic logic into reusable components; inline the rest.
After moving a declaration, update every consumer and delete the old export path.

Build the full surface and avoid stubs.
Out-of-scope = plain open item in plan doc.

## Tests

Test names are spec sentences: declarative present tense,
the app (or component) as subject, rules-doc vocabulary.

## Git

Do not commit, stage, unstage, stash, unstash, push, pull, reset, or git mv, unless explicitly directed.
You may ask the user for permission if you need to perform these actions.
The user may do these manually (staging may be done without alerting you).

## live-cmd

This project uses `live`, a CLI streamer.
See live-cmd skill for detailed usage.

Run detached (survives shell exit; prints session UUID):
live run -dn NAME -- <cmd>

Stop a running session:
live stop <SELECTOR>

List sessions:
live ps [-a] [--json] [<SELECTOR>]

<SELECTOR>: UUID prefix or NAME (newest match)

Read output:
live cat -v <SELECTOR>
live head -v <SELECTOR>

stdout: merged stdout+stderr logs

stderr: `live` verbose output (-v):

- trailer:
  "live: id=<uuid> next-line=<N> next-byte=<B> last-time=<T>"
- stop: session is done
  "live: exit-code=<code>" or "live: exit=inconsistent"
- hung: alive, but stalled
  "live: status=hung last-activity=<s>"
- tty closed: output detached but child is running
  "live: tty closed; no further output"
- gap: rotation dropped data
  "live: dropped <j> lines + <k> bytes (from-line=<N>, first-line=<F>, from-byte=<B0>, first-byte=<B1>)"
- partial: partial line (eg. progress bar)
  "live: partial-line bytes=<k> age=<s>"

Check for new data:
live tail -vn +<N> <SELECTOR> # by line
live tail -vc +<B> <SELECTOR> # by byte

Reset cursor to 1 if <uuid> changes (new session)
