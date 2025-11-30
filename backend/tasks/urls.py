from django.urls import path
from .views import (
    AnalyzeTasksView,
    SuggestTasksView,
    DependencyGraphView,
    FeedbackView,
)



urlpatterns = [
    path('tasks/analyze/', AnalyzeTasksView.as_view(), name='tasks-analyze'),
    path('tasks/suggest/', SuggestTasksView.as_view(), name='tasks-suggest'),
    path('tasks/graph/', DependencyGraphView.as_view(), name='tasks-graph'),
    path("tasks/feedback/", FeedbackView.as_view(), name="tasks-feedback"),


]
