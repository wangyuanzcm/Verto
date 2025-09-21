<template>
  <div class="project-files">
    <a-card title="项目文件" :bordered="false">
      <template #extra>
        <a-upload
          :show-upload-list="false"
          :before-upload="handleUpload"
          multiple
        >
          <a-button type="primary">
            <template #icon>
              <Icon icon="ant-design:upload-outlined" />
            </template>
            上传文件
          </a-button>
        </a-upload>
      </template>

      <a-table
        :columns="columns"
        :data-source="fileList"
        :loading="loading"
        :pagination="false"
        size="small"
      >
        <template #name="{ record }">
          <div class="file-name">
            <Icon :icon="getFileIcon(record.type)" />
            <span>{{ record.name }}</span>
          </div>
        </template>

        <template #size="{ record }">
          {{ formatFileSize(record.size) }}
        </template>

        <template #action="{ record }">
          <a-space>
            <a @click="handleDownload(record)">下载</a>
            <a @click="handlePreview(record)">预览</a>
            <a @click="handleDelete(record)" style="color: #ff4d4f;">删除</a>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { formatToDate } from '/@/utils/dateUtil';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();

  const loading = ref(false);
  const fileList = ref([]);

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      slots: { customRender: 'name' },
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 100,
      slots: { customRender: 'size' },
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      width: 150,
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
      slots: { customRender: 'action' },
    },
  ];

  /**
   * 加载文件列表
   */
  async function loadFiles() {
    loading.value = true;
    // 模拟数据
    setTimeout(() => {
      fileList.value = [
        {
          id: '1',
          name: '项目需求文档.docx',
          type: 'docx',
          size: 1024000,
          uploadTime: '2024-01-01 10:00:00',
          uploader: '张三',
        },
        {
          id: '2',
          name: '设计稿.psd',
          type: 'psd',
          size: 5120000,
          uploadTime: '2024-01-02 14:30:00',
          uploader: '李四',
        },
      ];
      loading.value = false;
    }, 1000);
  }

  /**
   * 上传文件
   */
  function handleUpload(file: File) {
    console.log('上传文件:', file);
    return false; // 阻止默认上传
  }

  /**
   * 下载文件
   */
  function handleDownload(file: any) {
    console.log('下载文件:', file);
  }

  /**
   * 预览文件
   */
  function handlePreview(file: any) {
    console.log('预览文件:', file);
  }

  /**
   * 删除文件
   */
  function handleDelete(file: any) {
    console.log('删除文件:', file);
  }

  /**
   * 获取文件图标
   */
  function getFileIcon(type: string) {
    const iconMap = {
      docx: 'file-word',
      xlsx: 'file-excel',
      pptx: 'file-ppt',
      pdf: 'file-pdf',
      jpg: 'file-image',
      png: 'file-image',
      gif: 'file-image',
      mp4: 'file-video',
      mp3: 'file-audio',
      zip: 'file-zip',
      rar: 'file-zip',
    };
    return `ant-design:${iconMap[type] || 'file'}-outlined`;
  }

  /**
   * 格式化文件大小
   */
  function formatFileSize(size: number) {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  onMounted(() => {
    loadFiles();
  });
</script>

<style lang="less" scoped>
  .project-files {
    .file-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
</style>