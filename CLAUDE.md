## git

Do not stage, unstage, or commit changes. Leave those actions to the user.

## Comments

Keep comments clean and concise.
Document API interfaces and expectations.
Minimal section markers are okay.

State invariants abstractly — just the rule as simple as possible.
Prefer referencing categories and high level concepts over implementation details.

Only add extra comments if the code is not self-explanatory.
DO NOT mention historical cruft or change logs

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
