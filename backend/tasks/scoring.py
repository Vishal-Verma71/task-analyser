from datetime import date
HOLIDAYS = [
    "2025-01-26",  # Republic Day
    "2025-08-15",  # Independence Day
    "2025-10-02",  # Gandhi Jayanti
]


from datetime import timedelta
# Learning weights – start at neutral (1.0)
LEARNING_WEIGHTS = {
    "urgency": 1.0,
    "importance": 1.0,
    "effort": 1.0,
    "dependency": 1.0,
}

def get_learning_weights():
    return LEARNING_WEIGHTS

def update_learning_weights(feedback: str):
    """
    Very simple learning rule:
    - If feedback == 'helpful': slightly increase importance & urgency
    - If feedback == 'not_helpful': give more weight to effort (short tasks)
    """
    if feedback == "helpful":
        LEARNING_WEIGHTS["urgency"] += 0.05
        LEARNING_WEIGHTS["importance"] += 0.05
    elif feedback == "not_helpful":
        LEARNING_WEIGHTS["effort"] += 0.05
        # slightly reduce importance so it doesn't dominate
        LEARNING_WEIGHTS["importance"] = max(0.5, LEARNING_WEIGHTS["importance"] - 0.05)

    return LEARNING_WEIGHTS


def adjust_for_weekends_and_holidays(d):
    if not d:
        return None

    while True:
        # Saturday (5) or Sunday (6)
        if d.weekday() in (5, 6) or d.isoformat() in HOLIDAYS:
            d = d + timedelta(days=1)
        else:
            break

    return d


def compute_urgency(due_date: date | None) -> float:
    if not due_date:
        return 5.0

    due_date = adjust_for_weekends_and_holidays(due_date)
    today = date.today()
    days_left = (due_date - today).days

    if days_left <= 0:
        return 10.0
    if days_left <= 3:
        return 9.5
    elif days_left <= 7:
        return 8.0
    elif days_left <= 14:
        return 6.5
    elif days_left <= 30:
        return 4.0
    else:
        return 2.0



def compute_effort_score(estimated_hours: float | None) -> float:
    if estimated_hours is None:
        return 5.0  # neutral

    if estimated_hours <= 1:
        return 10.0  # quick tasks get high score
    if estimated_hours >= 8:
        return 2.0   # long tasks get low score

    # gradual decrease from 10 → 2
    return 10.0 - (estimated_hours - 1)


def compute_dependency_score(num_dependents: int) -> float:
    if num_dependents == 0:
        return 3.0
    if num_dependents >= 5:
        return 10.0  # if 5 tasks depend on this, it's critical

    return 3.0 + num_dependents * 1.5


def get_priority_label(score: float) -> str:
    if score >= 8.0:
        return "High"
    if score >= 5.0:
        return "Medium"
    
    return "Low"


def score_task(task: dict, num_dependents: int, strategy: str = "smart_balance"):
    importance = task.get("importance", 5)
    due_date = task.get("due_date")
    estimated_hours = task.get("estimated_hours")

    urgency = compute_urgency(due_date)
    effort_score = compute_effort_score(estimated_hours)
    dependency_score = compute_dependency_score(num_dependents)

    # Different weight for each strategy
    if strategy == "fastest_wins":
        w_u, w_i, w_e, w_d = 0.2, 0.2, 0.5, 0.1
    elif strategy == "high_impact":
        w_u, w_i, w_e, w_d = 0.2, 0.6, 0.1, 0.1
    elif strategy == "deadline_driven":
        w_u, w_i, w_e, w_d = 0.6, 0.2, 0.1, 0.1
    else:  # default = smart balance
        w_u, w_i, w_e, w_d = 0.4, 0.4, 0.1, 0.1

        # Apply learning weights (only for smart_balance; others unchanged)
    if strategy == "smart_balance":
        lw = get_learning_weights()
        w_u *= lw["urgency"]
        w_i *= lw["importance"]
        w_e *= lw["effort"]
        w_d *= lw["dependency"]
    

    # weighted average score
    score = (
        w_u * urgency +
        w_i * importance +
        w_e * effort_score +
        w_d * dependency_score
    ) / (w_u + w_i + w_e + w_d)

    explanation = (
        f"Urgency={urgency:.1f}, Importance={importance}, EffortScore={effort_score:.1f}, "
        f"Blocks {num_dependents} tasks, Strategy={strategy}."
    )

    priority = get_priority_label(score)

    return score, explanation, priority, urgency




def detect_cycles(tasks):
    """Detect circular dependencies using DFS."""
    graph = {t["id"]: t.get("dependencies", []) for t in tasks}
    visited = set()
    stack = set()
    cycle_nodes = set()

    def dfs(node):
        if node in stack:
            cycle_nodes.add(node)
            return True
        if node in visited:
            return False
        
        visited.add(node)
        stack.add(node)

        for dep in graph.get(node, []):
            if dfs(dep):
                cycle_nodes.add(node)

        stack.remove(node)
        return node in cycle_nodes

    for i in graph:
        dfs(i)

    return list(cycle_nodes)
