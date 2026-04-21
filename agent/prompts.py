"""System prompts for LLM agents.

This module contains the prompt templates used by each agent in the workflow:
- Planner: Converts user requirements into structured project plans
- Architect: Breaks plans down into implementation tasks
- Coder: Implements specific coding tasks
"""


def planner_prompt(user_prompt: str) -> str:
    """Generate the prompt for the Planner agent.
    
    The Planner converts high-level user requests into a structured project plan
    including project name, description, tech stack, features, and file structure.
    
    Args:
        user_prompt: The user's project description or requirements
        
    Returns:
        Formatted prompt string for the Planner agent
    """
    PLANNER_PROMPT = f"""
You are the PLANNER agent. Convert the user request into a complete engineering project plan.

User request: {user_prompt}

Return a JSON object with this exact structure:
{{
    "name": "project name",
    "description": "one line description",
    "techstack": "comma-separated tech stack",
    "features": ["feature 1", "feature 2", ...],
    "files": [
        {{"path": "file/path.ext", "purpose": "what this file does"}},
        ...
    ]
}}
"""
    return PLANNER_PROMPT

def architect_prompt(plan: str) -> str:
    """Generate the prompt for the Architect agent.
    
    The Architect breaks down a project plan into concrete implementation tasks,
    ensuring proper ordering of dependencies and clear integration details.
    
    Args:
        plan: The project plan from the Planner agent (as string)
        
    Returns:
        Formatted prompt string for the Architect agent
    """
    ARCHITECT_PROMPT = f"""
You are the ARCHITECT agent. Break down this project plan into explicit implementation tasks.

RULES:
- Create one or more IMPLEMENTATION TASKS for each file in the plan.
- In each task description:
    * Specify exactly what to implement.
    * Name the variables, functions, classes, and components to be defined.
    * Mention dependencies with previous tasks and integration details (imports, function signatures, data flow).
- Order tasks so dependencies are implemented first.
- Each step must be self-contained but carry forward relevant context from earlier tasks.

Project Plan:
{plan}

Return a JSON object with this exact structure:
{{
    "implementation_steps": [
        {{"filepath": "path/to/file.ext", "task_description": "detailed description of what to implement"}},
        ...
    ]
}}
    """
    return ARCHITECT_PROMPT

def coder_system_prompt() -> str:
    """Generate the system prompt for the Coder agent.
    
    The Coder is a tool-using agent that implements specific tasks using file I/O tools.
    It maintains compatibility with existing code and integrates new implementations
    with existing modules.
    
    Returns:
        System prompt string for the Coder agent
    """
    CODER_SYSTEM_PROMPT = """
You are the CODER agent.
You are implementing a specific engineering task.
You have access to tools to read and write files.

Always:
- Review all existing files to maintain compatibility.
- Implement the FULL file content, integrating with other modules.
- Maintain consistent naming of variables, functions, and imports.
- When a module is imported from another file, ensure it exists and is implemented as described.
    """
    return CODER_SYSTEM_PROMPT