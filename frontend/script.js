document.addEventListener("DOMContentLoaded", function () {

  /* ---------------------------------------
     GLOBAL STATE
  --------------------------------------- */
  let tasks = [];
  let nextId = 1;
  let results = [];
  let currentEditId = null;

  /* ---------------------------------------
     ELEMENT REFERENCES
  --------------------------------------- */
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");

  const analyzeBtn = document.getElementById("analyzeBtn");
  const suggestBtn = document.getElementById("suggestBtn");
  const strategySelect = document.getElementById("strategy");
  const resultsContainer = document.getElementById("resultsContainer");
  const clearAllBtn = document.getElementById("clearAllBtn");

  const graphBtn = document.getElementById("graphBtn");
  const matrixBtn = document.getElementById("matrixBtn");

  // Modals
  const addTaskModal = document.getElementById("addTaskModal");
  const openAddTaskBtn = document.getElementById("openAddTaskBtn");
  const closeAddTaskModal = document.getElementById("closeAddTaskModal");
  const cancelAddTask = document.getElementById("cancelAddTask");
  const dependencyList = document.getElementById("dependencyList");

  const editModal = document.getElementById("editModal");
  const closeModal = document.getElementById("closeModal");
  const editTitleInput = document.getElementById("edit_title");
  const editDueDateInput = document.getElementById("edit_due_date");
  const editHoursInput = document.getElementById("edit_estimated_hours");
  const editImportanceInput = document.getElementById("edit_importance");
  const editDepsInput = document.getElementById("edit_dependencies");
  const saveTaskBtn = document.getElementById("saveTaskBtn");

  const feedbackHelpfulBtn = document.getElementById("feedbackHelpfulBtn");
  const feedbackNotHelpfulBtn = document.getElementById("feedbackNotHelpfulBtn");

  /* ---------------------------------------
     MODAL OPEN/CLOSE
  --------------------------------------- */

  openAddTaskBtn.addEventListener("click", () => {
    renderDependencyOptions();        // build checkboxes based on current tasks
    addTaskModal.style.display = "flex";
  });

  closeAddTaskModal.addEventListener("click", () => {
    addTaskModal.style.display = "none";
  });

  cancelAddTask.addEventListener("click", () => {
    addTaskModal.style.display = "none";
  });

  closeModal.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === addTaskModal) addTaskModal.style.display = "none";
    if (e.target === editModal) editModal.style.display = "none";
  });

  /* ---------------------------------------
     BUILD DEPENDENCY CHECKBOX LIST
  --------------------------------------- */
  function renderDependencyOptions(selectedIds = []) {
    dependencyList.innerHTML = "";

    if (tasks.length === 0) {
      dependencyList.innerHTML =
        "<p class='field-help'>No other tasks yet. Create this task first.</p>";
      return;
    }

    tasks.forEach((t) => {
      const label = document.createElement("label");
      label.className = "dependency-item";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = t.id;
      if (selectedIds.includes(t.id)) cb.checked = true;

      const span = document.createElement("span");
      span.textContent = `Task #${t.id}: ${t.title}`;

      label.appendChild(cb);
      label.appendChild(span);
      dependencyList.appendChild(label);
    });
  }

  function getSelectedDependencyIds() {
    const checked = dependencyList.querySelectorAll("input[type='checkbox']:checked");
    return Array.from(checked).map((cb) => parseInt(cb.value));
  }

  /* ---------------------------------------
     ADD TASK (FORM SUBMIT)
  --------------------------------------- */
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTaskFromForm();
  });

  function addTaskFromForm() {
    const title = document.getElementById("title").value.trim();
    const due_date = document.getElementById("due_date").value || null;
    const hours = document.getElementById("estimated_hours").value;
    const estimated_hours = hours ? parseFloat(hours) : null;
    const imp = document.getElementById("importance").value;
    const importance = imp ? parseInt(imp) : 5;

    if (!title) {
      alert("Title is required");
      return;
    }

    const dependencies = getSelectedDependencyIds();

    const task = {
      id: nextId++,
      title,
      due_date,
      estimated_hours,
      importance,
      dependencies,
    };

    tasks.push(task);
    renderTaskList();
    taskForm.reset();
    addTaskModal.style.display = "none";
  }

  /* ---------------------------------------
     RENDER TASK LIST (cards)
  --------------------------------------- */
  function renderTaskList() {
    taskList.innerHTML = "";

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-card-item";

      // LEFT SIDE
      const left = document.createElement("div");
      left.className = "task-left";

      const header = document.createElement("div");
      header.className = "task-header";

      const idSpan = document.createElement("span");
      idSpan.className = "task-id";
      idSpan.textContent = `Task #${task.id}`;
      header.appendChild(idSpan);

      const badge = createDueBadge(task.due_date);
      if (badge) header.appendChild(badge);

      left.appendChild(header);

      const titleDiv = document.createElement("div");
      titleDiv.className = "task-title";
      titleDiv.textContent = task.title;
      left.appendChild(titleDiv);

      const row1 = document.createElement("div");
      row1.className = "task-row";
      row1.innerHTML = `Estimated Hours: <strong>${task.estimated_hours ?? "N/A"}</strong>`;
      left.appendChild(row1);

      const row2 = document.createElement("div");
      row2.className = "task-row";
      row2.innerHTML = `Importance: <strong>${task.importance}/10</strong>`;
      left.appendChild(row2);

      // RIGHT SIDE
      const right = document.createElement("div");
      right.className = "task-right";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-edit";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditModal(task.id));
      right.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteTask(task.id));
      right.appendChild(deleteBtn);

      li.appendChild(left);
      li.appendChild(right);
      taskList.appendChild(li);
    });
  }

  function createDueBadge(dateStr) {
    if (!dateStr) return null;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tomorrow = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const span = document.createElement("span");
    span.className = "task-badge";

    if (dateStr === todayStr) {
      span.classList.add("due-today");
      span.textContent = "Due Today";
    } else if (dateStr === tomorrowStr) {
      span.classList.add("due-tomorrow");
      span.textContent = "Due Tomorrow";
    } else {
      span.classList.add("due-later");
      span.textContent = `Due ${dateStr}`;
    }

    return span;
  }

  /* ---------------------------------------
     EDIT TASK (MODAL)
  --------------------------------------- */
  function openEditModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      alert("Task not found");
      return;
    }

    currentEditId = taskId;

    editTitleInput.value = task.title;
    editDueDateInput.value = task.due_date || "";
    editHoursInput.value = task.estimated_hours ?? "";
    editImportanceInput.value = task.importance;
    editDepsInput.value = (task.dependencies || []).join(",");

    editModal.style.display = "flex";
  }

  saveTaskBtn.addEventListener("click", () => {
    if (currentEditId === null) {
      alert("No task selected.");
      return;
    }

    const task = tasks.find((t) => t.id === currentEditId);
    if (!task) {
      alert("Task not found.");
      return;
    }

    const newTitle = editTitleInput.value.trim();
    const newDue = editDueDateInput.value || null;
    const newHoursStr = editHoursInput.value;
    const newHours = newHoursStr ? parseFloat(newHoursStr) : null;
    const newImpStr = editImportanceInput.value;
    const newImportance = newImpStr ? parseInt(newImpStr) : task.importance;
    const depStr = editDepsInput.value.trim();

    if (!newTitle) {
      alert("Title is required");
      return;
    }

    let newDeps = [];
    if (depStr) {
      newDeps = depStr
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
    }

    task.title = newTitle;
    task.due_date = newDue;
    task.estimated_hours = newHours;
    task.importance = newImportance;
    task.dependencies = newDeps;

    renderTaskList();
    editModal.style.display = "none";
    currentEditId = null;
  });

  /* ---------------------------------------
     DELETE TASK
  --------------------------------------- */
  function deleteTask(taskId) {
    const confirmation = confirm(`Are you sure you want to delete Task ID=${taskId}?`);
    if (!confirmation) return;

    tasks = tasks.filter((t) => t.id !== taskId);

    // remove this id from other tasks' dependencies
    tasks.forEach((t) => {
      t.dependencies = (t.dependencies || []).filter((dep) => dep !== taskId);
    });

    renderTaskList();
  }

  /* ---------------------------------------
     CLEAR ALL TASKS
  --------------------------------------- */
  clearAllBtn.addEventListener("click", () => {
    if (tasks.length === 0) {
      alert("No tasks to clear.");
      return;
    }

    const sure = confirm("Are you sure you want to clear ALL tasks?");
    if (!sure) return;

    tasks = [];
    nextId = 1;
    results = [];

    taskList.innerHTML = "";
    resultsContainer.innerHTML = "";

    document.querySelectorAll(".matrix-list").forEach((div) => (div.innerHTML = ""));
    document.getElementById("graphContainer").innerHTML = "";
  });

  /* ---------------------------------------
     ANALYZE TASKS
  --------------------------------------- */
  analyzeBtn.addEventListener("click", analyzeTasks);

  async function analyzeTasks() {
    if (tasks.length === 0) {
      alert("Add some tasks first");
      return;
    }

    const strategy = strategySelect.value;

    const res = await fetch(
      "http://127.0.0.1:8000/api/tasks/analyze/?strategy=" + strategy,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tasks),
      }
    );

    results = await res.json(); // save for matrix & feedback
    renderResults(results);
  }

  /* ---------------------------------------
     SUGGEST TOP TASKS
  --------------------------------------- */
  suggestBtn.addEventListener("click", suggestTasks);

  async function suggestTasks() {
    if (tasks.length === 0) {
      alert("Add tasks first");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/tasks/suggest/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasks),
    });

    results = await res.json();
    renderResults(results, true);
  }

  /* ---------------------------------------
     RENDER RESULTS CARDS
  --------------------------------------- */
  function renderResults(resultsData, isSuggestion = false) {
    resultsContainer.innerHTML = "";

    if (isSuggestion) {
      const h = document.createElement("h3");
      h.textContent = "Top 3 Suggested Tasks";
      resultsContainer.appendChild(h);
    }

    resultsData.forEach((t) => {
      const div = document.createElement("div");
      div.className = "task-card priority-" + (t.priority_level || "");

      div.innerHTML = `
        <strong>${t.title}</strong> (ID=${t.id})<br>
        Score: ${t.score} | Priority: ${t.priority_level}<br>
        Due: ${t.due_date || "N/A"} | Hours: ${t.estimated_hours ?? "N/A"} | Importance: ${t.importance}<br>
        <small>${t.explanation}</small>
      `;
      resultsContainer.appendChild(div);
    });
  }

  /* ---------------------------------------
     DEPENDENCY GRAPH (VIS.JS)
  --------------------------------------- */
  graphBtn.addEventListener("click", showGraph);

  async function showGraph() {
    if (tasks.length === 0) {
      alert("Add tasks first");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/tasks/graph/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasks),
    });

    const data = await res.json();

    const nodes = tasks.map((t) => ({
      id: t.id,
      label: t.title,
      color: data.cycle_nodes.includes(t.id) ? "red" : "#97C2FC",
    }));

    const edges = data.edges.map((e) => ({
      from: e.from,
      to: e.to,
      arrows: "to",
    }));

    const container = document.getElementById("graphContainer");
    new vis.Network(container, { nodes, edges }, {
      edges: { smooth: true },
      physics: { enabled: true },
    });
  }

  /* ---------------------------------------
     PRIORITY MATRIX (EISENHOWER)
  --------------------------------------- */
  matrixBtn.addEventListener("click", showMatrix);

  function showMatrix() {
    if (results.length === 0) {
      alert("Analyze tasks first to generate urgency!");
      return;
    }

    document.querySelectorAll(".matrix-list").forEach((div) => (div.innerHTML = ""));

    results.forEach((task) => {
      const urgency = task.urgency;
      const importance = task.importance;

      const item = document.createElement("div");
      item.className = "matrix-item";
      item.innerText = `${task.title} (U:${urgency} / I:${importance})`;

      const isUrgent = urgency >= 7;
      const isImportant = importance >= 7;

      if (isUrgent && isImportant) {
        document.querySelector("#urgentImportant .matrix-list").appendChild(item);
      } else if (isUrgent && !isImportant) {
        document.querySelector("#urgentNotImportant .matrix-list").appendChild(item);
      } else if (!isUrgent && isImportant) {
        document.querySelector("#notUrgentImportant .matrix-list").appendChild(item);
      } else {
        document.querySelector("#notUrgentNotImportant .matrix-list").appendChild(item);
      }
    });

    document.getElementById("matrixContainer").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------------------------------------
     FEEDBACK BUTTONS (learning system)
  --------------------------------------- */
  if (feedbackHelpfulBtn && feedbackNotHelpfulBtn) {
    feedbackHelpfulBtn.addEventListener("click", () => sendFeedback("helpful"));
    feedbackNotHelpfulBtn.addEventListener("click", () => sendFeedback("not_helpful"));
  }

  async function sendFeedback(feedback) {
    if (results.length === 0) {
      alert("Analyze or get suggestions first, then give feedback.");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/tasks/feedback/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    });

    const data = await res.json();
    console.log("Learning response:", data);
    alert("Thanks! Learning updated (" + feedback + ").");
  }

}); // END DOMContentLoaded
