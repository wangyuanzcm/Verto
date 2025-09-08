# -*- coding: utf-8 -*-
"""
应用管理模块数据模型
"""

from django.db import models
from libs import ModelMixin, human_datetime
from apps.account.models import User


class Project(models.Model, ModelMixin):
    """
    项目管理模型
    """
    name = models.CharField(max_length=100, verbose_name='项目名称')
    git_repository = models.URLField(max_length=500, verbose_name='Git仓库地址')
    description = models.TextField(blank=True, null=True, verbose_name='项目描述')
    product_line = models.CharField(max_length=100, verbose_name='归属产品线')
    owner = models.ForeignKey(User, on_delete=models.PROTECT, related_name='owned_projects', verbose_name='负责人')
    developers = models.ManyToManyField(User, related_name='developed_projects', blank=True, verbose_name='开发人员')
    created_at = models.CharField(max_length=20, default=human_datetime, verbose_name='创建时间')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_projects', verbose_name='创建人')
    updated_at = models.CharField(max_length=20, default=human_datetime, verbose_name='更新时间')
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'projects'
        verbose_name = '项目'
        verbose_name_plural = '项目管理'
        ordering = ['-id']


class Requirement(models.Model, ModelMixin):
    """
    需求管理模型
    """
    PRIORITY_CHOICES = [
        ('low', '低'),
        ('medium', '中'),
        ('high', '高'),
        ('urgent', '紧急')
    ]
    
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('in_progress', '进行中'),
        ('testing', '测试中'),
        ('completed', '已完成'),
        ('cancelled', '已取消')
    ]
    
    title = models.CharField(max_length=200, verbose_name='需求标题')
    description = models.TextField(verbose_name='需求描述')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='requirements', verbose_name='关联项目')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name='优先级')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='状态')
    assignee = models.ForeignKey(User, on_delete=models.PROTECT, related_name='assigned_requirements', null=True, blank=True, verbose_name='指派人')
    estimated_hours = models.IntegerField(null=True, blank=True, verbose_name='预估工时')
    actual_hours = models.IntegerField(null=True, blank=True, verbose_name='实际工时')
    start_date = models.DateField(null=True, blank=True, verbose_name='开始日期')
    end_date = models.DateField(null=True, blank=True, verbose_name='结束日期')
    created_at = models.CharField(max_length=20, default=human_datetime, verbose_name='创建时间')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_requirements', verbose_name='创建人')
    updated_at = models.CharField(max_length=20, default=human_datetime, verbose_name='更新时间')
    
    def __str__(self):
        return self.title
    
    class Meta:
        db_table = 'requirements'
        verbose_name = '需求'
        verbose_name_plural = '需求管理'
        ordering = ['-id']