# MASTRA Job Posting Generator

**Framework Source:** CrewAI  
**Conversion Pattern:** Single Agent (Template A)  
**Complexity:** Low

## Overview

This is a MASTRA conversion of the CrewAI Job Posting Generator agent. It creates professional job postings from job requirements.

## Source

Original: [CrewAI Job Posting Generator](https://github.com/crewAIInc/crewAI-examples/tree/main/crews/job-posting)

## What It Does

Generates well-structured, professional job postings including:
- Job title and company overview
- Position summary
- Key responsibilities
- Required and preferred qualifications
- Benefits and perks
- Application instructions

## Running

```bash
# Install dependencies
npm install

# Copy env file and add your API key
cp .env.example .env
# Edit .env and add OPENAI_API_KEY

# Run demo
npm run demo
```

## Architecture

- **Agent:** Single job posting generator agent
- **Pattern:** Template A (Simple single agent)
- **Model:** openai/gpt-4o
