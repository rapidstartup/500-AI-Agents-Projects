# Testing Patterns

**Analysis Date:** 2026-03-15

## Repository Type

This is a **documentation collection repository** containing 500+ AI agent use cases. Testing patterns are documented as guidelines for contributors to follow when adding new projects.

---

## Test Framework

**Recommended Framework:**
- pytest (Python)

**Installation:**
```bash
pip install pytest
```

**Run Commands:**
```bash
pytest tests/              # Run all tests
python -m pytest tests/ -v # Run with verbose output

# Run specific test
pytest tests/test_specific.py::test_function_name -v

# Run tests matching pattern
pytest -k "test_pattern" -v

# Run with coverage
pytest --cov=src --cov-report=html

# Stop on first failure
pytest -x
```

---

## Test File Organization

**Location:**
- Tests should be in a `tests/` directory at project root
- Co-located with source code is not required but preferred for small projects

**Naming Pattern:**
- `test_<module_name>.py` for test files
- Test classes: `Test<ClassName>`
- Test functions: `test_<description>`

**Structure:**
```
project-name/
├── tests/
│   ├── __init__.py
│   ├── test_agent.py
│   ├── test_utils.py
│   └── test_integration.py
└── src/
    ├── agent.py
    └── utils.py
```

---

## Test Structure

**Basic Test Pattern:**
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
    
    def test_agent_with_invalid_input(self):
        agent = Agent(name="test")
        with pytest.raises(ValueError):
            agent.predict(None)
```

---

## Test Types

**Unit Tests:**
- Test individual functions and methods
- Mock external dependencies
- Fast execution (<1 second each)
- Located in `tests/test_*.py` files

**Integration Tests:**
- Test interactions between components
- May use real external services (with mocks for API keys)
- Located in `tests/test_integration.py`

**Smoke Tests:**
- Quick sanity checks for CI
- Test basic functionality end-to-end
- Should complete in <2 minutes

---

## Mocking

**Framework:**
- pytest-mock or unittest.mock

**Patterns:**
```python
import pytest
from unittest.mock import Mock, patch

class TestAgent:
    @patch('my_agent.external_api.call')
    def test_with_mocked_api(self, mock_api):
        mock_api.return_value = {"result": "expected"}
        agent = Agent()
        result = agent.process()
        assert result == "expected"
    
    def test_with_mock_object(self):
        mock_logger = Mock()
        agent = Agent(logger=mock_logger)
        agent.run()
        mock_logger.info.assert_called_once()
```

**What to Mock:**
- External API calls
- Database connections
- File system operations
- Time-consuming computations

**What NOT to Mock:**
- Core business logic being tested
- Simple utility functions

---

## Fixtures and Factories

**Using pytest fixtures:**
```python
import pytest

@pytest.fixture
def sample_agent():
    """Provide a test agent with default configuration."""
    from my_agent import Agent
    return Agent(name="test_agent", config={"timeout": 30})

@pytest.fixture
def mock_api_response():
    """Provide a mock API response."""
    return {
        "status": "success",
        "data": {"items": [1, 2, 3]}
    }

def test_agent_with_fixture(sample_agent):
    assert sample_agent.name == "test_agent"
```

**Factory Pattern:**
```python
class AgentFactory:
    @staticmethod
    def create_agent(**kwargs):
        defaults = {"name": "default", "timeout": 30}
        defaults.update(kwargs)
        return Agent(**defaults)

def test_factory_creates_valid_agent():
    agent = AgentFactory.create_agent(name="custom")
    assert agent.name == "custom"
    assert agent.timeout == 30
```

---

## Assertion Patterns

**Common Assertions:**
```python
# Equality
assert result == expected

# Type checking
assert isinstance(response, str)

# Truthiness
assert result is not None
assert len(items) > 0

# Exception testing
with pytest.raises(ValueError):
    agent.process(invalid_input)

# Mock assertions
mock_api.assert_called_once()
mock_api.assert_called_with(expected_args)
```

---

## Async Testing

**For async code:**
```python
import pytest
import asyncio

@pytest.mark.asyncio
async def test_async_agent():
    agent = AsyncAgent()
    result = await agent.process("input")
    assert result is not None
```

---

## Test Coverage

**Requirements:**
- No mandatory coverage target enforced at repository level
- Individual projects should define their own targets
- Recommend >80% coverage for core logic

**View Coverage:**
```bash
pytest --cov=src --cov-report=html
# Opens HTML report in browser
```

**Coverage Configuration (optional):**
```ini
# pytest.ini or pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=src --cov-report=term-missing"
```

---

## CI Integration

**GitHub Actions Workflow:**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run lint
        run: flake8 . --max-line-length=88
      - name: Run tests
        run: pytest tests/ -v
```

**Recommendations:**
- Run lint before tests
- Heavy training jobs should be optional or gated
- Use small inputs for CI smoke tests

---

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Deterministic Tests**: Use seeds for random operations
3. **Clear Test Names**: Name describes what is being tested
4. **One Assertion Focus**: Each test should verify one behavior
5. **Fast Execution**: Keep unit tests quick (<1s each)
6. **Smoke Tests**: Include quick sanity check for CI

---

## Running Tests

**Quick Reference:**
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific file
pytest tests/test_agent.py

# Run matching pattern
pytest -k "test_agent"

# Run with coverage
pytest --cov=src --cov-report=html

# Stop on first failure
pytest -x

# Show local variables in failures
pytest -l

# Run in parallel (if pytest-xdist installed)
pytest -n auto
```

---

*Testing analysis: 2026-03-15*
