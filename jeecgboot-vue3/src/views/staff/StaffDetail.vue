<template>
  <div class="staff-detail">
    <PageWrapper title="人员详情" @back="goBack" content="查看人员的详细信息">
      <template #extra>
        <a-button type="primary" @click="handleEdit">
          <Icon icon="ant-design:edit-outlined" />
          编辑
        </a-button>
      </template>

      <div class="staff-detail-content">
        <a-card title="基本信息" :loading="loading">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="姓名">
              {{ staffInfo.name }}
            </a-descriptions-item>
            <a-descriptions-item label="工号">
              {{ staffInfo.employeeNo }}
            </a-descriptions-item>
            <a-descriptions-item label="手机号">
              {{ staffInfo.phone }}
            </a-descriptions-item>
            <a-descriptions-item label="邮箱">
              {{ staffInfo.email }}
            </a-descriptions-item>
            <a-descriptions-item label="工作地点">
              {{ staffInfo.workLocation }}
            </a-descriptions-item>
            <a-descriptions-item label="技能">
              {{ staffInfo.skills }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="staffInfo.status === 1 ? 'green' : 'red'">
                {{ staffInfo.status === 1 ? '正常' : '冻结' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="入职时间">
              {{ staffInfo.hireDate }}
            </a-descriptions-item>
            <a-descriptions-item label="创建人">
              {{ staffInfo.createBy }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ staffInfo.createTime }}
            </a-descriptions-item>
            <a-descriptions-item label="更新人" v-if="staffInfo.updateBy">
              {{ staffInfo.updateBy }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间" v-if="staffInfo.updateTime">
              {{ staffInfo.updateTime }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="其他信息" class="mt-4" v-if="staffInfo.remark">
          <p>{{ staffInfo.remark }}</p>
        </a-card>
      </div>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getStaffById } from './staff.api';

  const route = useRoute();
  const router = useRouter();
  const { createMessage } = useMessage();

  const loading = ref(false);
  const staffInfo = ref<any>({});

  /**
   * 获取人员详情信息
   */
  async function fetchStaffDetail() {
    try {
      loading.value = true;
      const id = route.params.id as string;
      const result = await getStaffById(id);
      staffInfo.value = result;
    } catch (error) {
      createMessage.error('获取人员详情失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 返回列表页
   */
  function goBack() {
    router.push('/staff/list');
  }

  /**
   * 编辑人员
   */
  function handleEdit() {
    router.push(`/staff/edit/${route.params.id}`);
  }

  onMounted(() => {
    fetchStaffDetail();
  });
</script>

<style lang="less" scoped>
  .staff-detail {
    &-content {
      padding: 16px;
    }
  }
</style>