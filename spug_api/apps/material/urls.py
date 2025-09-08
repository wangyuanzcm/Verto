# -*- coding: utf-8 -*-
"""
物料管理模块URL配置
"""

from django.urls import path
from .views import MaterialCategoryView, MaterialView, MaterialStarView, MaterialDownloadView

urlpatterns = [
    # 物料分类管理
    path('categories/', MaterialCategoryView.as_view()),
    path('categories/<int:pk>/', MaterialCategoryView.as_view()),
    
    # 物料管理
    path('materials/', MaterialView.as_view()),
    path('materials/<int:pk>/', MaterialView.as_view()),
    
    # 物料收藏
    path('materials/<int:material_id>/star/', MaterialStarView.as_view()),
    
    # 物料下载
    path('materials/<int:material_id>/download/', MaterialDownloadView.as_view()),
]