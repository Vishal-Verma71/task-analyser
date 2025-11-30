from django.shortcuts import render

from datetime import datetime
from collections import defaultdict

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TaskInputSerializer, TaskOutputSerializer
from .scoring import score_task, detect_cycles
from .scoring import score_task, detect_cycles, update_learning_weights, get_learning_weights




class AnalyzeTasksView(APIView):
    def post(self, request):
        strategy = request.query_params.get("strategy", "smart_balance")

        serializer = TaskInputSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tasks = serializer.validated_data

        # Count how many tasks depend on each task
        dependents_count = defaultdict(int)
        for task in tasks:
            for dep_id in task.get("dependencies", []):
                dependents_count[dep_id] += 1

        output_tasks = []
        for idx, task in enumerate(tasks):
            # Convert due_date "2025-02-01" → date object
            due_date = task.get("due_date")
            if isinstance(due_date, str) and due_date:
                task["due_date"] = datetime.fromisoformat(due_date).date()

            # assign ID if missing
            task_id = task.get("id", idx)
            num_deps = dependents_count[task_id]

            score, explanation, priority, urgency = score_task(task, num_deps, strategy)

            enriched = {
                **task,
                "score": round(score, 2),
                "urgency": round(urgency, 2),
                "explanation": explanation,
                "priority_level": priority,
                
            }

            output_tasks.append(enriched)

        # Sort by score descending
        output_tasks.sort(key=lambda t: t["score"], reverse=True)

        out_serializer = TaskOutputSerializer(output_tasks, many=True)
        return Response(out_serializer.data, status=status.HTTP_200_OK)


class SuggestTasksView(APIView):
    def post(self, request):
        serializer = TaskInputSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tasks = serializer.validated_data

        # Count dependents
        dependents_count = defaultdict(int)
        for task in tasks:
            for dep_id in task.get("dependencies", []):
                dependents_count[dep_id] += 1

        scored = []

        for idx, task in enumerate(tasks):
            due_date = task.get("due_date")
            if isinstance(due_date, str) and due_date:
                task["due_date"] = datetime.fromisoformat(due_date).date()

            task_id = task.get("id", idx)
            num_deps = dependents_count[task_id]

            score, explanation, priority, urgency = score_task(task, num_deps, "smart_balance")

            scored.append({
                **task,
                "score": round(score, 2),
                "urgency": round(urgency, 2),
                "explanation": explanation,
                "priority_level": priority,
                
            })


        # Sort by score and get top 3
        scored.sort(key=lambda t: t["score"], reverse=True)
        top3 = scored[:3]

        out_serializer = TaskOutputSerializer(top3, many=True)
        return Response(out_serializer.data, status=status.HTTP_200_OK)


class DependencyGraphView(APIView):
    def post(self, request):
        serializer = TaskInputSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tasks = serializer.validated_data

        # 1. Build edges
        edges = []
        for task in tasks:
            for dep in task.get("dependencies", []):
                edges.append({"from": task["id"], "to": dep})

        # 2. Detect cycles
        cycle_nodes = detect_cycles(tasks)

        return Response({
            "edges": edges,
            "cycle_nodes": cycle_nodes
        })


class FeedbackView(APIView):
    """
    Simple learning feedback:
    Body: { "feedback": "helpful" } or { "feedback": "not_helpful" }
    """

    def post(self, request):
        feedback = request.data.get("feedback")
        if feedback not in ("helpful", "not_helpful"):
            return Response(
                {"error": "feedback must be 'helpful' or 'not_helpful'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_weights = update_learning_weights(feedback)
        return Response(
            {
                "message": "Learning updated",
                "feedback": feedback,
                "weights": new_weights,
            },
            status=status.HTTP_200_OK,
        )
