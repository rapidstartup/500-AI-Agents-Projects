# Coding Conventions

**Analysis Date:** 2026-03-15

## Repository Type

This is a **documentation collection repository** containing 500+ AI agent use cases, templates, and demos. It aggregates external projects rather than containing a monolithic codebase. Conventions are documented for contributor guidance.

---

## Naming Patterns

**Files:**
- Pattern: lowercase-hyphen (kebab-case)
- Example: `data-processor.py`, `my-agent/`, `quick-chatbot-agent`

**Functions:**
- Pattern: snake_case
- Example: `def get_user_data()`, `def process_items()`

**Variables:**
- Pattern: snake_case
- Example: `user_name`, `max_retries`, `api_response`

**Classes:**
- Pattern: PascalCase
- Example: `class DataProcessor`, `class AgentRunner`

**Constants:**
- Pattern: UPPER_SNAKE_CASE
- Example: `MAX_RETRY_COUNT = 3`, `DEFAULT_TIMEOUT = 30`

**Private Variables:**
- Pattern: prefix underscore
- Example: `_private_var`, `_internal_state`

**Directories/Folders:**
- Pattern: lowercase, hyphen-separated
- Example: `multi-agent-pursuit`, `llm-templates`

---

## Code Style

**Formatting:**
- Tool: Black
- Line length: 88 characters (Black default)
- Indentation: 4 spaces (no tabs)

**Linting:**
- Tool: flake8
- Command: `flake8 . --max-line-length=88`

**Import Sorting:**
- Tool: isort
- Command: `isort .`

**Type Checking:**
- Tool: mypy or pyright (Python 3.9+)

**Full Check Command:**
```bash
pylint . && mypy . && black --check .
```

---

## Import Organization

**Order:**
1. Standard library first
2. Third-party imports
3. Local imports (relative)

```python
# Standard library first
import os
import sys
from typing import Optional, List, Dict, Any

# Third-party imports
import numpy as np
import pandas as pd
from crewai import Agent, Task, Crew

# Local imports
from .utils import helper_function
from .models import DataModel
```

---

## Type Annotations

**Preferred Pattern:**
```python
# Inline type hints
def process_data(items: List[Dict[str, Any]]) -> Dict[str, int]:
    ...

# Use Optional for nullable
def get_config(key: str) -> Optional[str]:
    ...

# Use Any sparingly
def transform(obj: Any) -> Any:
    ...
```

---

## Error Handling

**Required Pattern:**
```python
# Use specific exceptions - never catch all
try:
    result = api.call()
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")
    raise
except ValueError as e:
    logger.warning(f"Invalid input: {e}")
    return None

# NEVER silently catch all exceptions
# Don't do: except: pass
```

**Guidelines:**
- Catch specific exceptions only
- Log errors with appropriate level
- Re-raise after logging when appropriate
- Return None only for expected failure cases

---

## Documentation

**Docstrings:**
Use Google-style or NumPy-style docstrings:

```python
def train_agent(
    model: str,
    episodes: int = 100,
    verbose: bool = True
) -> TrainingResult:
    """Train an agent with the specified configuration.

    Args:
        model: Model architecture to use
        episodes: Number of training episodes (default: 100)
        verbose: Whether to print progress (default: True)

    Returns:
        TrainingResult containing metrics and checkpoints

    Raises:
        ValueError: If model is not supported
        RuntimeError: If training fails
    """
```

**When to Document:**
- Complex algorithms require short docstrings and references
- Every public function should have a docstring
- Include usage examples for non-trivial functions

---

## Function Design

**Size Guidelines:**
- Keep functions focused and single-purpose
- Maximum recommended length: 50 lines
- Break complex functions into smaller helpers

**Parameters:**
- Use type hints for all parameters
- Use Optional for parameters with defaults
- Group related parameters into dataclasses when appropriate

**Return Values:**
- Always specify return type annotations
- Document None returns clearly

---

## Module Design

**Exports:**
- Explicit exports only (not wildcard)
- Use `__all__` to define public API

**Barrel Files:**
- Use `__init__.py` for package exports
- Group related imports for cleaner imports

---

## Project Structure Conventions

**Required Files Per Project:**
```
project-name/
├── README.md              # Description, quick start, expected output
├── LICENSE                # Or reference root LICENSE
├── requirements.txt       # Or pyproject.toml / environment.yml
├── run_demo.py            # Minimal runnable example
├── tests/                 # Unit tests or smoke tests
├── metadata.yaml          # Project metadata
└── download.sh (optional) # For external models/datasets
```

---

## General Principles

1. **Reproducibility First**: Include exact dependency versions, seeds, and environment variables
2. **Minimal Examples**: Provide runnable demos that complete in <10 minutes on modest hardware
3. **Documentation**: Every project needs a README with quick start and expected output
4. **Testing**: Include unit tests or smoke tests where possible

---

## Security Guidelines

- Never commit secrets, API keys, or tokens
- Use environment variables for sensitive config
- Never commit large model weights (>100MB) directly
- Use `.gitignore` to exclude sensitive files

---

*Convention analysis: 2026-03-15*
