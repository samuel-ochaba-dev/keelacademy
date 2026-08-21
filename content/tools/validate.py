#!/usr/bin/env python3
"""Validate content examples against the JSON schemas in content/schemas/.

Prints pass/fail per file; exits non-zero if any file does not match
expectations (valid examples must pass; *.invalid.yaml must fail).
"""
import datetime
import json
import sys
from pathlib import Path

import jsonschema
import yaml

ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"

# (schema, instance path relative to content/, must_pass)
CASES = [
    # S0.1 example instances
    ("unit.schema.json", "examples/unit.example.yaml", True),
    ("rubric.schema.json", "examples/rubric.example.yaml", True),
    ("variant.schema.json", "examples/variant.example.yaml", True),
    ("persona.schema.json", "examples/persona.example.yaml", True),
    ("unit.schema.json", "examples/unit.invalid.yaml", False),
    # S0.2 real golden-path unit content
    ("unit.schema.json", "units/phase-3/3.2.1/unit.yaml", True),
    ("rubric.schema.json", "rubrics/3.2.1.yaml", True),
]


def normalize(node):
    """YAML parses unquoted dates as datetime.date; JSON Schema wants strings."""
    if isinstance(node, datetime.date):
        return node.isoformat()
    if isinstance(node, dict):
        return {k: normalize(v) for k, v in node.items()}
    if isinstance(node, list):
        return [normalize(v) for v in node]
    return node


def main() -> int:
    failures = 0
    for schema_name, instance_path, must_pass in CASES:
        schema = json.loads((SCHEMAS / schema_name).read_text())
        instance = normalize(
            yaml.safe_load((ROOT / instance_path).read_text())
        )
        validator = jsonschema.Draft202012Validator(
            schema, format_checker=jsonschema.FormatChecker()
        )
        errors = sorted(validator.iter_errors(instance), key=lambda e: list(e.path))
        passed = not errors
        ok = passed == must_pass
        failures += not ok
        status = "PASS" if passed else "FAIL"
        print(f"{instance_path} vs {schema_name} [{status}]"
              f"{'  (expected invalid)' if not must_pass else ''}"
              f"{'' if ok else '  << UNEXPECTED'}")
        for err in errors:
            loc = "/".join(str(p) for p in err.path) or "<root>"
            print(f"    {loc}: {err.message}")
    if failures:
        print(f"\n{failures} unexpected result(s).")
        return 1
    print("\nAll results as expected.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
