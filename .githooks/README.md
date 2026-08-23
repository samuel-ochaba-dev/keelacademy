# .githooks — keelacademy local gates

## Activation (one-time, per clone)

Git does not run hooks from `.githooks/` until you point it there:

```bash
git config core.hooksPath .githooks
```

This is a human setup act — do it once after cloning. Deactivate with
`git config --unset core.hooksPath`.

## pre-push — content schema gate (S2.1)

Runs on every push:

```bash
python3 content/tools/validate.py        # units (discovered), examples, variants, personas
python3 content/tools/validate-rubrics.py  # rubrics + filename/version layout
```

Either validator failing blocks the push; the validator output names the
offending file(s). GitHub CI runs the same two commands on content PRs
(`.github/workflows/content-gate.yml`).

## Bypass (scripted tooling only)

```bash
KEEL_SKIP_CONTENT_GATE=1 git push
```

Skips both validators with a loud one-line notice. For scripts that push
non-content commits in bulk; never use it to push content you would not
submit to CI.
