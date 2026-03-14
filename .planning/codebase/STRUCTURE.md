# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
[project-root]/
├── .github/              # GitHub configuration and CI/CD
├── .git/                 # Git repository data
├── images/               # Documentation images and assets
├── crewai_mcp_course/    # Course materials subdirectory
├── README.md             # Project catalog and landing page
├── AGENTS.md             # Development guidelines and conventions
├── CONTRIBUTION.md       # Contribution process documentation
├── LICENSE               # Repository license
└── SKILL.md              # (Additional skill configuration)
```

## Directory Purposes

**`.github/`:**
- Purpose: GitHub Actions and repository configuration
- Contains: Workflow definitions (Jekyll deployment)
- Key files: `.github/workflows/jekyll-gh-pages.yml`

**`.git/`:**
- Purpose: Git version control metadata
- Contains: Objects, refs, hooks, logs
- Generated: Yes (managed by git)
- Committed: No (in .gitignore by default)

**`images/`:**
- Purpose: Visual assets for documentation
- Contains: Industry use case images, diagrams
- Key files: `industry_usecase.png`, `AIAgentUseCase.jpg`

**`crewai_mcp_course/`:**
- Purpose: Educational course materials for CrewAI/MCP integration
- Contains: Lesson scripts, requirements, documentation
- Key files: `README.md`, `requirements.txt`, lesson scripts (lesson1_setup.py, etc.)

## Key File Locations

**Entry Points:**
- `README.md`: Project catalog and overview
- `AGENTS.md`: Development guidelines for contributors
- `CONTRIBUTION.md`: How to contribute new projects

**Configuration:**
- `.github/workflows/jekyll-gh-pages.yml`: CI/CD for GitHub Pages deployment

**Core Documentation:**
- `AGENTS.md`: Code style, naming conventions, testing patterns
- `CONTRIBUTION.md`: Project submission requirements
- `LICENSE`: MIT license

**Course Materials:**
- `crewai_mcp_course/README.md`: Course overview and getting started

## Naming Conventions

**Files:**
- lowercase: `README.md`, `AGENTS.md`, `CONTRIBUTION.md`
- snake_case for Python: `lesson1_setup.py`, `run_demo.py`

**Directories:**
- lowercase-hyphen: `crewai_mcp_course/`, `.github/`

**Course Lessons:**
- Pattern: `lesson{N}_{topic}.py` (e.g., `lesson1_setup.py`)

## Where to Add New Code

**New Agent Project:**
- Primary code: New folder at root level (not currently present in repository)
- Tests: `tests/` subdirectory within project folder
- Demo: `run_demo.py` within project folder

**New Course Module:**
- Implementation: `crewai_mcp_course/` directory
- Tests: Course uses runnable Python scripts as examples

## Special Directories

**`.github/workflows/`:**
- Purpose: CI/CD pipeline definitions
- Generated: Yes (by GitHub Actions)
- Committed: Yes

**`crewai_mcp_course/`:**
- Purpose: Educational content
- Generated: No
- Committed: Yes

**Note on Project Folders:**
- Individual agent projects would be added as separate folders at root level
- Each project follows the structure defined in AGENTS.md:
  ```
  project-name/
  ├── README.md
  ├── LICENSE
  ├── requirements.txt
  ├── run_demo.py
  ├── tests/
  ├── metadata.yaml
  └── download.sh (optional)
  ```

---

*Structure analysis: 2026-03-15*