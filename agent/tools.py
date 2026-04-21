"""File I/O and system tools for the Coder agent.

This module provides sandboxed file operations that constrain all file access to a
project root directory. This prevents the AI agent from accidentally writing outside
the intended project scope.

Tools:
    - write_file: Create or update files
    - read_file: Read file contents
    - get_current_directory: Get the project root path
    - list_files: List files in a directory
    - run_cmd: Execute shell commands
"""

import pathlib
import subprocess
from typing import Tuple

from langchain_core.tools import tool

# Project root directory where all generated files are stored
PROJECT_ROOT = pathlib.Path.cwd() / "generated_project"


def safe_path_for_project(path: str) -> pathlib.Path:
    """Validate and resolve a file path within the project root.
    
    This function ensures all file operations stay within PROJECT_ROOT,
    preventing the agent from accessing files outside the project.
    
    Args:
        path: Relative or absolute file path
        
    Returns:
        Resolved Path object within PROJECT_ROOT
        
    Raises:
        ValueError: If path attempts to escape PROJECT_ROOT
    """
    p = pathlib.Path(path)
    if not p.is_absolute():
        p = PROJECT_ROOT / p
    p = p.resolve()
    try:
        p.relative_to(PROJECT_ROOT.resolve())
    except ValueError:
        raise ValueError("Attempt to write outside project root")
    return p


@tool
def write_file(path: str, content: str) -> str:
    """Write content to a file.
    
    Creates parent directories as needed. File path must be within PROJECT_ROOT.
    
    Args:
        path: Relative path within project root
        content: Content to write to the file
        
    Returns:
        Status message with the written file path
    """
    p = safe_path_for_project(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    return f"WROTE:{p}"


@tool
def read_file(path: str) -> str:
    """Read content from a file.
    
    Returns empty string if file doesn't exist. File path must be within PROJECT_ROOT.
    
    Args:
        path: Relative path within project root
        
    Returns:
        File contents as string, or empty string if file not found
    """
    p = safe_path_for_project(path)
    if not p.exists():
        return ""
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


@tool
def get_current_directory() -> str:
    """Get the project root directory path.
    
    Returns:
        Absolute path to PROJECT_ROOT as string
    """
    return str(PROJECT_ROOT)


@tool
def list_files(directory: str = ".") -> str:
    """List all files in a directory recursively.
    
    Args:
        directory: Relative path within project root (defaults to project root)
        
    Returns:
        Newline-separated list of file paths, or error message if not a directory
    """
    p = safe_path_for_project(directory)
    if not p.is_dir():
        return f"ERROR: {p} is not a directory"
    files = [str(f.relative_to(PROJECT_ROOT)) for f in p.glob("**/*") if f.is_file()]
    return "\n".join(files) if files else "No files found."

@tool
def run_cmd(cmd: str, cwd: str = None, timeout: int = 30) -> Tuple[int, str, str]:
    """Execute a shell command in the project directory.
    
    Args:
        cmd: Shell command to execute
        cwd: Working directory (relative to project root, defaults to PROJECT_ROOT)
        timeout: Command timeout in seconds (defaults to 30)
        
    Returns:
        Tuple of (return_code, stdout, stderr)
    """
    cwd_dir = safe_path_for_project(cwd) if cwd else PROJECT_ROOT
    res = subprocess.run(cmd, shell=True, cwd=str(cwd_dir), capture_output=True, text=True, timeout=timeout)
    return res.returncode, res.stdout, res.stderr


def init_project_root():
    """Initialize the project root directory.
    
    Creates the directory if it doesn't exist.
    
    Returns:
        Absolute path to PROJECT_ROOT as string
    """
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    return str(PROJECT_ROOT)