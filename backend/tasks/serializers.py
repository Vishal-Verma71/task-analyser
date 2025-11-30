# from rest_framework import serializers

# class TaskInputSerializer(serializers.Serializer):
#     id = serializers.IntegerField(required=False)
#     title = serializers.CharField()
#     due_date = serializers.DateField(required=False, allow_null=True)
#     estimated_hours = serializers.FloatField(required=False, allow_null=True)
#     importance = serializers.IntegerField(min_value=1, max_value=10)
#     dependencies = serializers.ListField(
#         child=serializers.IntegerField(),
#         required=False
#     )

# class TaskOutputSerializer(TaskInputSerializer):
#     score = serializers.FloatField()
#     explanation = serializers.CharField()
#     priority_level = serializers.CharField()






from rest_framework import serializers

class TaskInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    title = serializers.CharField()
    due_date = serializers.DateField(required=False, allow_null=True)
    estimated_hours = serializers.FloatField(required=False, allow_null=True)
    importance = serializers.IntegerField(min_value=1, max_value=10)
    dependencies = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )


class TaskOutputSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()

    # 🔥 Values returned from backend
    score = serializers.FloatField()
    urgency = serializers.FloatField()   # ← MUST BE ADDED
    importance = serializers.IntegerField()
    estimated_hours = serializers.FloatField(allow_null=True)
    due_date = serializers.DateField(allow_null=True)

    priority_level = serializers.CharField()
    explanation = serializers.CharField()

    dependencies = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )

