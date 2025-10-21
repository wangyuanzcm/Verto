import { MockMethod } from 'vite-plugin-mock';
import { resultPageSuccess, resultSuccess } from './_util';

// 这里单独提供 /verto-backend 前缀的人员与积分相关 Mock 接口，
// 以便前端使用的 API（/verto-backend/...）可以直接命中 Mock。

type StaffItem = {
  id: string;
  name: string;
  employeeNo: string;
  email: string;
  phone: string;
  hireDate: string;
  workLocation: string;
  skills: string[];
  status: number;
  remark?: string;
  createTime: string;
  updateTime?: string;
  createBy: string;
  updateBy?: string;
  // 列表展示使用
  points?: number;
};

// 取 mock/staff.ts 中前几条人员示例，足够用于页面展示与详情演示
const staffList: StaffItem[] = [
  {
    id: '1',
    name: '张三',
    employeeNo: 'EMP001',
    email: 'zhangsan@company.com',
    phone: '13800138001',
    hireDate: '2023-01-15',
    workLocation: 'A座3楼301工位',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Vue.js'],
    status: 1,
    remark: '资深后端开发工程师，负责核心业务系统开发',
    createTime: '2023-01-15 09:00:00',
    updateTime: '2024-01-20 14:30:00',
    createBy: 'admin',
    updateBy: 'hr_manager',
  },
  {
    id: '2',
    name: '李四',
    employeeNo: 'EMP002',
    email: 'lisi@company.com',
    phone: '13800138002',
    hireDate: '2023-02-20',
    workLocation: 'A座3楼302工位',
    skills: ['JavaScript', 'Vue.js', 'React', 'Node.js', 'UI设计'],
    status: 1,
    remark: '前端开发工程师，擅长现代前端框架和用户体验设计',
    createTime: '2023-02-20 10:15:00',
    updateTime: '2024-01-18 16:45:00',
    createBy: 'admin',
    updateBy: 'hr_manager',
  },
  {
    id: '3',
    name: '王五',
    employeeNo: 'EMP003',
    email: 'wangwu@company.com',
    phone: '13800138003',
    hireDate: '2023-03-10',
    workLocation: 'B座2楼201工位',
    skills: ['Python', 'Django', 'PostgreSQL', '数据分析', 'Docker'],
    status: 1,
    remark: 'Python开发工程师，专注于数据处理和分析系统',
    createTime: '2023-03-10 14:20:00',
    updateTime: '2024-01-15 11:30:00',
    createBy: 'admin',
    updateBy: 'tech_lead',
  },
  {
    id: '4',
    name: '赵六',
    employeeNo: 'EMP004',
    email: 'zhaoliu@company.com',
    phone: '13800138004',
    hireDate: '2023-04-05',
    workLocation: 'A座4楼401工位',
    skills: ['项目管理', 'Scrum', 'Jira', '需求分析'],
    status: 1,
    remark: '项目经理，负责多个重要项目的规划和执行',
    createTime: '2023-04-05 08:45:00',
    updateTime: '2024-01-22 09:15:00',
    createBy: 'admin',
    updateBy: 'pm_director',
  },
  {
    id: '5',
    name: '孙七',
    employeeNo: 'EMP005',
    email: 'sunqi@company.com',
    phone: '13800138005',
    hireDate: '2023-05-12',
    workLocation: 'B座3楼305工位',
    skills: ['UI设计', '产品设计', 'Figma', 'Sketch', 'Photoshop'],
    status: 1,
    remark: 'UI/UX设计师，负责产品界面设计和用户体验优化',
    createTime: '2023-05-12 13:30:00',
    updateTime: '2024-01-19 15:20:00',
    createBy: 'admin',
    updateBy: 'design_lead',
  },
  {
    id: '6',
    name: '周八',
    employeeNo: 'EMP006',
    email: 'zhouba@company.com',
    phone: '13800138006',
    hireDate: '2023-06-18',
    workLocation: 'A座2楼205工位',
    skills: ['测试', 'Selenium', 'JMeter', '自动化测试', 'Bug管理'],
    status: 1,
    remark: '测试工程师，负责系统功能测试和自动化测试框架搭建',
    createTime: '2023-06-18 10:00:00',
    updateTime: '2024-01-16 12:40:00',
    createBy: 'admin',
    updateBy: 'qa_manager',
  },
];

// 积分日志类型定义
type PointsLog = {
  id: string;
  staffId: string;
  eventType: string; // 事件类型（展示用中文）
  sourceType: 'APP' | 'PROJECT' | 'COMPONENT' | 'OTHER';
  sourceId?: string;
  sourceName: string;
  delta: number; // 积分变动，支持负数
  remark?: string;
  createTime: string;
};

// 为部分人员准备积分日志示例数据（其余人员默认0分、无流水）
const pointsLogsByStaffId: Record<string, PointsLog[]> = {
  '1': [
    {
      id: 'log-1-001',
      staffId: '1',
      eventType: '应用维护人默认加分',
      sourceType: 'APP',
      sourceId: 'app-uc',
      sourceName: '用户中心',
      delta: 1,
      remark: '成为应用维护人默认+1',
      createTime: '2024-02-01 09:00:00',
    },
    {
      id: 'log-1-002',
      staffId: '1',
      eventType: '项目开发积分',
      sourceType: 'PROJECT',
      sourceId: 'prj-pay-refactor',
      sourceName: '支付系统重构',
      delta: 1,
      remark: '参与项目开发，开发人员+1',
      createTime: '2024-02-15 10:30:00',
    },
    {
      id: 'log-1-003',
      staffId: '1',
      eventType: '组件维护人默认加分',
      sourceType: 'COMPONENT',
      sourceId: 'cmp-login',
      sourceName: '登录组件',
      delta: 1,
      remark: '成为组件维护人默认+1',
      createTime: '2024-03-01 08:20:00',
    },
    {
      id: 'log-1-004',
      staffId: '1',
      eventType: '组件使用加分',
      sourceType: 'COMPONENT',
      sourceId: 'cmp-login',
      sourceName: '登录组件',
      delta: 1,
      remark: '组件被项目A使用，维护人+1',
      createTime: '2024-03-04 14:05:00',
    },
    {
      id: 'log-1-005',
      staffId: '1',
      eventType: '组件使用加分',
      sourceType: 'COMPONENT',
      sourceId: 'cmp-login',
      sourceName: '登录组件',
      delta: 1,
      remark: '组件被项目B使用，维护人+1',
      createTime: '2024-03-10 11:22:00',
    },
  ],
  '2': [
    {
      id: 'log-2-001',
      staffId: '2',
      eventType: '项目开发积分',
      sourceType: 'PROJECT',
      sourceId: 'prj-fe-portal',
      sourceName: '门户前端重构',
      delta: 1,
      remark: '参与项目开发，开发人员+1',
      createTime: '2024-02-12 13:10:00',
    },
    {
      id: 'log-2-002',
      staffId: '2',
      eventType: '组件维护人默认加分',
      sourceType: 'COMPONENT',
      sourceId: 'cmp-table',
      sourceName: '高级表格组件',
      delta: 1,
      remark: '成为组件维护人默认+1',
      createTime: '2024-03-02 09:05:00',
    },
    {
      id: 'log-2-003',
      staffId: '2',
      eventType: '组件使用加分',
      sourceType: 'COMPONENT',
      sourceId: 'cmp-table',
      sourceName: '高级表格组件',
      delta: 1,
      remark: '组件被门户项目使用，维护人+1',
      createTime: '2024-03-12 19:40:00',
    },
  ],
  '3': [
    {
      id: 'log-3-001',
      staffId: '3',
      eventType: '应用维护人默认加分',
      sourceType: 'APP',
      sourceId: 'app-analytics',
      sourceName: '数据分析平台',
      delta: 1,
      remark: '成为应用维护人默认+1',
      createTime: '2024-01-28 16:00:00',
    },
    {
      id: 'log-3-002',
      staffId: '3',
      eventType: '项目开发积分',
      sourceType: 'PROJECT',
      sourceId: 'prj-data-etl',
      sourceName: '数据ETL管道',
      delta: 1,
      remark: '参与项目开发，开发人员+1',
      createTime: '2024-02-20 10:00:00',
    },
  ],
  '6': [
    {
      id: 'log-6-001',
      staffId: '6',
      eventType: '项目开发积分',
      sourceType: 'PROJECT',
      sourceId: 'prj-qa-automation',
      sourceName: '自动化测试平台',
      delta: 1,
      remark: '参与项目开发，开发人员+1',
      createTime: '2024-02-18 09:45:00',
    },
  ],
};

function getPointsLogs(staffId: string): PointsLog[] {
  return pointsLogsByStaffId[staffId] ? [...pointsLogsByStaffId[staffId]] : [];
}

function getTotalPoints(staffId: string): number {
  return getPointsLogs(staffId).reduce((sum, log) => sum + Number(log.delta || 0), 0);
}

export default [
  // 人员列表（带积分）
  {
    url: '/verto-backend/staff/list',
    method: 'get',
    response: ({ query }) => {
      const { pageNo = 1, pageSize = 10, name, employeeNo, email, status } = query;
      let filteredList = [...staffList];

      if (name) {
        filteredList = filteredList.filter(item => item.name.toLowerCase().includes(String(name).toLowerCase()));
      }
      if (employeeNo) {
        filteredList = filteredList.filter(item => item.employeeNo.toLowerCase().includes(String(employeeNo).toLowerCase()));
      }
      if (email) {
        filteredList = filteredList.filter(item => item.email.toLowerCase().includes(String(email).toLowerCase()));
      }
      if (status !== undefined && status !== '') {
        filteredList = filteredList.filter(item => item.status === Number(status));
      }

      const listWithPoints = filteredList.map((item) => ({
        ...item,
        points: getTotalPoints(item.id),
      }));

      return resultPageSuccess(Number(pageNo), Number(pageSize), listWithPoints);
    },
  },

  // 人员详情
  {
    url: '/verto-backend/staff/queryById',
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const staff = staffList.find(item => item.id === String(id));
      return resultSuccess(staff);
    },
  },

  // 积分总览
  {
    url: '/verto-backend/staff/points/summary',
    method: 'get',
    response: ({ query }) => {
      const { staffId } = query;
      const totalPoints = getTotalPoints(String(staffId));
      return resultSuccess({ totalPoints });
    },
  },

  // 积分流水（分页）
  {
    url: '/verto-backend/staff/points/logs',
    method: 'get',
    response: ({ query }) => {
      const { staffId, pageNo = 1, pageSize = 10, eventType, sourceType } = query;
      let logs = getPointsLogs(String(staffId));

      // 事件类型过滤
      if (eventType) {
        logs = logs.filter((l) => String(l.eventType) === String(eventType));
      }
      // 来源类型过滤
      if (sourceType) {
        logs = logs.filter((l) => String(l.sourceType) === String(sourceType));
      }

      // 时间倒序
      logs.sort((a, b) => (a.createTime < b.createTime ? 1 : -1));

      return resultPageSuccess(Number(pageNo), Number(pageSize), logs);
    },
  },

  // 手动调整积分（联调/演示用）
  {
    url: '/verto-backend/staff/points/adjust',
    method: 'post',
    response: ({ body }) => {
      const { staffId, delta = 0, remark = '手动调整', sourceType = 'OTHER', eventType = '手动调整', sourceId, sourceName } = body || {};
      const id = String(staffId);
      const newLog: PointsLog = {
        id: `log-${id}-${Date.now()}`,
        staffId: id,
        eventType: String(eventType),
        sourceType: String(sourceType).toUpperCase() as any,
        sourceId,
        sourceName: sourceName || '手动调整',
        delta: Number(delta),
        remark,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      pointsLogsByStaffId[id] = pointsLogsByStaffId[id] || [];
      pointsLogsByStaffId[id].push(newLog);
      return resultSuccess({ success: true });
    },
  },
] as MockMethod[];
