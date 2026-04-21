"""Multi-agent AI system for code generation using LangGraph.

This module implements a three-stage agent workflow:
1. Planner: Converts user prompts into structured project plans
2. Architect: Breaks down plans into implementation tasks
3. Coder: Implements tasks using AI-powered code generation
"""

from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langgraph.constants import END
from langgraph.graph import StateGraph
from langchain.agents import create_agent

from .prompts import *
from .states import *
from .tools import *

_ = load_dotenv()

llm = ChatOllama(model="qwen3-coder-next:cloud", base_url="http://localhost:11434")

def planner_agent(state: dict) -> dict:
    """Convert user prompt into a structured project plan.
    
    Args:
        state: Dictionary containing "user_prompt" key
        
    Returns:
        Dictionary with "plan" key containing Plan object
    """
    user_prompt = state["user_prompt"]
    prompt = planner_prompt(user_prompt)
    
    structured_llm = llm.with_structured_output(Plan, method="json_mode")
    resp = structured_llm.invoke(prompt)
    
    if resp is None:
        raise ValueError("Planner agent failed to generate a project plan.")
    return {"plan": resp}

def architect_agent(state: dict) -> dict:
    """Break down project plan into implementation tasks.
    
    Args:
        state: Dictionary containing "plan" key with Plan object
        
    Returns:
        Dictionary with "task_plan" key containing TaskPlan object
    """
    plan: Plan = state["plan"]
    prompt = architect_prompt(str(plan))
    
    structured_llm = llm.with_structured_output(TaskPlan, method="json_mode")
    resp = structured_llm.invoke(prompt)
    
    if resp is None:
        raise ValueError("Architect agent failed to generate a task plan.")
    resp.plan = plan
    return {"task_plan": resp}

def coder_agent(state: dict) -> dict:
    """Implement code generation tasks using tool-calling agent.
    
    Args:
        state: Dictionary containing "task_plan" key and optional "coder_state" key
        
    Returns:
        Dictionary with "coder_state" key and optional "status" key when complete
    """
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)

    steps = coder_state.task_plan.implementation_steps
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}

    current_task = steps[coder_state.current_step_idx]
    existing_content = read_file.run(current_task.filepath)

    system_prompt = coder_system_prompt()
    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.filepath}\n"
        f"Existing content:\n{existing_content}\n"
        "Use write_file(path, content) to save your changes."
    )

    coder_tools = [read_file, write_file, list_files, get_current_directory]
    llm_with_tools = llm.bind_tools(coder_tools)
    react_agent = create_agent(llm_with_tools, coder_tools)

    react_agent.invoke({
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    })

    coder_state.current_step_idx += 1

    return {"coder_state": coder_state}


def build_agent():
    """Build and compile the multi-agent workflow graph.
    
    Returns:
        Compiled LangGraph agent
    """
    graph = StateGraph(dict)
    
    graph.add_node("planner", planner_agent)
    graph.add_node("architect", architect_agent)
    graph.add_node("coder", coder_agent)
    
    graph.add_edge(start_key="planner", end_key="architect")
    graph.add_edge(start_key="architect", end_key="coder")
    graph.add_conditional_edges(
        "coder",
        lambda state: "END" if state.get("status") == "DONE" else "coder",
        {"END": END, "coder": "coder"}
    )
    
    graph.set_entry_point("planner")
    return graph.compile()


# Initialize the agent at module level for use in main.py
agent = build_agent()


if __name__ == "__main__":
    agent = build_agent()
    user_prompt = "create a simple snake game using python and pygame"
    result = agent.invoke({"user_prompt": user_prompt}, config={"recursion_limit": 50})
    print(result)