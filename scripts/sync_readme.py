#!/usr/bin/env python3
"""
sync_readme.py - Regenerate README.md tables from data/agents.json

Usage:
    python scripts/sync_readme.py

This script reads the canonical agents.json data file and regenerates
the markdown tables in README.md between marker comments. Everything
outside the markers is preserved.

Marker format in README.md:
    <!-- AGENT_TABLE_START -->
    ... generated content ...
    <!-- AGENT_TABLE_END -->
"""

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = REPO_ROOT / "data" / "agents.json"
README_FILE = REPO_ROOT / "README.md"

START_MARKER = "<!-- AGENT_TABLE_START -->"
END_MARKER = "<!-- AGENT_TABLE_END -->"


def load_agents() -> list[dict]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def github_badge(url: str, url_type: str) -> str:
    if url_type == "notebook":
        return (
            f"[![Notebook](https://img.shields.io/badge/View-Notebook-blue"
            f"?logo=jupyter)]({url})"
        )
    return (
        f"[![GitHub](https://img.shields.io/badge/Code-GitHub-black"
        f"?logo=github)]({url})"
    )


def generate_general_table(agents: list[dict]) -> str:
    lines = [
        "## Use Case Table\n",
        "| Use Case | Industry | Description | Code |",
        "| --- | --- | --- | --- |",
    ]
    for a in agents:
        badge = github_badge(a["url"], a["urlType"])
        lines.append(
            f"| **{a['name']}** | {a['industry']} | {a['description']} | {badge} |"
        )
    return "\n".join(lines)


def generate_framework_section(framework: str, agents: list[dict]) -> str:
    lines = [f'### **Framework Name**: **{framework}**\n']

    categories = []
    seen = set()
    for a in agents:
        cat = a.get("category", "")
        if cat and cat not in seen:
            seen.add(cat)
            categories.append(cat)

    if not categories:
        categories = [""]

    for cat in categories:
        cat_agents = [a for a in agents if a.get("category", "") == cat]
        if not cat_agents:
            continue

        if cat:
            lines.append(f"> **{cat}**\n")

        lines.append("| Use Case | Industry | Description | Link |")
        lines.append("| --- | --- | --- | --- |")

        for a in cat_agents:
            badge = github_badge(a["url"], a["urlType"])
            lines.append(
                f"| **{a['name']}** | {a['industry']} "
                f"| {a['description']} | {badge} |"
            )
        lines.append("")

    return "\n".join(lines)


def generate_tables(agents: list[dict]) -> str:
    general = [a for a in agents if a["framework"] == "General"]
    framework_agents = [a for a in agents if a["framework"] != "General"]

    frameworks = []
    seen = set()
    for a in framework_agents:
        if a["framework"] not in seen:
            seen.add(a["framework"])
            frameworks.append(a["framework"])

    sections = []
    sections.append(generate_general_table(general))
    sections.append("\n## Framework wise Usecases\n\n---\n")

    for fw in frameworks:
        fw_agents = [a for a in framework_agents if a["framework"] == fw]
        sections.append(generate_framework_section(fw, fw_agents))

    return "\n".join(sections)


def sync_readme():
    if not DATA_FILE.exists():
        print(f"Error: {DATA_FILE} not found", file=sys.stderr)
        sys.exit(1)

    agents = load_agents()
    generated = generate_tables(agents)

    if not README_FILE.exists():
        print(f"Error: {README_FILE} not found", file=sys.stderr)
        sys.exit(1)

    readme = README_FILE.read_text(encoding="utf-8")

    if START_MARKER in readme and END_MARKER in readme:
        pattern = re.compile(
            re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
            re.DOTALL,
        )
        new_content = f"{START_MARKER}\n\n{generated}\n\n{END_MARKER}"
        readme = pattern.sub(new_content, readme)
    else:
        print(
            f"Warning: Markers not found in README.md.\n"
            f"Add these markers where you want the tables inserted:\n"
            f"  {START_MARKER}\n"
            f"  {END_MARKER}\n"
            f"\nSkipping README update.",
            file=sys.stderr,
        )
        sys.exit(0)

    README_FILE.write_text(readme, encoding="utf-8")
    print(f"README.md updated with {len(agents)} agents across "
          f"{len(set(a['framework'] for a in agents))} frameworks.")


if __name__ == "__main__":
    sync_readme()
