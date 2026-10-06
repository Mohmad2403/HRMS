from rest_framework import serializers
from .models import PerformanceReview


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True, default=None)
    overall_rating = serializers.ReadOnlyField()

    class Meta:
        model = PerformanceReview
        fields = (
            'id', 'employee', 'employee_name', 'employee_code',
            'reviewer', 'reviewer_name', 'period',
            'technical_skills', 'communication', 'teamwork', 'problem_solving',
            'overall_rating', 'comments', 'created_at',
        )
        read_only_fields = ('reviewer', 'created_at')

    def get_employee_name(self, obj):
        return obj.employee.user.get_full_name() or obj.employee.user.username

    def validate_employee(self, employee):
        request = self.context['request']
        user = request.user
        if user.role == 'manager':
            profile = getattr(user, 'employee_profile', None)
            if not profile or employee.manager_id != profile.id:
                raise serializers.ValidationError('You can only review your own team members.')
        return employee