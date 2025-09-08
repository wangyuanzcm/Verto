# -*- coding: utf-8 -*-
"""
应用管理模块视图
"""

from django.db.models import Q
from libs import json_response, JsonParser, Argument
from libs.decorators import auth
# from libs.mixins import AppMixin
from django.views import View
from apps.account.models import User
from .models import Project, Requirement


class ProjectView(View):
    """
    项目管理视图
    """
    model = Project
    
    @auth('application:project:view')
    def get(self, request):
        """
        获取项目列表
        """
        projects = Project.objects.all()
        
        # 搜索过滤
        search = request.GET.get('search')
        if search:
            projects = projects.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(product_line__icontains=search)
            )
        
        # 产品线过滤
        product_line = request.GET.get('product_line')
        if product_line:
            projects = projects.filter(product_line=product_line)
        
        # 负责人过滤
        owner_id = request.GET.get('owner_id')
        if owner_id:
            projects = projects.filter(owner_id=owner_id)
        
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
        
        total = projects.count()
        projects = projects[start:end]
        
        # 序列化数据
        data = []
        for project in projects:
            developers = [{'id': dev.id, 'nickname': dev.nickname} for dev in project.developers.all()]
            data.append({
                'id': project.id,
                'name': project.name,
                'git_repository': project.git_repository,
                'description': project.description,
                'product_line': project.product_line,
                'owner': {'id': project.owner.id, 'nickname': project.owner.nickname},
                'developers': developers,
                'created_at': project.created_at,
                'created_by': {'id': project.created_by.id, 'nickname': project.created_by.nickname},
                'updated_at': project.updated_at,
            })
        
        return json_response({
            'data': data,
            'total': total,
            'page': page,
            'page_size': page_size
        })
    
    @auth('application:project:add')
    def post(self, request):
        """
        创建项目
        """
        form, error = JsonParser(
            Argument('name', help='请输入项目名称'),
            Argument('git_repository', help='请输入Git仓库地址'),
            Argument('description', required=False),
            Argument('product_line', help='请输入归属产品线'),
            Argument('owner_id', type=int, help='请选择负责人'),
            Argument('developer_ids', type=list, required=False, default=[]),
        ).parse(request.body)
        if error is None:
            # 检查项目名称是否重复
            if Project.objects.filter(name=form.name).exists():
                return json_response(error='项目名称已存在')
            
            # 检查负责人是否存在
            try:
                owner = User.objects.get(id=form.owner_id)
            except User.DoesNotExist:
                return json_response(error='负责人不存在')
            
            # 创建项目
            project = Project.objects.create(
                name=form.name,
                git_repository=form.git_repository,
                description=form.description,
                product_line=form.product_line,
                owner=owner,
                created_by=request.user
            )
            
            # 添加开发人员
            if form.developer_ids:
                developers = User.objects.filter(id__in=form.developer_ids)
                project.developers.set(developers)
            
            return json_response()
        return json_response(error=error)
    
    @auth('application:project:edit')
    def patch(self, request, pk):
        """
        更新项目
        """
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return json_response(error='项目不存在')
        
        form, error = JsonParser(
            Argument('name', help='请输入项目名称'),
            Argument('git_repository', help='请输入Git仓库地址'),
            Argument('description', required=False),
            Argument('product_line', help='请输入归属产品线'),
            Argument('owner_id', type=int, help='请选择负责人'),
            Argument('developer_ids', type=list, required=False, default=[]),
        ).parse(request.body)
        if error is None:
            # 检查项目名称是否重复（排除自己）
            if Project.objects.filter(name=form.name).exclude(id=pk).exists():
                return json_response(error='项目名称已存在')
            
            # 检查负责人是否存在
            try:
                owner = User.objects.get(id=form.owner_id)
            except User.DoesNotExist:
                return json_response(error='负责人不存在')
            
            # 更新项目
            project.name = form.name
            project.git_repository = form.git_repository
            project.description = form.description
            project.product_line = form.product_line
            project.owner = owner
            project.save()
            
            # 更新开发人员
            if form.developer_ids:
                developers = User.objects.filter(id__in=form.developer_ids)
                project.developers.set(developers)
            else:
                project.developers.clear()
            
            return json_response()
        return json_response(error=error)
    
    @auth('application:project:del')
    def delete(self, request, pk):
        """
        删除项目
        """
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return json_response(error='项目不存在')
        
        # 检查是否有关联的需求
        if project.requirements.exists():
            return json_response(error='该项目下还有需求，无法删除')
        
        project.delete()
        return json_response()


class RequirementView(View):
    """
    需求管理视图
    """
    model = Requirement
    
    @auth('application:requirement:view')
    def get(self, request):
        """
        获取需求列表
        """
        requirements = Requirement.objects.all()
        
        # 项目过滤
        project_id = request.GET.get('project_id')
        if project_id:
            requirements = requirements.filter(project_id=project_id)
        
        # 状态过滤
        status = request.GET.get('status')
        if status:
            requirements = requirements.filter(status=status)
        
        # 优先级过滤
        priority = request.GET.get('priority')
        if priority:
            requirements = requirements.filter(priority=priority)
        
        # 指派人过滤
        assignee_id = request.GET.get('assignee_id')
        if assignee_id:
            requirements = requirements.filter(assignee_id=assignee_id)
        
        # 搜索过滤
        search = request.GET.get('search')
        if search:
            requirements = requirements.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
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
        
        total = requirements.count()
        requirements = requirements[start:end]
        
        # 序列化数据
        data = []
        for req in requirements:
            data.append({
                'id': req.id,
                'title': req.title,
                'description': req.description,
                'project': {'id': req.project.id, 'name': req.project.name},
                'priority': req.priority,
                'status': req.status,
                'assignee': {'id': req.assignee.id, 'nickname': req.assignee.nickname} if req.assignee else None,
                'estimated_hours': req.estimated_hours,
                'actual_hours': req.actual_hours,
                'start_date': req.start_date.strftime('%Y-%m-%d') if req.start_date else None,
                'end_date': req.end_date.strftime('%Y-%m-%d') if req.end_date else None,
                'created_at': req.created_at,
                'created_by': {'id': req.created_by.id, 'nickname': req.created_by.nickname},
                'updated_at': req.updated_at,
            })
        
        return json_response({
            'data': data,
            'total': total,
            'page': page,
            'page_size': page_size
        })
    
    @auth('application:requirement:add')
    def post(self, request):
        """
        创建需求
        """
        form, error = JsonParser(
            Argument('title', help='请输入需求标题'),
            Argument('description', help='请输入需求描述'),
            Argument('project_id', type=int, help='请选择关联项目'),
            Argument('priority', default='medium'),
            Argument('status', default='pending'),
            Argument('assignee_id', type=int, required=False),
            Argument('estimated_hours', type=int, required=False),
            Argument('start_date', required=False),
            Argument('end_date', required=False),
        ).parse(request.body)
        if error is None:
            # 检查项目是否存在
            try:
                project = Project.objects.get(id=form.project_id)
            except Project.DoesNotExist:
                return json_response(error='项目不存在')
            
            # 检查指派人是否存在
            assignee = None
            if form.assignee_id:
                try:
                    assignee = User.objects.get(id=form.assignee_id)
                except User.DoesNotExist:
                    return json_response(error='指派人不存在')
            
            # 创建需求
            requirement = Requirement.objects.create(
                title=form.title,
                description=form.description,
                project=project,
                priority=form.priority,
                status=form.status,
                assignee=assignee,
                estimated_hours=form.estimated_hours,
                start_date=form.start_date,
                end_date=form.end_date,
                created_by=request.user
            )
            
            return json_response()
        return json_response(error=error)
    
    @auth('application:requirement:edit')
    def patch(self, request, pk):
        """
        更新需求
        """
        try:
            requirement = Requirement.objects.get(pk=pk)
        except Requirement.DoesNotExist:
            return json_response(error='需求不存在')
        
        form, error = JsonParser(
            Argument('title', help='请输入需求标题'),
            Argument('description', help='请输入需求描述'),
            Argument('project_id', type=int, help='请选择关联项目'),
            Argument('priority', default='medium'),
            Argument('status', default='pending'),
            Argument('assignee_id', type=int, required=False),
            Argument('estimated_hours', type=int, required=False),
            Argument('actual_hours', type=int, required=False),
            Argument('start_date', required=False),
            Argument('end_date', required=False),
        ).parse(request.body)
        if error is None:
            # 检查项目是否存在
            try:
                project = Project.objects.get(id=form.project_id)
            except Project.DoesNotExist:
                return json_response(error='项目不存在')
            
            # 检查指派人是否存在
            assignee = None
            if form.assignee_id:
                try:
                    assignee = User.objects.get(id=form.assignee_id)
                except User.DoesNotExist:
                    return json_response(error='指派人不存在')
            
            # 更新需求
            requirement.title = form.title
            requirement.description = form.description
            requirement.project = project
            requirement.priority = form.priority
            requirement.status = form.status
            requirement.assignee = assignee
            requirement.estimated_hours = form.estimated_hours
            requirement.actual_hours = form.actual_hours
            requirement.start_date = form.start_date
            requirement.end_date = form.end_date
            requirement.save()
            
            return json_response()
        return json_response(error=error)
    
    @auth('application:requirement:del')
    def delete(self, request, pk):
        """
        删除需求
        """
        try:
            requirement = Requirement.objects.get(pk=pk)
        except Requirement.DoesNotExist:
            return json_response(error='需求不存在')
        
        requirement.delete()
        return json_response()