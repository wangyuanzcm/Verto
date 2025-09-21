<template>
  <div class="project-members">
    <a-card title="项目成员" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAddMember">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          添加成员
        </a-button>
      </template>

      <a-list :data-source="memberList" :loading="loading">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a @click="handleEditMember(item)">编辑</a>
              <a @click="handleRemoveMember(item)" style="color: #ff4d4f;">移除</a>
            </template>
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :src="item.avatar">{{ item.name?.charAt(0) }}</a-avatar>
              </template>
              <template #title>
                <div class="member-title">
                  <span>{{ item.name }}</span>
                  <a-tag :color="getRoleColor(item.role)">{{ item.role }}</a-tag>
                </div>
              </template>
              <template #description>
                <div class="member-description">
                  <div>{{ item.email }}</div>
                  <div>加入时间：{{ formatDate(item.joinTime) }}</div>
                </div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { formatToDate } from '/@/utils/dateUtil';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();

  const loading = ref(false);
  const memberList = ref([]);

  /**
   * 加载成员列表
   */
  async function loadMembers() {
    loading.value = true;
    // 模拟数据
    setTimeout(() => {
      memberList.value = [
        {
          id: '1',
          name: '张三',
          email: 'zhangsan@example.com',
          role: '项目经理',
          avatar: '',
          joinTime: '2024-01-01',
        },
        {
          id: '2',
          name: '李四',
          email: 'lisi@example.com',
          role: '开发工程师',
          avatar: '',
          joinTime: '2024-01-02',
        },
      ];
      loading.value = false;
    }, 1000);
  }

  /**
   * 添加成员
   */
  function handleAddMember() {
    console.log('添加成员');
  }

  /**
   * 编辑成员
   */
  function handleEditMember(member: any) {
    console.log('编辑成员:', member);
  }

  /**
   * 移除成员
   */
  function handleRemoveMember(member: any) {
    console.log('移除成员:', member);
  }

  /**
   * 获取角色颜色
   */
  function getRoleColor(role: string) {
    const colorMap = {
      '项目经理': 'red',
      '开发工程师': 'blue',
      '测试工程师': 'green',
      '设计师': 'purple',
    };
    return colorMap[role] || 'default';
  }

  /**
   * 格式化日期
   */
  function formatDate(date: string) {
    return date ? formatToDate(date) : '-';
  }

  onMounted(() => {
    loadMembers();
  });
</script>

<style lang="less" scoped>
  .project-members {
    .member-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .member-description {
      color: #666;
      font-size: 12px;
      line-height: 1.5;
    }
  }
</style>