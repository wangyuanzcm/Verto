# -*- coding: utf-8 -*-
"""
物料管理模块数据模型
"""

from django.db import models
from libs import ModelMixin, human_datetime
from apps.account.models import User


class MaterialCategory(models.Model, ModelMixin):
    """
    物料分类模型
    """
    name = models.CharField(max_length=100, verbose_name='分类名称')
    description = models.TextField(blank=True, null=True, verbose_name='分类描述')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name='父分类')
    sort_order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.CharField(max_length=20, default=human_datetime, verbose_name='创建时间')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_categories', verbose_name='创建人')
    updated_at = models.CharField(max_length=20, default=human_datetime, verbose_name='更新时间')
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'material_categories'
        verbose_name = '物料分类'
        verbose_name_plural = '物料分类管理'
        ordering = ['sort_order', 'id']


class Material(models.Model, ModelMixin):
    """
    物料模型
    """
    TYPE_CHOICES = [
        ('component', '组件'),
        ('template', '模板'),
        ('library', '库'),
        ('tool', '工具'),
        ('document', '文档')
    ]
    
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
        ('deprecated', '已废弃')
    ]
    
    name = models.CharField(max_length=200, verbose_name='物料名称')
    description = models.TextField(verbose_name='物料描述')
    category = models.ForeignKey(MaterialCategory, on_delete=models.PROTECT, related_name='materials', verbose_name='所属分类')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='物料类型')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='状态')
    version = models.CharField(max_length=50, verbose_name='版本号')
    repository_url = models.URLField(max_length=500, blank=True, null=True, verbose_name='仓库地址')
    demo_url = models.URLField(max_length=500, blank=True, null=True, verbose_name='演示地址')
    documentation_url = models.URLField(max_length=500, blank=True, null=True, verbose_name='文档地址')
    download_url = models.URLField(max_length=500, blank=True, null=True, verbose_name='下载地址')
    tags = models.CharField(max_length=500, blank=True, null=True, verbose_name='标签')
    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name='authored_materials', verbose_name='作者')
    maintainers = models.ManyToManyField(User, related_name='maintained_materials', blank=True, verbose_name='维护者')
    download_count = models.IntegerField(default=0, verbose_name='下载次数')
    star_count = models.IntegerField(default=0, verbose_name='收藏次数')
    created_at = models.CharField(max_length=20, default=human_datetime, verbose_name='创建时间')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_materials', verbose_name='创建人')
    updated_at = models.CharField(max_length=20, default=human_datetime, verbose_name='更新时间')
    
    def __str__(self):
        return self.name
    
    @property
    def tag_list(self):
        """获取标签列表"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []
    
    class Meta:
        db_table = 'materials'
        verbose_name = '物料'
        verbose_name_plural = '物料管理'
        ordering = ['-id']
        unique_together = ['name', 'version']


class MaterialStar(models.Model, ModelMixin):
    """
    物料收藏模型
    """
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='stars', verbose_name='物料')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='starred_materials', verbose_name='用户')
    created_at = models.CharField(max_length=20, default=human_datetime, verbose_name='收藏时间')
    
    class Meta:
        db_table = 'material_stars'
        verbose_name = '物料收藏'
        verbose_name_plural = '物料收藏管理'
        unique_together = ['material', 'user']
        ordering = ['-id']


class MaterialDownload(models.Model, ModelMixin):
    """
    物料下载记录模型
    """
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='downloads', verbose_name='物料')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='material_downloads', verbose_name='用户')
    ip_address = models.GenericIPAddressField(verbose_name='IP地址')
    user_agent = models.TextField(blank=True, null=True, verbose_name='用户代理')
    created_at = models.CharField(max_length=20, default=human_datetime, verbose_name='下载时间')
    
    class Meta:
        db_table = 'material_downloads'
        verbose_name = '物料下载记录'
        verbose_name_plural = '物料下载记录管理'
        ordering = ['-id']