/**
 * 物料分类管理页面
 */
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import http from 'libs/http';

const { TextArea } = Input;

export default function CategoryIndex() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchValue, setSearchValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form] = Form.useForm();

  /**
   * 获取分类列表
   */
  const fetchData = (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    const params = {
      page,
      page_size: pageSize,
      search
    };
    
    http.get('/api/material/categories/', { params })
      .then(res => {
        setDataSource(res.data || []);
        setPagination({
          current: page,
          pageSize,
          total: res.total || 0
        });
      })
      .catch(err => {
        message.error('获取分类列表失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
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
      form.setFieldsValue(record);
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
        ? `/api/material/categories/${editRecord.id}/`
        : '/api/material/categories/';
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
   * 删除分类
   */
  const handleDelete = (record) => {
    http.delete(`/api/material/categories/${record.id}/`)
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
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '分类描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '物料数量',
      dataIndex: 'material_count',
      key: 'material_count',
      width: 100,
      render: (count) => count || 0,
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
            title="确定要删除这个分类吗？"
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
            placeholder="搜索分类名称或描述"
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
            新增分类
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
      />

      <Modal
        title={editRecord ? '编辑分类' : '新增分类'}
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
            is_active: true
          }}
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          
          <Form.Item
            label="分类描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入分类描述" />
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="is_active"
            valuePropName="checked"
          >
            <input type="checkbox" /> 启用
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}