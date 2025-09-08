/**
 * 项目管理页面
 */
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import http from 'libs/http';

const { Option } = Select;
const { TextArea } = Input;

export default function ProjectIndex() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchValue, setSearchValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);

  /**
   * 获取项目列表
   */
  const fetchData = (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    const params = {
      page,
      page_size: pageSize,
      search
    };
    
    http.get('/api/application/projects/', { params })
      .then(res => {
        setDataSource(res.data || []);
        setPagination({
          current: page,
          pageSize,
          total: res.total || 0
        });
      })
      .catch(err => {
        message.error('获取项目列表失败');
      })
      .finally(() => {
        setLoading(false);
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
        developers: record.developers?.map(dev => dev.id) || []
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
      const url = editRecord 
        ? `/api/application/projects/${editRecord.id}/`
        : '/api/application/projects/';
      const method = editRecord ? 'patch' : 'post';
      
      http[method](url, values)
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
   * 删除项目
   */
  const handleDelete = (record) => {
    http.delete(`/api/application/projects/${record.id}/`)
      .then(() => {
        message.success('删除成功');
        fetchData(pagination.current, pagination.pageSize, searchValue);
      })
      .catch(err => {
        message.error('删除失败');
      });
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Git仓库地址',
      dataIndex: 'git_url',
      key: 'git_url',
      width: 200,
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '产品线',
      dataIndex: 'product_line',
      key: 'product_line',
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
    },
    {
      title: '开发人员',
      dataIndex: 'developers',
      key: 'developers',
      width: 150,
      render: (developers) => (
        <>
          {developers?.map(dev => (
            <Tag key={dev} color="blue">{dev}</Tag>
          ))}
        </>
      ),
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
            title="确定要删除这个项目吗？"
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
            placeholder="搜索项目名称、描述或产品线"
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
            新增项目
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
        title={editRecord ? '编辑项目' : '新增项目'}
        open={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active'
          }}
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          
          <Form.Item
            label="Git仓库地址"
            name="git_url"
            rules={[
              { required: true, message: '请输入Git仓库地址' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input placeholder="https://github.com/username/repo.git" />
          </Form.Item>
          
          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          
          <Form.Item
            label="产品线"
            name="product_line"
            rules={[{ required: true, message: '请输入产品线' }]}
          >
            <Input placeholder="请输入产品线" />
          </Form.Item>
          
          <Form.Item
            label="负责人"
            name="owner"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人">
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.nickname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="开发人员"
            name="developers"
          >
            <Select
              mode="multiple"
              placeholder="请选择开发人员"
              allowClear
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.nickname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}