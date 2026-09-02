### Sandbox Isolation
Docker sandboxing isolates Layer 1 test execution, standardizing Python 3.12 and dependencies while restricting memory, CPU, and network calls.

### Cost Control
Setting hard spend caps in provider accounts prevents exponential token charges caused by runaway while loops or infinite retry chains.

### Key Security
Keys are kept in `.env` and injected into `os.environ`. `.gitignore` prevents accidental commit of secrets to GitHub.
