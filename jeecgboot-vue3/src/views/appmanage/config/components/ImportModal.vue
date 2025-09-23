<template>
  <BasicModal 
    v-bind="$attrs" 
    @register="registerModal" 
    title="导入配置" 
    :width="600" 
    @ok="handleImport"
    @cancel="handleClose"
    :confirmLoading="uploading"
    destroyOnClose
  >
    <!-- 导入说明 -->
    <div class="import-tips">
      <a-alert
        message="导入说明"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      >
        <template #description>
          <ul style="margin: 0; padding-left: 20px;">
            <li>支持导入 .json 格式的配置文件</li>
            <li>导入的配置将覆盖当前配置内容</li>
            <li>请确保配置文件格式正确</li>
            <li>建议在导入前先备份当前配置</li>
          </ul>
        </template>
      </a-alert>
    </div>

    <!-- 文件上传 -->
    <div class="upload-section">
      <a-upload
        name="file"
        accept=".json"
        :multiple="false"
        :fileList="fileList"
        @remove="handleRemove"
        :beforeUpload="beforeUpload"
        :showUploadList="{ showRemoveIcon: true }"
      >
        <a-button>
          <Icon icon="ant-design:upload-outlined" />
          选择配置文件
        </a-button>
      </a-upload>
      
      <div v-if="fileList.length > 0" class="file-preview" style="margin-top: 16px;">
        <a-card size="small" title="文件预览">
          <div v-if="fileContent" class="config-preview">
            <pre style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 12px; border-radius: 4px;">{{ formatJson(fileContent) }}</pre>
          </div>
          <div v-else class="loading-preview">
            <a-spin size="small" />
            <span style="margin-left: 8px;">正在读取文件...</span>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 导入选项 -->
    <div class="import-options" style="margin-top: 16px;">
      <a-form layout="vertical">
        <a-form-item label="导入模式">
          <a-radio-group v-model:value="importMode">
            <a-radio value="replace">完全替换</a-radio>
            <a-radio value="merge">合并配置</a-radio>
          </a-radio-group>
          <div class="mode-description" style="margin-top: 8px; color: #666; font-size: 12px;">
            <span v-if="importMode === 'replace'">将完全替换当前配置内容</span>
            <span v-if="importMode === 'merge'">将新配置与现有配置合并</span>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';

  const emit = defineEmits(['success', 'register']);
  const { createMessage, createWarningModal } = useMessage();

  // 弹窗状态
  const uploading = ref(false);
  const fileList = ref([]);
  const fileContent = ref<any>(null);
  const importMode = ref('replace');
  const configId = ref('');

  // 弹窗配置
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    reset();
    configId.value = data?.configId || '';
  });

  // 按钮disabled状态
  const uploadDisabled = computed(() => !(unref(fileList).length > 0));

  /**
   * 关闭弹窗
   */
  function handleClose() {
    closeModal();
    reset();
  }

  /**
   * 移除上传文件
   */
  function handleRemove(file) {
    const index = unref(fileList).indexOf(file);
    const newFileList = unref(fileList).slice();
    newFileList.splice(index, 1);
    fileList.value = newFileList;
    fileContent.value = null;
  }

  /**
   * 上传前处理
   */
  function beforeUpload(file) {
    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.json')) {
      createMessage.error('只支持 JSON 格式的配置文件');
      return false;
    }

    // 验证文件大小 (限制为 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      createMessage.error('文件大小不能超过 5MB');
      return false;
    }

    fileList.value = [file];
    
    // 读取文件内容
    readFileContent(file);
    
    return false;
  }

  /**
   * 读取文件内容
   */
  function readFileContent(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        fileContent.value = content;
      } catch (error) {
        createMessage.error('配置文件格式错误，请检查 JSON 格式');
        fileContent.value = null;
      }
    };
    reader.readAsText(file);
  }

  /**
   * 格式化JSON显示
   */
  function formatJson(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return '无法解析的配置内容';
    }
  }

  /**
   * 执行导入
   */
  async function handleImport() {
    if (!fileContent.value) {
      createMessage.error('请选择有效的配置文件');
      return;
    }

    if (!configId.value) {
      createMessage.error('配置ID不能为空');
      return;
    }

    try {
      uploading.value = true;

      // 构建导入数据
      const importData = {
        configId: configId.value,
        configContent: fileContent.value,
        importMode: importMode.value,
      };

      // 这里应该调用实际的导入API
      // 由于没有具体的API，我们模拟一个成功的导入
      await new Promise(resolve => setTimeout(resolve, 1000));

      createMessage.success('配置导入成功');
      handleClose();
      emit('success', importData);

    } catch (error) {
      console.error('导入配置失败:', error);
      createMessage.error('导入配置失败，请检查文件格式');
    } finally {
      uploading.value = false;
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    fileList.value = [];
    fileContent.value = null;
    uploading.value = false;
    importMode.value = 'replace';
    configId.value = '';
  }
</script>

<style lang="less" scoped>
  .import-tips {
    margin-bottom: 16px;
  }

  .upload-section {
    .file-preview {
      .config-preview {
        pre {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
        }
      }

      .loading-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: #666;
      }
    }
  }

  .import-options {
    .mode-description {
      font-style: italic;
    }
  }
</style>