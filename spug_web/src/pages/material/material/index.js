/**
 * 物料管理页面
 */
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, Select, message, Popconfirm, Tag, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, DownloadOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import http from 'libs/http';

const { Option } = Select;
const { TextArea } = Input;

export default function MaterialIndex() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchValue, setSearchValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  // const [users, setUsers] = useState([]);
  const [fileList, setFileList] = useState([]);

  /**
   * 获取物料列表
   */
  const fetchData = (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    const params = {
      page,
      page_size: pageSize,
      search
    };
    
    http.get('/api/material/materials/', { params })
      .then(res => {
        setDataSource(res.data || []);
        setPagination({
          current: page,
          pageSize,
          total: res.total || 0
        });
      })
      .catch(err => {
        message.error('获取物料列表失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 获取分类列表
   */
  const fetchCategories = () => {
    http.get('/api/material/categories/')
      .then(res => {
        setCategories(res.data || []);
      })
      .catch(err => {
        console.error('获取分类列表失败:', err);
      });
  };

  /**
   * 获取用户列表
   */
  // const fetchUsers = () => {
  //   http.get('/api/account/user/')
  //     .then(res => {
  //       setUsers(res || []);
  //     })
  //     .catch(err => {
  //       console.error('获取用户列表失败:', err);
  //     });
  // };

  useEffect(() => {
    fetchData();
    fetchCategories();
    // fetchUsers();
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
      // 设置文件列表
      if (record.file_url) {
        setFileList([{
          uid: '-1',
          name: record.file_name || '文件',
          status: 'done',
          url: record.file_url,
        }]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  };

  /**
   * 文件上传处理
   */
  const handleUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  /**
   * 提交表单
   */
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const formData = new FormData();
      
      // 添加表单字段
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      
      // 添加文件
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('file', fileList[0].originFileObj);
      }
      
      const url = editRecord 
        ? `/api/material/materials/${editRecord.id}/`
        : '/api/material/materials/';
      const method = editRecord ? 'patch' : 'post';
      
      http[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
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
   * 删除物料
   */
  const handleDelete = (record) => {
    http.delete(`/api/material/materials/${record.id}/`)
      .then(() => {
        message.success('删除成功');
        fetchData(pagination.current, pagination.pageSize, searchValue);
      })
      .catch(err => {
        message.error('删除失败');
      });
  };

  /**
   * 收藏/取消收藏
   */
  const handleStar = (record) => {
    const url = record.is_starred 
      ? `/api/material/materials/${record.id}/unstar/`
      : `/api/material/materials/${record.id}/star/`;
    
    http.post(url)
      .then(() => {
        message.success(record.is_starred ? '取消收藏成功' : '收藏成功');
        fetchData(pagination.current, pagination.pageSize, searchValue);
      })
      .catch(err => {
        message.error('操作失败');
      });
  };

  /**
   * 下载物料
   */
  const handleDownload = (record) => {
    if (record.file_url) {
      // 记录下载
      http.post(`/api/material/materials/${record.id}/download/`)
        .then(() => {
          // 触发下载
          const link = document.createElement('a');
          link.href = record.file_url;
          link.download = record.file_name || record.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 刷新列表以更新下载次数
          fetchData(pagination.current, pagination.pageSize, searchValue);
        })
        .catch(err => {
          message.error('下载失败');
        });
    } else {
      message.warning('该物料没有可下载的文件');
    }
  };

  /**
   * 获取文件类型标签颜色
   */
  const getFileTypeColor = (fileType) => {
    const colors = {
      'document': 'blue',
      'image': 'green',
      'video': 'orange',
      'audio': 'purple',
      'archive': 'red',
      'other': 'default'
    };
    return colors[fileType] || 'default';
  };

  const columns = [
    {
      title: '物料名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      key: 'file_type',
      width: 100,
      render: (fileType) => {
        const labels = {
          'document': '文档',
          'image': '图片',
          'video': '视频',
          'audio': '音频',
          'archive': '压缩包',
          'other': '其他'
        };
        return (
          <Tag color={getFileTypeColor(fileType)}>
            {labels[fileType] || fileType}
          </Tag>
        );
      },
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size) => {
        if (!size) return '-';
        const units = ['B', 'KB', 'MB', 'GB'];
        let index = 0;
        let fileSize = parseInt(size);
        while (fileSize >= 1024 && index < units.length - 1) {
          fileSize /= 1024;
          index++;
        }
        return `${fileSize.toFixed(1)} ${units[index]}`;
      },
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
      width: 100,
    },
    {
      title: '下载次数',
      dataIndex: 'download_count',
      key: 'download_count',
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={record.is_starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={() => handleStar(record)}
          >
            {record.is_starred ? '取消收藏' : '收藏'}
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个物料吗？"
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
            placeholder="搜索物料名称或描述"
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
            上传物料
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
        scroll={{ x: 1400 }}
      />

      <Modal
        title={editRecord ? '编辑物料' : '上传物料'}
        open={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="物料名称"
            name="name"
            rules={[{ required: true, message: '请输入物料名称' }]}
          >
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          
          <Form.Item
            label="所属分类"
            name="category"
            rules={[{ required: true, message: '请选择所属分类' }]}
          >
            <Select placeholder="请选择所属分类">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="物料描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入物料描述" />
          </Form.Item>
          
          <Form.Item
            label="标签"
            name="tags"
          >
            <Input placeholder="请输入标签，多个标签用逗号分隔" />
          </Form.Item>
          
          <Form.Item
            label="文件上传"
            name="file"
          >
            <Upload
              fileList={fileList}
              onChange={handleUpload}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}