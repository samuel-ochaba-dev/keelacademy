# Environment Architecture and Security Synthesis

## 1. Containerized Sandbox Environments
Running automated grading in isolated Docker containers guarantees that code executes against a clean Debian Bookworm image with Python 3.12, Pytest, and Pydantic v2. This eliminates "works on my machine" divergence, enforces strict resource caps (2 CPUs, 2GB RAM, 60-second timeouts), and isolates tests from external network access.

## 2. Hard Spend Limit Safeguards
When developing agentic loops and prompt pipelines, a logic bug in a while loop or unhandled retry logic can trigger recursive API invocations. Setting a hard monthly spend ceiling (such as $15/month) on OpenAI or Anthropic ensures that calls are rejected automatically when the limit is reached, preventing catastrophic financial loss.

## 3. API Key Management Discipline
API keys must never be hardcoded in scripts or committed to source control. They should be loaded dynamically from system environment variables (such as `os.environ.get("OPENAI_API_KEY")`) and local `.env` files must be strictly excluded via `.gitignore`.
