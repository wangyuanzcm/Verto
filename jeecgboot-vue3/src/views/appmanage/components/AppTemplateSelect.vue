<!--应用模板选择组件-->
<template>
  <div class="template-select-container">
    <a-row :gutter="[16, 16]">
      <!-- 空白模板 -->
      <a-col :span="8">
        <a-card 
          hoverable 
          class="template-card" 
          :class="{ active: selectedTemplate === 'blank' }"
          @click="handleSelectTemplate('blank')"
        >
          <div class="template-icon">
            <Icon icon="ant-design:file-outlined" :size="48" />
          </div>
          <div class="template-info">
            <h3>空白模板</h3>
            <p>从零开始创建您的应用</p>
          </div>
          <div class="template-tags">
            <a-tag color="blue">基础</a-tag>
            <a-tag color="green">简洁</a-tag>
          </div>
          <div class="template-desc" v-if="selectedTemplate === 'blank'">
            <p>空白模板将创建一个基础的项目结构，您需要自行添加所有功能。</p>
            <p>初始化命令将提供Git仓库下载指引。</p>
          </div>
        </a-card>
      </a-col>
      
      <!-- 应用模板列表 -->
      <template v-if="applicationTemplates.length > 0">
        <a-col :span="8" v-for="template in applicationTemplates" :key="template.id">
          <a-card 
            hoverable 
            class="template-card" 
            :class="{ active: selectedTemplate === template.id }"
            @click="handleSelectTemplate(template.id, template)"
          >
            <div class="template-icon">
              <Icon :icon="template.icon || 'ant-design:appstore-outlined'" :size="48" />
            </div>
            <div class="template-info">
              <h3>{{ template.name }}</h3>
              <p>{{ template.description }}</p>
            </div>
            <div class="template-tags">
              <a-tag v-for="(tag, index) in template.tags" :key="index" :color="tag.color">{{ tag.name }}</a-tag>
            </div>
            <div class="template-desc" v-if="selectedTemplate === template.id">
              <p>{{ template.detailDescription }}</p>
            </div>
          </a-card>
        </a-col>
      </template>
      
      <!-- 无模板时的占位 -->
      <a-col :span="16" v-if="applicationTemplates.length === 0">
        <a-empty description="暂无应用模板" />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import Icon from '/@/components/Icon';
  import { getTemplateList } from '/@/views/material/material.api';
  
  /**
   * 应用模板选择组件
   * 用于在创建应用时选择应用模板
   */
  export default defineComponent({
    name: 'AppTemplateSelect',
    components: {
      Icon
    },
    emits: ['next', 'select'],
    setup(_, { emit }) {
      // 当前选中的模板
      const selectedTemplate = ref<string>('');
      // 应用模板列表
      const applicationTemplates = ref<any[]>([]);
      // 选中的模板详情
      const selectedTemplateDetail = ref<any>(null);
      
      /**
       * 加载应用模板列表
       */
      const loadApplicationTemplates = async () => {
        try {
          const res = await getTemplateList({ type: 'application' });
          if (res && res.records) {
            applicationTemplates.value = res.records.map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description || '应用模板',
              detailDescription: item.content || '该模板提供基础的应用结构',
              icon: 'ant-design:appstore-outlined',
              tags: [
                { name: '应用', color: 'blue' },
                { name: item.version || 'v1.0', color: 'green' }
              ]
            }));
          }
        } catch (error) {
          console.error('加载应用模板失败', error);
        }
      };
      
      // 组件挂载时加载应用模板
      onMounted(() => {
        loadApplicationTemplates();
      });
      
      /**
       * 选择模板
       * @param template 模板ID
       * @param templateDetail 模板详情
       */
      const handleSelectTemplate = (template: string, templateDetail?: any) => {
        selectedTemplate.value = template;
        if (templateDetail) {
          selectedTemplateDetail.value = templateDetail;
        } else if (template === 'blank') {
          selectedTemplateDetail.value = {
            id: 'blank',
            name: '空白模板',
            description: '从零开始创建您的应用',
            type: 'blank',
            initCommand: 'git clone https://github.com/your-org/blank-template.git your-app-name'
          };
        }
        emit('select', template, selectedTemplateDetail.value);
      };
      
      /**
       * 进入下一步
       */
      const handleNext = () => {
        if (selectedTemplate.value) {
          emit('next', selectedTemplate.value);
        }
      };
      
      return {
        selectedTemplate,
        applicationTemplates,
        selectedTemplateDetail,
        handleSelectTemplate,
        handleNext
      };
    }
  });
</script>

<style lang="less" scoped>
  .template-select-container {
    padding: 16px 0;
    
    .template-card {
      height: 200px;
      border-radius: 8px;
      transition: all 0.3s;
      position: relative;
      display: flex;
      flex-direction: column;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
      
      &.active {
        border: 2px solid #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
      
      .template-icon {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
        color: #1890ff;
      }
      
      .template-info {
        text-align: center;
        margin-bottom: 16px;
        
        h3 {
          margin-bottom: 8px;
          font-size: 16px;
          font-weight: 500;
        }
        
        p {
          color: #666;
          font-size: 14px;
        }
      }
      
      .template-tags {
        margin-top: auto;
        display: flex;
        justify-content: center;
        gap: 8px;
      }
      
      .template-desc {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px dashed #e8e8e8;
        
        p {
          color: rgba(0, 0, 0, 0.65);
          margin-bottom: 8px;
        }
      }
    }
    
    .template-actions {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
  }
</style>