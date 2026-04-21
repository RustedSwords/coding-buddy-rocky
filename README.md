# 🚀 Meet Rocky The Coding Buddy

**Rocky** is an AI-powered multi-agent system that transforms natural language project descriptions into fully functional, working code projects. Built with [LangGraph](https://github.com/langchain-ai/langgraph), it works like having a complete development team that understands your vision and builds it from scratch—file by file.

<table>
  <tr>
    <td align="center">
      <video src="calculator.mkv" controls width="400"></video>
    </td>
    <td align="center">
      <video src="todo-list.mkv" controls width="400"></video>
    </td>
  </tr>
</table>

## 🏗️ Architecture

Rocky operates as a coordinated three-agent development pipeline:

- **Planner Agent** – Analyzes your project request and generates a detailed, structured project plan including tech stack, features, and file organization.
- **Architect Agent** – Breaks down the project plan into concrete, implementation-ready tasks with clear dependencies and integration details.
- **Coder Agent** – Executes each task, writes actual code directly into files, and handles complex development workflows just like a real developer would.

<div style="text-align: center;">
    <img src="resources/architecture.png" alt="Coder Agent Architecture" width="90%"/>
</div>

## 🚀 Getting Started

### Prerequisites

Before using Rocky, ensure you have:
- **Python 3.8+** installed on your system
- **Ollama** installed and running locally with the `qwen3-coder-next:cloud` model available
  - Install Ollama: [ollama.com](https://ollama.com)
  - Pull the model: `ollama pull qwen3-coder-next:cloud`
- **Required dependencies** as listed in `pyproject.toml`

### ⚙️ Installation and Startup

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd "Rocky - Coding Buddy"
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r pyproject.toml
   ```

4. **Ensure Ollama is running**:
   ```bash
   ollama serve
   ```
   (Run this in a separate terminal)

5. **Start Rocky**:
   ```bash
   python main.py
   ```

6. **Enter your project prompt** when prompted:
   ```
   Enter your project prompt: Create a to-do list application using HTML, CSS, and JavaScript
   ```

### 🧪 Example Prompts

Try these example prompts to see Rocky in action:

- "Create a to-do list application using HTML, CSS, and JavaScript"
- "Create a simple calculator web application"
- "Create a simple blog API in FastAPI with a SQLite database"
- "Build a weather dashboard that fetches data from an API"

## 📂 Generated Projects

Rocky automatically creates project directories with your generated code. Current examples include:

- `generated_calculator_project/` – A working calculator web app
- `generated_todo-list_project/` – A fully functional to-do list
- `generated_grocery-list_project/` – A grocery list manager

## 🛠️ Project Structure

```
Rocky - Coding Buddy/
├── main.py                 # Entry point for the application
├── agent/
│   ├── graph.py           # Multi-agent workflow orchestration
│   ├── prompts.py         # LLM prompt templates for each agent
│   ├── states.py          # State definitions for the agentic workflow
│   ├── tools.py           # Available tools for code generation
│   └── __init__.py
├── generated_project/            # Output directories for generated projects
└── README.md
```

## 💡 How It Works

1. **User Input** – You provide a natural language description of what you want to build
2. **Planning Phase** – The Planner agent analyzes your request and creates a comprehensive project plan
3. **Architecture Phase** – The Architect breaks down the plan into specific, actionable implementation tasks
4. **Coding Phase** – The Coder agent executes each task, writing real code into actual project files
5. **Output** – A complete, functional project directory is generated in `generated_<project-name>/`

## 🔧 Customization

You can customize Rocky's behavior by:
- Modifying the LLM model in `agent/graph.py` (currently uses `qwen3-coder-next:cloud`)
- Adjusting the recursion limit when running: `python main.py --recursion-limit 200`
- Fine-tuning the prompt templates in `agent/prompts.py`

## 📝 License

This project is built on modern AI frameworks including LangGraph and LangChain. See individual dependency licenses for details.
