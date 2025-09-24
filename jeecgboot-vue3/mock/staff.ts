import { MockMethod } from 'vite-plugin-mock';
import { resultPageSuccess, resultSuccess } from './_util';

/**
 * 人员管理模拟数据
 */
const staffList = [
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
  {
    id: '7',
    name: '吴九',
    employeeNo: 'EMP007',
    email: 'wujiu@company.com',
    phone: '13800138007',
    hireDate: '2023-07-25',
    workLocation: 'B座1楼101工位',
    skills: ['运维', 'Linux', 'Docker', 'Kubernetes', 'Jenkins', '监控'],
    status: 1,
    remark: 'DevOps工程师，负责系统部署、监控和持续集成',
    createTime: '2023-07-25 09:30:00',
    updateTime: '2024-01-21 14:10:00',
    createBy: 'admin',
    updateBy: 'ops_manager',
  },
  {
    id: '8',
    name: '郑十',
    employeeNo: 'EMP008',
    email: 'zhengshi@company.com',
    phone: '13800138008',
    hireDate: '2023-08-30',
    workLocation: 'A座5楼501工位',
    skills: ['架构设计', '微服务', 'Spring Cloud', 'Redis', 'Elasticsearch'],
    status: 1,
    remark: '系统架构师，负责技术架构设计和技术选型',
    createTime: '2023-08-30 11:15:00',
    updateTime: '2024-01-23 16:25:00',
    createBy: 'admin',
    updateBy: 'cto',
  },
  {
    id: '9',
    name: '钱十一',
    employeeNo: 'EMP009',
    email: 'qianshiyi@company.com',
    phone: '13800138009',
    hireDate: '2023-09-15',
    workLocation: 'B座4楼402工位',
    skills: ['数据分析', 'SQL', 'Python', 'Tableau', 'Excel'],
    status: 2,
    remark: '数据分析师，负责业务数据分析和报表制作，目前在休产假',
    createTime: '2023-09-15 14:45:00',
    updateTime: '2024-01-10 10:20:00',
    createBy: 'admin',
    updateBy: 'data_manager',
  },
  {
    id: '10',
    name: '陈十二',
    employeeNo: 'EMP010',
    email: 'chenshier@company.com',
    phone: '13800138010',
    hireDate: '2022-12-01',
    workLocation: 'A座3楼303工位',
    skills: ['Java', 'Spring', 'MyBatis', 'Oracle', 'Git'],
    status: 0,
    remark: '前Java开发工程师，已于2024年1月离职',
    createTime: '2022-12-01 09:00:00',
    updateTime: '2024-01-05 17:30:00',
    createBy: 'admin',
    updateBy: 'hr_manager',
  },
  {
    id: '11',
    name: '林十三',
    employeeNo: 'EMP011',
    email: 'linshisan@company.com',
    phone: '13800138011',
    hireDate: '2023-10-20',
    workLocation: 'A座6楼601工位',
    skills: ['Go', 'Gin', 'gRPC', 'MongoDB', 'Redis'],
    status: 1,
    remark: 'Go语言开发工程师，负责高性能服务开发',
    createTime: '2023-10-20 08:30:00',
    updateTime: '2024-01-24 13:15:00',
    createBy: 'admin',
    updateBy: 'tech_lead',
  },
  {
    id: '12',
    name: '黄十四',
    employeeNo: 'EMP012',
    email: 'huangshisi@company.com',
    phone: '13800138012',
    hireDate: '2023-11-08',
    workLocation: 'B座5楼503工位',
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Webpack'],
    status: 1,
    remark: '高级前端开发工程师，专注于React生态系统',
    createTime: '2023-11-08 10:45:00',
    updateTime: '2024-01-17 15:50:00',
    createBy: 'admin',
    updateBy: 'frontend_lead',
  },
  {
    id: '13',
    name: '杨十五',
    employeeNo: 'EMP013',
    email: 'yangshiwu@company.com',
    phone: '13800138013',
    hireDate: '2023-12-15',
    workLocation: 'A座7楼701工位',
    skills: ['产品设计', '用户研究', 'Axure', '原型设计', '需求分析'],
    status: 1,
    remark: '产品经理，负责产品规划和需求管理',
    createTime: '2023-12-15 09:20:00',
    updateTime: '2024-01-25 11:40:00',
    createBy: 'admin',
    updateBy: 'product_director',
  },
  {
    id: '14',
    name: '刘十六',
    employeeNo: 'EMP014',
    email: 'liushiliu@company.com',
    phone: '13800138014',
    hireDate: '2024-01-10',
    workLocation: 'B座6楼605工位',
    skills: ['Flutter', 'Dart', 'iOS', 'Android', '移动开发'],
    status: 1,
    remark: '移动端开发工程师，负责跨平台移动应用开发',
    createTime: '2024-01-10 14:00:00',
    updateTime: '2024-01-26 09:30:00',
    createBy: 'admin',
    updateBy: 'mobile_lead',
  },
  {
    id: '15',
    name: '何十七',
    employeeNo: 'EMP015',
    email: 'heshiqi@company.com',
    phone: '13800138015',
    hireDate: '2024-01-20',
    workLocation: 'A座8楼801工位',
    skills: ['机器学习', 'TensorFlow', 'PyTorch', 'Python', '深度学习'],
    status: 1,
    remark: 'AI算法工程师，负责机器学习模型开发和优化',
    createTime: '2024-01-20 11:30:00',
    updateTime: '2024-01-27 16:20:00',
    createBy: 'admin',
    updateBy: 'ai_lead',
  },
];

/**
 * 技能统计数据
 */
const skillsStats = [
  { skill: 'Java', count: 3, percentage: 20 },
  { skill: 'JavaScript', count: 3, percentage: 20 },
  { skill: 'Python', count: 3, percentage: 20 },
  { skill: 'Vue.js', count: 2, percentage: 13.3 },
  { skill: 'React', count: 2, percentage: 13.3 },
  { skill: 'Docker', count: 2, percentage: 13.3 },
  { skill: 'MySQL', count: 2, percentage: 13.3 },
  { skill: 'Redis', count: 2, percentage: 13.3 },
  { skill: 'UI设计', count: 2, percentage: 13.3 },
  { skill: '项目管理', count: 2, percentage: 13.3 },
];

/**
 * 部门统计数据
 */
const departmentStats = [
  { department: '技术部', count: 10, percentage: 66.7 },
  { department: '产品部', count: 2, percentage: 13.3 },
  { department: '设计部', count: 2, percentage: 13.3 },
  { department: '测试部', count: 1, percentage: 6.7 },
];
export default [] as MockMethod[];
// export default [
//   /**
//    * 获取人员列表
//    */
//   {
//     url: '/jeecgboot/sys/staff/list',
//     method: 'get',
//     response: ({ query }) => {
//       const { pageNo = 1, pageSize = 10, name, employeeNo, email, status } = query;
//       let filteredList = [...staffList];

//       // 根据姓名过滤
//       if (name) {
//         filteredList = filteredList.filter(item => 
//           item.name.toLowerCase().includes(name.toLowerCase())
//         );
//       }

//       // 根据工号过滤
//       if (employeeNo) {
//         filteredList = filteredList.filter(item => 
//           item.employeeNo.toLowerCase().includes(employeeNo.toLowerCase())
//         );
//       }

//       // 根据邮箱过滤
//       if (email) {
//         filteredList = filteredList.filter(item => 
//           item.email.toLowerCase().includes(email.toLowerCase())
//         );
//       }

//       // 根据状态过滤
//       if (status !== undefined && status !== '') {
//         filteredList = filteredList.filter(item => item.status === Number(status));
//       }

//       // 分页处理
//       const start = (pageNo - 1) * pageSize;
//       const end = start + pageSize;
//       const records = filteredList.slice(start, end);

//       return resultPageSuccess(pageNo, pageSize, filteredList);
//     },
//   },

//   /**
//    * 获取人员详情
//    */
//   {
//     url: '/jeecgboot/staff/queryById',
//     method: 'get',
//     response: ({ query }) => {
//       const { id } = query;
//       const staff = staffList.find(item => item.id === id);
//       return resultSuccess(staff);
//     },
//   },

//   /**
//    * 新增人员
//    */
//   {
//     url: '/jeecgboot/sys/staff/add',
//     method: 'post',
//     response: ({ body }) => {
//       const newStaff = {
//         ...body,
//         id: String(staffList.length + 1),
//         createTime: new Date().toLocaleString(),
//         updateTime: new Date().toLocaleString(),
//         createBy: 'admin',
//         updateBy: 'admin',
//       };
//       staffList.push(newStaff);
//       return resultSuccess('新增成功');
//     },
//   },

//   /**
//    * 编辑人员
//    */
//   {
//     url: '/jeecgboot/sys/staff/edit',
//     method: 'put',
//     response: ({ body }) => {
//       const { id } = body;
//       const index = staffList.findIndex(item => item.id === id);
//       if (index !== -1) {
//         staffList[index] = { 
//           ...staffList[index], 
//           ...body, 
//           updateTime: new Date().toLocaleString() 
//         };
//       }
//       return resultSuccess('编辑成功');
//     },
//   },

//   /**
//    * 删除人员
//    */
//   {
//     url: '/jeecgboot/staff/delete',
//     method: 'delete',
//     response: ({ query }) => {
//       const { id } = query;
//       const index = staffList.findIndex(item => item.id === id);
//       if (index !== -1) {
//         staffList.splice(index, 1);
//       }
//       return resultSuccess('删除成功');
//     },
//   },

//   /**
//    * 批量删除人员
//    */
//   {
//     url: '/jeecgboot/staff/deleteBatch',
//     method: 'delete',
//     response: ({ body }) => {
//       const { ids } = body;
//       ids.forEach(id => {
//         const index = staffList.findIndex(item => item.id === id);
//         if (index !== -1) {
//           staffList.splice(index, 1);
//         }
//       });
//       return resultSuccess('批量删除成功');
//     },
//   },

//   /**
//    * 导出人员数据
//    */
//   {
//     url: '/jeecgboot/staff/exportXls',
//     method: 'get',
//     response: ({ query }) => {
//       // 模拟导出功能，实际应该返回文件流
//       return resultSuccess('导出成功', { 
//         fileName: `staff_export_${new Date().getTime()}.xlsx`,
//         downloadUrl: '/jeecgboot/download/staff_export.xlsx'
//       });
//     },
//   },

//   /**
//    * 导入人员数据
//    */
//   {
//     url: '/jeecgboot/staff/importExcel',
//     method: 'post',
//     response: ({ body }) => {
//       // 模拟导入功能
//       const { file } = body;
//       return resultSuccess('导入成功', {
//         successCount: 10,
//         failCount: 0,
//         totalCount: 10,
//         message: '成功导入10条记录'
//       });
//     },
//   },

//   /**
//    * 获取技能统计
//    */
//   {
//     url: '/jeecgboot/staff/skillsStats',
//     method: 'get',
//     response: () => {
//       return resultSuccess(skillsStats);
//     },
//   },

//   /**
//    * 获取部门统计
//    */
//   {
//     url: '/jeecgboot/staff/departmentStats',
//     method: 'get',
//     response: () => {
//       return resultSuccess(departmentStats);
//     },
//   },

//   /**
//    * 检查工号是否重复
//    */
//   {
//     url: '/jeecgboot/staff/checkEmployeeNo',
//     method: 'get',
//     response: ({ query }) => {
//       const { employeeNo, id } = query;
//       const exists = staffList.some(item => 
//         item.employeeNo === employeeNo && item.id !== id
//       );
//       return resultSuccess(!exists);
//     },
//   },

//   /**
//    * 检查邮箱是否重复
//    */
//   {
//     url: '/jeecgboot/staff/checkEmail',
//     method: 'get',
//     response: ({ query }) => {
//       const { email, id } = query;
//       const exists = staffList.some(item => 
//         item.email === email && item.id !== id
//       );
//       return resultSuccess(!exists);
//     },
//   },
// ] as MockMethod[];