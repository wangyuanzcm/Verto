/**
 * 需求管理页面
 */
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, Select, message, Popconfirm, Tag, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import http from 'libs/http';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

export default function RequirementIndex() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchValue, setSearchValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form] = Form.useForm();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  /**
   * 获取需求列表
   */
  const fetchData = (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    const params = {
      page,
      page_size: pageSize,
      search
    };
    
    http.get('/api/application/requirements/', { params })
      .then(res => {
        setDataSource(res.data || []);
        setPagination({
          current: page,
          pageSize,
          total: res.total || 0
        });
      })
      .catch(err => {
        message.error('获取需求列表失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 获取项目列表
   */
  const fetchProjects = () => {
    http.get('/api/application/projects/')
      .then(res => {
        setProjects(res.data || []);
      })
      .catch(err => {
        console.error('获取项目列表失败:', err);
      });
  };

  /**
   * 获取用户列表
   */
  const fetchUsers = () => {
    http.get('/api/account/user/')
      .then(res => {
        setUsers(res || []);
      })
      .catch(err => {
        console.error('获取用户列表失败:', err);
      });
  };

  useEffect(() => {
    fetchData();
    fetchProjects();
    fetchUsers();
  }, []);

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    fetchData(1, pagination.pageSize, searchValue);
  };

  /**
   * 分页变化处理
   */
  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo.current, paginationInfo.pageSize, searchValue);
  };

  /**
   * 显示新增/编辑弹窗
   */
  const showModal = (record = null) => {
    setEditRecord(record);
    setVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        expected_date: record.expected_date ? moment(record.expected_date) : null
      });
    } else {
      form.resetFields();
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const submitData = {
        ...values,
        expected_date: values.expected_date ? values.expected_date.format('YYYY-MM-DD') : null
      };
      
      const url = editRecord 
        ? `/api/application/requirements/${editRecord.id}/`
        : '/api/application/requirements/';
      const method = editRecord ? 'patch' : 'post';
      
      http[method](url, submitData)
        .then(() => {
          message.success(editRecord ? '更新成功' : '创建成功');
          setVisible(false);
          fetchData(pagination.current, pagination.pageSize, searchValue);
        })
        .catch(err => {
          message.error(editRecord ? '更新失败' : '创建失败');
        });
    });
  };

  /**
   * 删除需求
   */
  const handleDelete = (record) => {
    http.delete(`/api/application/requirements/${record.id}/`)
      .then(() => {
        message.success('删除成功');
        fetchData(pagination.current, pagination.pageSize, searchValue);
      })
      .catch(err => {
        message.error('删除失败');
      });
  };

  /**
   * 获取优先级标签颜色
   */
  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'urgent': 'purple'
    };
    return colors[priority] || 'default';
  };

  /**
   * 获取状态标签颜色
   */
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'default',
      'in_progress': 'blue',
      'testing': 'orange',
      'completed': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: '需求标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '所属项目',
      dataIndex: 'project_name',
      key: 'project_name',
      width: 150,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const labels = {
          'low': '低',
          'medium': '中',
          'high': '高',
          'urgent': '紧急'
        };
        return (
          <Tag color={getPriorityColor(priority)}>
            {labels[priority] || priority}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const labels = {
          'pending': '待处理',
          'in_progress': '进行中',
          'testing': '测试中',
          'completed': '已完成',
          'cancelled': '已取消'
        };
        return (
          <Tag color={getStatusColor(status)}>
            {labels[status] || status}
          </Tag>
        );
      },
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
    },
    {
      title: '预期完成时间',
      dataIndex: 'expected_date',
      key: 'expected_date',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个需求吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索需求标题或描述"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新增需求
          </Button>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
        rowKey="id"
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editRecord ? '编辑需求' : '新增需求'}
        open={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: 'medium',
            status: 'pending'
          }}
        >
          <Form.Item
            label="需求标题"
            name="title"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="请输入需求标题" />
          </Form.Item>
          
          <Form.Item
            label="所属项目"
            name="project"
            rules={[{ required: true, message: '请选择所属项目' }]}
          >
            <Select placeholder="请选择所属项目">
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="需求描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入需求描述" />
          </Form.Item>
          
          <Form.Item
            label="优先级"
            name="priority"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="pending">待处理</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="testing">测试中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="负责人"
            name="assignee"
          >
            <Select placeholder="请选择负责人" allowClear>
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.nickname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="预期完成时间"
            name="expected_date"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择预期完成时间"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}