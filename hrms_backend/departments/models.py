from django.db import models
from django.conf import settings
# Create your models here.

class Department(models.Model):
    name=models.CharField(max_length=100,unique=True)
    description=models.TextField(blank=True)
    manager= models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,blank=True,
        related_name='managed_departments',
        
    )
    
    is_active=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    
class Designation (models.Model):
    title=models.CharField(max_length=100)
    department=models.ForeignKey(Department,on_delete=models.CASCADE,related_name='designations')
    is_active=models.BooleanField(default=True)
    
    class Meta:
        unique_together=('title','department')
        
    def __str__(self):
        return f"{self.title} ({self.department.name})"