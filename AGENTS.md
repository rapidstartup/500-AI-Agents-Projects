# AGENTS.md - Guidelines for AI Agent Projects Repository

This repository is a curated collection of 500+ AI agent use cases across industries. It aggregates external projects, templates, and demos rather than being a single monolithic codebase.

## Repository Structure

- Root level contains README.md, CONTRIBUTION.md, and LICENSE
- Individual agent projects are added as separate folders (if contributed)
- The `.github/workflows/` folder contains CI configurations
- The `crewai_mcp_course/` subdirectory contains course materials

---

## Build, Test, and Development Commands

Since this is a collection of external projects, there are no unified build/lint/test commands at the repository root. Each contributed project should include its own commands.

### For Individual Projects

Each agent project folder should follow these conventions:

```bash
# Python projects - install dependencies
pip install -r requirements.txt

# Python projects - run demo
python run_demo.py

# Python projects - run tests (if available)
pytest tests/           # or
python -m pytest tests/ -v

# Run a single test
pytest tests/test_specific.py::test_function_name -v

# Run tests matching a pattern
pytest -k "test_pattern" -v
```

### Linting (per-project recommendation)

```bash
# Python linting
flake8 . --max-line-length=88
black .
isort .

# Type checking
mypy .
pyright

# All checks
pylint . && mypy . && black --check .
```

---

## Code Style Guidelines

### General Principles

1. **Reproducibility First**: Include exact dependency versions, seeds, and environment variables
2. **Minimal Examples**: Provide runnable demos that complete in <10 minutes on modest hardware
3. **Documentation**: Every project needs a README with quick start and expected output
4. **Testing**: Include unit tests or smoke tests where possible

### Python Style (PEP 8 +)

- Use Black for formatting (line length: 88 characters)
- Use isort for import sorting
- Use flake8 for linting
- Use type hints where beneficial (Python 3.9+)
- Maximum line length: 88 characters (Black default)
- Use 4 spaces for indentation (no tabs)

### Import Conventions

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

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `user_name`, `max_retries` |
| Functions | snake_case | `def get_user_data()` |
| Classes | PascalCase | `class DataProcessor` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT = 3` |
| Files/folders | lowercase-hyphen | `data-processor.py`, `my-agent/` |
| Private vars | prefix underscore | `_private_var` |

### Type Annotations

```python
# Preferred: Inline type hints
def process_data(items: List[Dict[str, Any]]) -> Dict[str, int]:
    ...

# Use Optional for nullable
def get_config(key: str) -> Optional[str]:
    ...

# Use Any sparingly
def transform(obj: Any) -> Any:
    ...
```

### Error Handling

```python
# Use specific exceptions
try:
    result = api.call()
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")
    raise
except ValueError as e:
    logger.warning(f"Invalid input: {e}")
    return None

# Never silently catch all exceptions
# Don't do: except: pass
```

### Docstrings

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

---

## Project Metadata Requirements

Each contributed project must include:

```
project-name/
├── README.md              # Description, quick start, expected output
├── LICENSE                # Or reference root LICENSE
├── requirements.txt       # Or pyproject.toml / environment.yml
├── run_demo.py            # Minimal runnable example
├── tests/                 # Unit tests or smoke tests
├── metadata.yaml          # See below
└── download.sh (optional) # For external models/datasets
```

### Metadata Schema

```yaml
title: quick-chatbot-agent
author: Your Name <you@example.com>
language: python
tags:
  - llm
  - agent
  - crewai
license: MIT
datasets:
  - name: example-dialogs
    url: https://...
entrypoint: run_demo.py
requirements: requirements.txt
```

---

## Testing Guidelines

### Test Structure

```python
# tests/test_agent.py
import pytest
from my_agent import Agent

class TestAgent:
    def test_agent_initialization(self):
        agent = Agent(name="test")
        assert agent.name == "test"
    
    def test_agent_response(self):
        agent = Agent(name="test")
        response = agent.predict("hello")
        assert isinstance(response, str)
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run a specific test file
pytest tests/test_agent.py

# Run tests matching keyword
pytest -k "test_agent"

# Run with verbose output
pytest -v

# Stop on first failure
pytest -x
```

---

## Git Conventions

### Branch Naming

- `feat/<short-description>` - New features
- `fix/<short-description>` - Bug fixes
- `docs/<short-description>` - Documentation
- `refactor/<short-description>` - Code refactoring

### Commit Messages

```
feat: add new crewai agent template
fix: resolve path issue in download script  
docs: update README with new examples
test: add smoke tests for agent runner
```

---

## Security Considerations

- **Never commit secrets, API keys, or tokens**
- Use environment variables for sensitive config
- Never commit large model weights (>100MB) directly
- Use `.gitignore` to exclude sensitive files

---

## Ethical Guidelines

When contributing agent projects:

1. Include "Ethical considerations" section in README if agent interacts with people
2. State potential biases and failure modes
3. Clearly mark demos as "not production-ready" if they require human oversight
4. Avoid shipping models trained on non-consensual data

---

## Resources

- [CONTRIBUTION.md](./CONTRIBUTION.md) - Full contribution guidelines
- [README.md](./README.md) - Project catalog and use cases
