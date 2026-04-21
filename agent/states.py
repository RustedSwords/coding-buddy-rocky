"""Pydantic models for agent state management.

This module defines the data structures that flow through the agent workflow:
- File: Represents a file to be created
- Plan: Project structure and requirements from the Planner
- ImplementationTask: Individual coding task from the Architect
- TaskPlan: Ordered list of implementation tasks
- CoderState: State tracking for the Coder agent's progress
"""

from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class File(BaseModel):
    """Represents a file in the project structure.
    
    Attributes:
        path: File path relative to project root (e.g., 'src/index.js')
        purpose: Description of what this file contains or does
    """
    path: str = Field(description="The path to the file to be created or modified, e.g. 'src/index.js'")
    purpose: str = Field(description="The purpose of the file, e.g. 'main application logic', 'data processing module', etc.")


class Plan(BaseModel):
    """Complete project plan from the Planner agent.
    
    Attributes:
        name: Project name
        description: One-line project description
        techstack: Comma-separated list of technologies to use
        features: List of features to implement
        files: List of files to create with their purposes
    """
    name: str = Field(description="The name of app to be built")
    description: str = Field(description="A oneline description of the app to be built, e.g. 'A web application for managing personal finances'")
    techstack: str = Field(description="The tech stack to be used for the app, e.g. 'python', 'javascript', 'react', 'flask', etc.")
    features: list[str] = Field(description="A list of features that the app should have, e.g. 'user authentication', 'data visualization', etc.")
    files: list[File] = Field(description="A list of files to be created, each with a 'path' and 'purpose'")


class ImplementationTask(BaseModel):
    """A single implementation task to be performed by the Coder agent.
    
    Attributes:
        filepath: Path to the file being created/modified
        task_description: Detailed description of what to implement, including
            variable names, function signatures, dependencies, and integration details
    """
    filepath: str = Field(description="The path to the file to be modified")
    task_description: str = Field(description="A detailed description of the task to be performed on the file, e.g. 'add user authentication', 'implement data processing logic', etc.")


class TaskPlan(BaseModel):
    """Ordered list of implementation tasks from the Architect agent.
    
    Attributes:
        implementation_steps: List of ImplementationTask objects in dependency order
        model_config: Allows extra fields for flexibility
    """
    implementation_steps: list[ImplementationTask] = Field(description="A list of steps to be taken to implement the task")
    model_config = ConfigDict(extra="allow")


class CoderState(BaseModel):
    """Tracks the Coder agent's execution progress.
    
    Attributes:
        task_plan: The TaskPlan to execute
        current_step_idx: Index of the current implementation step (0-based)
        current_file_content: Optional content of the file being edited
    """
    task_plan: TaskPlan = Field(description="The plan for the task to be implemented")
    current_step_idx: int = Field(0, description="The index of the current step in the implementation steps")
    current_file_content: Optional[str] = Field(
        None, description="The content of the file currently being edited or created"
    )