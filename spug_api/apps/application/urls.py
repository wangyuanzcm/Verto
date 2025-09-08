# -*- coding: utf-8 -*-
"""
应用管理模块URL配置
"""

from django.urls import path
from .views import ProjectView, RequirementView

urlpatterns = [
    # 项目管理
    path('projects/', ProjectView.as_view()),
    path('projects/<int:pk>/', ProjectView.as_view()),
    
    # 需求管理
    path('requirements/', RequirementView.as_view()),
    path('requirements/<int:pk>/', RequirementView.as_view()),
]