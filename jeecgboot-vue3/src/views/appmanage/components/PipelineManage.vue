<!--流水线管理-->
<template>
  <div class="pipeline-container">
    <a-empty 
      description="流水线管理功能已迁移"
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
    >
      <template #description>
        <span style="color: #999">
          流水线相关功能已迁移至"流水线配置"标签页
        </span>
      </template>
    </a-empty>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Empty } from 'ant-design-vue';

  export default defineComponent({
    name: 'PipelineManage',
    components: {
      Empty,
    },
    setup() {
      return {
        Empty,
      };
    },
  });
</script>

<style lang="less" scoped>
  .pipeline-container {
    .operation-bar {
      margin-bottom: 16px;
      padding: 16px;
      background: #fff;
      border-radius: 6px;
    }
  }
</style>