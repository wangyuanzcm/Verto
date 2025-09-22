import { MockMethod } from 'vite-plugin-mock';
import { resultError, resultSuccess, getRequestToken, requestParams } from './_util';

// 项目管理模拟数据
const projectList = [
  {
    id: '1',
    projectName: '智能办公系统',
    projectCode: 'SMART_OFFICE',
    projectType: '1',
    projectStatus: '1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    projectManager: '张三',
    projectDescription: '基于AI的智能办公管理系统',
    budget: 1000000,
    actualCost: 800000,
    progress: 85,
    teamSize: 12,
    priority: 'high',
    createBy: 'admin',
    createTime: '2024-01-01 10:00:00',
    updateBy: 'admin',
    updateTime: '2024-01-15 16:30:00'
  },
  {
    id: '2',
    projectName: '电商平台升级',
    projectCode: 'ECOMMERCE_UPGRADE',
    projectType: '2',
    projectStatus: '2',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    projectManager: '李四',
    projectDescription: '电商平台技术架构升级改造',
    budget: 800000,
    actualCost: 600000,
    progress: 60,
    teamSize: 8,
    priority: 'medium',
    createBy: 'admin',
    createTime: '2024-02-01 09:00:00',
    updateBy: 'admin',
    updateTime: '2024-02-15 14:20:00'
  },
  {
    id: '3',
    projectName: '移动端APP开发',
    projectCode: 'MOBILE_APP',
    projectType: '1',
    projectStatus: '3',
    startDate: '2024-03-01',
    endDate: '2024-10-31',
    projectManager: '王五',
    projectDescription: '企业级移动端应用开发',
    budget: 600000,
    actualCost: 200000,
    progress: 30,
    teamSize: 6,
    priority: 'low',
    createBy: 'admin',
    createTime: '2024-03-01 08:30:00',
    updateBy: 'admin',
    updateTime: '2024-03-10 11:45:00'
  }
];

// 项目统计数据
const projectStats = {
  totalProjects: 15,
  activeProjects: 8,
  completedProjects: 5,
  pausedProjects: 2,
  totalBudget: 5000000,
  totalActualCost: 3200000,
  avgProgress: 65
};

export default [
  // 获取项目列表
  {
    url: '/jeecgboot/sys/project/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { pageNo = 1, pageSize = 10, projectName, projectStatus } = query;
      let filteredList = [...projectList];
      
      // 根据项目名称过滤
      if (projectName) {
        filteredList = filteredList.filter(item => 
          item.projectName.includes(projectName)
        );
      }
      
      // 根据项目状态过滤
      if (projectStatus) {
        filteredList = filteredList.filter(item => 
          item.projectStatus === projectStatus
        );
      }
      
      const start = (pageNo - 1) * pageSize;
      const end = start + parseInt(pageSize);
      const records = filteredList.slice(start, end);
      
      return resultSuccess({
        records,
        total: filteredList.length,
        size: pageSize,
        current: pageNo,
        pages: Math.ceil(filteredList.length / pageSize)
      });
    }
  },
  
  // 保存项目
  {
    url: '/jeecgboot/sys/project/add',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const newProject = {
        id: Date.now().toString(),
        ...body,
        createBy: 'admin',
        createTime: new Date().toLocaleString(),
        updateBy: 'admin',
        updateTime: new Date().toLocaleString()
      };
      projectList.unshift(newProject);
      return resultSuccess(newProject);
    }
  },
  
  // 更新项目
  {
    url: '/jeecgboot/sys/project/edit',
    timeout: 200,
    method: 'put',
    response: ({ body }) => {
      const index = projectList.findIndex(item => item.id === body.id);
      if (index > -1) {
        projectList[index] = {
          ...projectList[index],
          ...body,
          updateBy: 'admin',
          updateTime: new Date().toLocaleString()
        };
        return resultSuccess(projectList[index]);
      }
      return resultError('项目不存在');
    }
  },
  
  // 删除项目
  {
    url: '/jeecgboot/sys/project/delete',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      const { id } = query;
      const index = projectList.findIndex(item => item.id === id);
      if (index > -1) {
        projectList.splice(index, 1);
        return resultSuccess('删除成功');
      }
      return resultError('项目不存在');
    }
  },
  
  // 批量删除项目
  {
    url: '/jeecgboot/sys/project/deleteBatch',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      const { ids } = query;
      const idArray = ids.split(',');
      idArray.forEach(id => {
        const index = projectList.findIndex(item => item.id === id);
        if (index > -1) {
          projectList.splice(index, 1);
        }
      });
      return resultSuccess('批量删除成功');
    }
  },
  
  // 获取项目详情
  {
    url: '/jeecgboot/sys/project/queryById',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const project = projectList.find(item => item.id === id);
      if (project) {
        return resultSuccess(project);
      }
      return resultError('项目不存在');
    }
  },
  
  // 获取项目统计
  {
    url: '/jeecgboot/sys/project/statistics',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(projectStats);
    }
  },
  
  // 检查项目编码重复
  {
    url: '/jeecgboot/sys/project/checkProjectCode',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { projectCode, id } = query;
      const exists = projectList.some(item => 
        item.projectCode === projectCode && item.id !== id
      );
      return resultSuccess({ exists });
    }
  }
] as MockMethod[];