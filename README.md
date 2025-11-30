

# ✅ **Smart Task Analyzer **

### **Submitted by:** Vishal Verma

**Individual Submission**

---

## 📌 **Overview**

Smart Task Analyzer is an intelligent task-management system that analyzes tasks, evaluates urgency, importance, dependencies, and effort, and produces optimized task-prioritization using multiple strategies.
It includes:

* ✔️ Task scoring engine
* ✔️ Eisenhower matrix
* ✔️ Dependency graph
* ✔️ Strategy-based ranking
* ✔️ ML-style self-learning feedback loop
* ✔️ Full frontend + backend implementation
* ✔️ Unit tests (Django)
* ✔️ Clean and user-friendly UI

This project is built as part of **Singularium Internship Assignment 2025**.

---

## 🏗️ **Tech Stack**

### **Backend**

* Python
* Django REST Framework
* Custom scoring algorithms
* Feedback-based learning system
* Unit tests (pytest/Django)

### **Frontend**

* HTML, CSS, Vanilla JS
* Responsive dashboard UI
* Modal-based create/edit tasks
* Local state management
* Dependency visualization (vis.js)

---

## ⚙️ **Features Implemented**

### ✅ **Task Input Module**

* Add tasks with:

  * Title
  * Due date
  * Estimated hours
  * Importance (1–10)
  * Dependencies (checkbox UI)

* Edit and Delete tasks

* Clear all tasks

* Validations & confirmations included

---

### ✅ **Analysis API**

Implements the required scoring system:

| Metric               | Description                            |
| -------------------- | -------------------------------------- |
| **Urgency**          | Based on due date proximity            |
| **Importance**       | User-selected (1–10)                   |
| **Effort Score**     | Inverse of hours required              |
| **Dependency Score** | Number of tasks depending on this task |

Final score = weighted combination depending on strategy:

* **Smart balance**
* **Fastest wins**
* **High impact**
* **Deadline driven**

---

### ✅ **Dependency Graph**

* Visual graph of task dependencies
* Cycle detection
* Highlights cyclic tasks in **red**
* Built using **vis.js**

---

### ✅ **Priority Matrix (Eisenhower Model)**

Tasks categorized into:

1. **Urgent + Important — Do First**
2. **Urgent + Not Important — Delegate**
3. **Not Urgent + Important — Schedule**
4. **Not Urgent + Not Important — Eliminate**

---

### ✅ **Suggestion Engine**

Returns **Top 3 tasks** based on score.

---

### ✅ **Learning System (Bonus Feature)**

* Records user feedback ("helpful" / "not helpful")
* Adjusts internal scoring weights
* Stored persistently in `learning_weights.json`
* Makes system smarter over time

---

### ✅ **Unit Testing (Bonus Feature)**

* 6+ Django tests included:

  * Urgency calculation
  * Dependency handling
  * Score calculation
  * Strategy variation tests
  * API endpoint correctness
  * Feedback learning updates

All tests pass:

```
Ran 6 tests in 0.021s — OK
```

---

## 📂 **Project Structure**

```
task-analyser/
│
├── backend/
│   ├── task_analyzer/
│   │   ├── scoring.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── learning.py
│   │   └── tests.py
│   │
│   └── manage.py
│
└── frontend/
    ├── index.html
    ├── script.js
    └── styles.css
```

---

## ▶️ **How to Run the Project**

### **1. Backend Setup**

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000/
```

---

### **2. Frontend Setup**

Simply open:

```
frontend/index.html
```

in your browser.

No frameworks needed.

---

## 📬 **API Endpoints (as required)**

| Method | Endpoint               | Purpose               |
| ------ | ---------------------- | --------------------- |
| POST   | `/api/tasks/analyze/`  | Scores & ranks tasks  |
| POST   | `/api/tasks/suggest/`  | Returns top 3 tasks   |
| POST   | `/api/tasks/graph/`    | Dependency graph data |
| POST   | `/api/tasks/feedback/` | Learning system       |

All endpoints fully implemented & tested.

---

## 🎯 **Assignment Requirements — Completed Checklist**

| Requirement                      | Status |
| -------------------------------- | ------ |
| Task input module                | ✅      |
| Task scoring algorithm           | ✅      |
| Strategy-based ranking           | ✅      |
| Eisenhower matrix                | ✅      |
| Dependency graph                 | ✅      |
| API-based architecture           | ✅      |
| Clean frontend                   | ✅      |
| Bonus: Machine-learning feedback | ✅      |
| Bonus: Unit tests                | ✅      |
| Full GitHub project              | ✅      |

---

## 👤 **Author**

**Vishal Verma**
B.Tech CSE (AI)
GitHub: [https://github.com/Vishal-Verma71](https://github.com/Vishal-Verma71)

---


