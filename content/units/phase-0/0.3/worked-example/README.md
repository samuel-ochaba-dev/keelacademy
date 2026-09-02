# Unit 0.3 worked example: environment and provider configuration

This worked example provides an annotated, reference-grade synthesis of environment containerization, spend limit configuration, and secret management.

---

## 1. Containerized Sandbox Environment Architecture

Containerized sandbox execution provides three vital guarantees:

1. **Deterministic Reproducibility:** Every execution begins from an identical, clean Debian image containing Python 3.12, Pytest, and Pydantic v2. Local system packages or dirty virtualenvs cannot alter test outcomes.
2. **Resource Boundaries:** Hard kernel limits (2 CPUs, 2GB RAM, 60-second execution cap) terminate infinite loops or memory leaks immediately.
3. **Network Isolation:** Sandbox containers cannot access the external internet during Layer-1 test runs, guaranteeing that tests cannot leak credentials or incur unexpected API charges.

*Why this passes:*
- Clear explanation of isolation, resource caps, and deterministic reproducibility.

---

## 2. Hard Billing Caps and API Security Discipline

### Spend Limit Safeguards
- Hard billing caps configured on the provider dashboard (e.g., $15/month limit).
- Soft notification alerts configured at 50% ($7.50) and 80% ($12.00) thresholds.
- Guaranteed automatic call rejection if recursive retry loops or unbounded agent cycles occur.

### Secret Management Standards
- API keys stored in local environment variables or uncommitted `.env` files.
- `.gitignore` explicitly excludes `.env`, `*.key`, and secret patterns.
- Scripts access credentials strictly via `os.environ.get("OPENAI_API_KEY")`.

*Why this passes:*
- Covers specific dashboard configurations and code patterns.
- Addresses the concrete risk of recursive API loops.

---

## 3. Environment Smoke Verification Script

```python
# test_environment_smoke.py
import os
import sys
import pydantic
import pytest

def test_python_version():
    assert sys.version_info >= (3, 11), f"Expected Python 3.11+, got {sys.version}"

def test_pydantic_v2():
    assert pydantic.__version__.startswith("2."), f"Expected Pydantic 2.x, got {pydantic.__version__}"

def test_environment_secret_separation():
    # Verify no secret is hardcoded in source
    with open(__file__, "r", encoding="utf-8") as f:
        content = f.read()
    assert "sk-" not in content, "Found hardcoded API key in test file!"
```
