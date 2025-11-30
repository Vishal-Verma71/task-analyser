from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient

from .scoring import score_task, compute_urgency


class ScoringTests(TestCase):

    def test_urgency_is_higher_for_earlier_deadlines(self):
        """Urgency score should be higher when the deadline is closer."""
        today = date.today()
        near = today + timedelta(days=2)
        far = today + timedelta(days=15)

        urgency_near = compute_urgency(near)
        urgency_far = compute_urgency(far)

        self.assertGreater(urgency_near, urgency_far)

    def test_score_higher_when_more_dependencies(self):
        """Tasks blocking more tasks should score higher."""
        task = {
            "title": "Test",
            "due_date": date.today() + timedelta(days=5),
            "estimated_hours": 4,
            "importance": 7
        }

        s1, _, _, _ = score_task(task, num_dependents=0, strategy="smart_balance")
        s2, _, _, _ = score_task(task, num_dependents=3, strategy="smart_balance")

        self.assertGreater(s2, s1)

    def test_importance_affects_score(self):
        """High importance should increase score."""
        task_low = {
            "title": "Low",
            "due_date": date.today() + timedelta(days=5),
            "estimated_hours": 4,
            "importance": 3
        }
        task_high = {
            "title": "High",
            "due_date": date.today() + timedelta(days=5),
            "estimated_hours": 4,
            "importance": 9
        }

        s_low, _, _, _ = score_task(task_low, 0, "smart_balance")
        s_high, _, _, _ = score_task(task_high, 0, "smart_balance")

        self.assertGreater(s_high, s_low)


class APITests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.sample_tasks = [
            {
                "id": 1,
                "title": "Task A",
                "due_date": (date.today() + timedelta(days=3)).isoformat(),
                "estimated_hours": 2,
                "importance": 8,
                "dependencies": []
            },
            {
                "id": 2,
                "title": "Task B",
                "due_date": (date.today() + timedelta(days=7)).isoformat(),
                "estimated_hours": 5,
                "importance": 6,
                "dependencies": [1]
            }
        ]

    def test_analyze_returns_valid_data(self):
        """Analyze API must return score, urgency and priority."""
        res = self.client.post(
            "/api/tasks/analyze/?strategy=smart_balance",
            self.sample_tasks,
            format="json"
        )

        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(isinstance(data, list))
        first = data[0]

        self.assertIn("score", first)
        self.assertIn("urgency", first)
        self.assertIn("priority_level", first)

    def test_graph_returns_edges(self):
        """Graph API must return valid nodes & edges."""
        res = self.client.post(
            "/api/tasks/graph/",
            self.sample_tasks,
            format="json"
        )

        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIn("edges", data)
        self.assertIn("cycle_nodes", data)
        self.assertEqual(len(data["edges"]), 1)  # B → A


    def test_feedback_updates_learning(self):
        """Feedback endpoint should adjust learning weights."""
        res = self.client.post(
            "/api/tasks/feedback/",
            {"feedback": "helpful"},
            format="json"
        )

        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("weights", data)
