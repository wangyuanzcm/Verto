# -*- coding: utf-8 -*-
"""
物料管理模块视图
"""

from django.db.models import Q, F
from django.db import transaction
from libs import json_response, JsonParser, Argument
from libs.decorators import auth
from django.views import View
# from libs.mixins import AppMixin
from apps.account.models import User
from .models import MaterialCategory, Material, MaterialStar, MaterialDownload


class MaterialCategoryView(View):
    """
    物料分类管理视图
    """
    model = MaterialCategory
    
    @auth('material:category:view')
    def get(self, request):
        """
        获取分类列表（树形结构）
        """
        categories = MaterialCategory.objects.all()
        
        # 构建树形结构
        def build_tree(parent_id=None):
            items = []
            for category in categories.filter(parent_id=parent_id):
                item = {
                    'id': category.id,
                    'name': category.name,
                    'description': category.description,
                    'sort_order': category.sort_order,
                    'created_at': category.created_at,
                    'created_by': {'id': category.created_by.id, 'nickname': category.created_by.nickname},
                    'children': build_tree(category.id)
                }
                items.append(item)
            return items
        
        data = build_tree()
        return json_response(data)
    
    @auth('material:category:add')
    def post(self, request):
        """
        创建分类
        """
        form, error = JsonParser(
            Argument('name', help='请输入分类名称'),
            Argument('description', required=False),
            Argument('parent_id', type=int, required=False),
            Argument('sort_order', type=int, default=0),
        ).parse(request.body)
        if error is None:
            # 检查分类名称是否重复（同级别下）
            if MaterialCategory.objects.filter(name=form.name, parent_id=form.parent_id).exists():
                return json_response(error='同级别下分类名称已存在')
            
            # 检查父分类是否存在
            parent = None
            if form.parent_id:
                try:
                    parent = MaterialCategory.objects.get(id=form.parent_id)
                except MaterialCategory.DoesNotExist:
                    return json_response(error='父分类不存在')
            
            # 创建分类
            category = MaterialCategory.objects.create(
                name=form.name,
                description=form.description,
                parent=parent,
                sort_order=form.sort_order,
                created_by=request.user
            )
            
            return json_response()
        return json_response(error=error)
    
    @auth('material:category:edit')
    def patch(self, request, pk):
        """
        更新分类
        """
        try:
            category = MaterialCategory.objects.get(pk=pk)
        except MaterialCategory.DoesNotExist:
            return json_response(error='分类不存在')
        
        form, error = JsonParser(
            Argument('name', help='请输入分类名称'),
            Argument('description', required=False),
            Argument('parent_id', type=int, required=False),
            Argument('sort_order', type=int, default=0),
        ).parse(request.body)
        if error is None:
            # 检查是否设置自己为父分类
            if form.parent_id == pk:
                return json_response(error='不能设置自己为父分类')
            
            # 检查分类名称是否重复（同级别下，排除自己）
            if MaterialCategory.objects.filter(name=form.name, parent_id=form.parent_id).exclude(id=pk).exists():
                return json_response(error='同级别下分类名称已存在')
            
            # 检查父分类是否存在
            parent = None
            if form.parent_id:
                try:
                    parent = MaterialCategory.objects.get(id=form.parent_id)
                except MaterialCategory.DoesNotExist:
                    return json_response(error='父分类不存在')
            
            # 更新分类
            category.name = form.name
            category.description = form.description
            category.parent = parent
            category.sort_order = form.sort_order
            category.save()
            
            return json_response()
        return json_response(error=error)
    
    @auth('material:category:del')
    def delete(self, request, pk):
        """
        删除分类
        """
        try:
            category = MaterialCategory.objects.get(pk=pk)
        except MaterialCategory.DoesNotExist:
            return json_response(error='分类不存在')
        
        # 检查是否有子分类
        if category.children.exists():
            return json_response(error='该分类下还有子分类，无法删除')
        
        # 检查是否有物料
        if category.materials.exists():
            return json_response(error='该分类下还有物料，无法删除')
        
        category.delete()
        return json_response()


class MaterialView(View):
    """
    物料管理视图
    """
    model = Material
    
    @auth('material:view')
    def get(self, request):
        """
        获取物料列表
        """
        materials = Material.objects.all()
        
        # 分类过滤
        category_id = request.GET.get('category_id')
        if category_id:
            materials = materials.filter(category_id=category_id)
        
        # 类型过滤
        material_type = request.GET.get('type')
        if material_type:
            materials = materials.filter(type=material_type)
        
        # 状态过滤
        status = request.GET.get('status')
        if status:
            materials = materials.filter(status=status)
        
        # 作者过滤
        author_id = request.GET.get('author_id')
        if author_id:
            materials = materials.filter(author_id=author_id)
        
        # 标签过滤
        tag = request.GET.get('tag')
        if tag:
            materials = materials.filter(tags__icontains=tag)
        
        # 搜索过滤
        search = request.GET.get('search')
        if search:
            materials = materials.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # 排序
        order_by = request.GET.get('order_by', '-id')
        if order_by in ['name', '-name', 'created_at', '-created_at', 'download_count', '-download_count', 'star_count', '-star_count']:
            materials = materials.order_by(order_by)
        
        # 分页
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 10)
        
        try:
            page = int(page)
            page_size = int(page_size)
        except ValueError:
            page = 1
            page_size = 10
        
        start = (page - 1) * page_size
        end = start + page_size
        
        total = materials.count()
        materials = materials[start:end]
        
        # 序列化数据
        data = []
        for material in materials:
            maintainers = [{'id': m.id, 'nickname': m.nickname} for m in material.maintainers.all()]
            data.append({
                'id': material.id,
                'name': material.name,
                'description': material.description,
                'category': {'id': material.category.id, 'name': material.category.name},
                'type': material.type,
                'status': material.status,
                'version': material.version,
                'repository_url': material.repository_url,
                'demo_url': material.demo_url,
                'documentation_url': material.documentation_url,
                'download_url': material.download_url,
                'tags': material.tag_list,
                'author': {'id': material.author.id, 'nickname': material.author.nickname},
                'maintainers': maintainers,
                'download_count': material.download_count,
                'star_count': material.star_count,
                'created_at': material.created_at,
                'created_by': {'id': material.created_by.id, 'nickname': material.created_by.nickname},
                'updated_at': material.updated_at,
            })
        
        return json_response({
            'data': data,
            'total': total,
            'page': page,
            'page_size': page_size
        })
    
    @auth('material:add')
    def post(self, request):
        """
        创建物料
        """
        form, error = JsonParser(
            Argument('name', help='请输入物料名称'),
            Argument('description', help='请输入物料描述'),
            Argument('category_id', type=int, help='请选择所属分类'),
            Argument('type', help='请选择物料类型'),
            Argument('status', default='draft'),
            Argument('version', help='请输入版本号'),
            Argument('repository_url', required=False),
            Argument('demo_url', required=False),
            Argument('documentation_url', required=False),
            Argument('download_url', required=False),
            Argument('tags', required=False),
            Argument('author_id', type=int, help='请选择作者'),
            Argument('maintainer_ids', type=list, required=False, default=[]),
        ).parse(request.body)
        if error is None:
            # 检查物料名称和版本是否重复
            if Material.objects.filter(name=form.name, version=form.version).exists():
                return json_response(error='物料名称和版本已存在')
            
            # 检查分类是否存在
            try:
                category = MaterialCategory.objects.get(id=form.category_id)
            except MaterialCategory.DoesNotExist:
                return json_response(error='分类不存在')
            
            # 检查作者是否存在
            try:
                author = User.objects.get(id=form.author_id)
            except User.DoesNotExist:
                return json_response(error='作者不存在')
            
            # 处理标签
            tags = ''
            if form.tags:
                if isinstance(form.tags, list):
                    tags = ','.join(form.tags)
                else:
                    tags = form.tags
            
            # 创建物料
            material = Material.objects.create(
                name=form.name,
                description=form.description,
                category=category,
                type=form.type,
                status=form.status,
                version=form.version,
                repository_url=form.repository_url,
                demo_url=form.demo_url,
                documentation_url=form.documentation_url,
                download_url=form.download_url,
                tags=tags,
                author=author,
                created_by=request.user
            )
            
            # 添加维护者
            if form.maintainer_ids:
                maintainers = User.objects.filter(id__in=form.maintainer_ids)
                material.maintainers.set(maintainers)
            
            return json_response()
        return json_response(error=error)
    
    @auth('material:edit')
    def patch(self, request, pk):
        """
        更新物料
        """
        try:
            material = Material.objects.get(pk=pk)
        except Material.DoesNotExist:
            return json_response(error='物料不存在')
        
        form, error = JsonParser(
            Argument('name', help='请输入物料名称'),
            Argument('description', help='请输入物料描述'),
            Argument('category_id', type=int, help='请选择所属分类'),
            Argument('type', help='请选择物料类型'),
            Argument('status', default='draft'),
            Argument('version', help='请输入版本号'),
            Argument('repository_url', required=False),
            Argument('demo_url', required=False),
            Argument('documentation_url', required=False),
            Argument('download_url', required=False),
            Argument('tags', required=False),
            Argument('author_id', type=int, help='请选择作者'),
            Argument('maintainer_ids', type=list, required=False, default=[]),
        ).parse(request.body)
        if error is None:
            # 检查物料名称和版本是否重复（排除自己）
            if Material.objects.filter(name=form.name, version=form.version).exclude(id=pk).exists():
                return json_response(error='物料名称和版本已存在')
            
            # 检查分类是否存在
            try:
                category = MaterialCategory.objects.get(id=form.category_id)
            except MaterialCategory.DoesNotExist:
                return json_response(error='分类不存在')
            
            # 检查作者是否存在
            try:
                author = User.objects.get(id=form.author_id)
            except User.DoesNotExist:
                return json_response(error='作者不存在')
            
            # 处理标签
            tags = ''
            if form.tags:
                if isinstance(form.tags, list):
                    tags = ','.join(form.tags)
                else:
                    tags = form.tags
            
            # 更新物料
            material.name = form.name
            material.description = form.description
            material.category = category
            material.type = form.type
            material.status = form.status
            material.version = form.version
            material.repository_url = form.repository_url
            material.demo_url = form.demo_url
            material.documentation_url = form.documentation_url
            material.download_url = form.download_url
            material.tags = tags
            material.author = author
            material.save()
            
            # 更新维护者
            if form.maintainer_ids:
                maintainers = User.objects.filter(id__in=form.maintainer_ids)
                material.maintainers.set(maintainers)
            else:
                material.maintainers.clear()
            
            return json_response()
        return json_response(error=error)
    
    @auth('material:del')
    def delete(self, request, pk):
        """
        删除物料
        """
        try:
            material = Material.objects.get(pk=pk)
        except Material.DoesNotExist:
            return json_response(error='物料不存在')
        
        material.delete()
        return json_response()


class MaterialStarView(View):
    """
    物料收藏视图
    """
    
    @auth('material:star:add')
    def post(self, request, material_id):
        """
        收藏/取消收藏物料
        """
        try:
            material = Material.objects.get(id=material_id)
        except Material.DoesNotExist:
            return json_response(error='物料不存在')
        
        star, created = MaterialStar.objects.get_or_create(
            material=material,
            user=request.user
        )
        
        if created:
            # 收藏
            Material.objects.filter(id=material_id).update(star_count=F('star_count') + 1)
            return json_response({'starred': True})
        else:
            # 取消收藏
            star.delete()
            Material.objects.filter(id=material_id).update(star_count=F('star_count') - 1)
            return json_response({'starred': False})


class MaterialDownloadView(View):
    """
    物料下载视图
    """
    
    def post(self, request, material_id):
        """
        记录物料下载
        """
        try:
            material = Material.objects.get(id=material_id)
        except Material.DoesNotExist:
            return json_response(error='物料不存在')
        
        # 获取客户端IP
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR')
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # 获取用户代理
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # 记录下载
        with transaction.atomic():
            MaterialDownload.objects.create(
                material=material,
                user=request.user,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # 更新下载次数
            Material.objects.filter(id=material_id).update(download_count=F('download_count') + 1)
        
        return json_response({'download_url': material.download_url})