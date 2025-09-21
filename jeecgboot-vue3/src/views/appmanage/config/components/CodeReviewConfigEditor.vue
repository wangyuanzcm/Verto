<template>
  <div class="code-review-config-editor">
    <a-tabs v-model:activeKey="activeTab">
      <!-- 审查规则 -->
      <a-tab-pane key="rules" tab="审查规则">
        <div class="rules-config">
          <div class="toolbar">
            <a-button type="primary" @click="addRule" size="small">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加规则
            </a-button>
          </div>
          
          <a-table
            :columns="ruleColumns"
            :data-source="config.rules"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getRuleTypeColor(record.type)">
                  {{ getRuleTypeText(record.type) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'severity'">
                <a-tag :color="getSeverityColor(record.severity)">
                  {{ getSeverityText(record.severity) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'enabled'">
                <a-switch v-model:checked="record.enabled" size="small" />
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a @click="editRule(index)">编辑</a>
                  <a @click="removeRule(index)" style="color: #ff4d4f;">删除</a>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 检查器配置 -->
      <a-tab-pane key="checkers" tab="检查器配置">
        <div class="checkers-config">
          <div class="toolbar">
            <a-button type="primary" @click="addChecker" size="small">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加检查器
            </a-button>
          </div>
          
          <a-table
            :columns="checkerColumns"
            :data-source="config.checkers"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getCheckerTypeColor(record.type)">
                  {{ getCheckerTypeText(record.type) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'enabled'">
                <a-switch v-model:checked="record.enabled" size="small" />
              </template>
              <template v-if="column.key === 'config'">
                <a-button size="small" @click="configChecker(index)">配置</a-button>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a @click="editChecker(index)">编辑</a>
                  <a @click="removeChecker(index)" style="color: #ff4d4f;">删除</a>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 审查流程 -->
      <a-tab-pane key="workflow" tab="审查流程">
        <div class="workflow-config">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="自动分配审查者">
                  <a-switch v-model:checked="config.workflow.autoAssign" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最少审查人数">
                  <a-input-number
                    v-model:value="config.workflow.minReviewers"
                    :min="1"
                    :max="10"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="审查超时时间(小时)">
                  <a-input-number
                    v-model:value="config.workflow.timeout"
                    :min="1"
                    :max="168"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="审查者分配策略">
                  <a-select v-model:value="config.workflow.assignmentStrategy">
                    <a-select-option value="round_robin">轮询分配</a-select-option>
                    <a-select-option value="load_balanced">负载均衡</a-select-option>
                    <a-select-option value="expertise_based">专业领域</a-select-option>
                    <a-select-option value="manual">手动分配</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="合并策略">
                  <a-select v-model:value="config.workflow.mergeStrategy">
                    <a-select-option value="all_approved">全部通过</a-select-option>
                    <a-select-option value="majority_approved">多数通过</a-select-option>
                    <a-select-option value="one_approved">一人通过</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="审查者列表">
              <div class="reviewers-list">
                <div class="toolbar">
                  <a-button type="primary" @click="addReviewer" size="small">
                    <template #icon><Icon icon="ant-design:plus-outlined" /></template>
                    添加审查者
                  </a-button>
                </div>
                
                <a-table
                  :columns="reviewerColumns"
                  :data-source="config.workflow.reviewers"
                  :pagination="false"
                  size="small"
                >
                  <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key === 'role'">
                      <a-tag :color="getRoleColor(record.role)">
                        {{ getRoleText(record.role) }}
                      </a-tag>
                    </template>
                    <template v-if="column.key === 'expertise'">
                      <a-tag v-for="exp in record.expertise" :key="exp" size="small">
                        {{ exp }}
                      </a-tag>
                    </template>
                    <template v-if="column.key === 'active'">
                      <a-switch v-model:checked="record.active" size="small" />
                    </template>
                    <template v-if="column.key === 'action'">
                      <a-space>
                        <a @click="editReviewer(index)">编辑</a>
                        <a @click="removeReviewer(index)" style="color: #ff4d4f;">删除</a>
                      </a-space>
                    </template>
                  </template>
                </a-table>
              </div>
            </a-form-item>
          </a-form>
        </div>
      </a-tab-pane>

      <!-- 通知配置 -->
      <a-tab-pane key="notifications" tab="通知配置">
        <div class="notifications-config">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="邮件通知">
                  <a-switch v-model:checked="config.notifications.email.enabled" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="钉钉通知">
                  <a-switch v-model:checked="config.notifications.dingtalk.enabled" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="企业微信通知">
                  <a-switch v-model:checked="config.notifications.wechat.enabled" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-divider>通知事件配置</a-divider>
            
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item label="审查请求">
                  <a-checkbox-group v-model:value="config.notifications.events.reviewRequested">
                    <a-checkbox value="email">邮件</a-checkbox>
                    <a-checkbox value="dingtalk">钉钉</a-checkbox>
                    <a-checkbox value="wechat">企微</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="审查完成">
                  <a-checkbox-group v-model:value="config.notifications.events.reviewCompleted">
                    <a-checkbox value="email">邮件</a-checkbox>
                    <a-checkbox value="dingtalk">钉钉</a-checkbox>
                    <a-checkbox value="wechat">企微</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="审查超时">
                  <a-checkbox-group v-model:value="config.notifications.events.reviewTimeout">
                    <a-checkbox value="email">邮件</a-checkbox>
                    <a-checkbox value="dingtalk">钉钉</a-checkbox>
                    <a-checkbox value="wechat">企微</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="合并完成">
                  <a-checkbox-group v-model:value="config.notifications.events.mergeCompleted">
                    <a-checkbox value="email">邮件</a-checkbox>
                    <a-checkbox value="dingtalk">钉钉</a-checkbox>
                    <a-checkbox value="wechat">企微</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 规则编辑弹窗 -->
    <RuleModal @register="registerRuleModal" @success="handleRuleSuccess" />
    
    <!-- 检查器编辑弹窗 -->
    <CheckerModal @register="registerCheckerModal" @success="handleCheckerSuccess" />
    
    <!-- 审查者编辑弹窗 -->
    <ReviewerModal @register="registerReviewerModal" @success="handleReviewerSuccess" />
    
    <!-- 检查器配置弹窗 -->
    <CheckerConfigModal @register="registerCheckerConfigModal" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  
  import RuleModal from './RuleModal.vue';
  import CheckerModal from './CheckerModal.vue';
  import ReviewerModal from './ReviewerModal.vue';
  import CheckerConfigModal from './CheckerConfigModal.vue';
  
  import type { CodeReviewConfig, ReviewRule, ReviewChecker, Reviewer } from '../data/Config.data';

  interface Props {
    value?: CodeReviewConfig;
  }

  const props = withDefaults(defineProps<Props>(), {
    value: () => ({
      rules: [],
      checkers: [],
      workflow: {
        autoAssign: true,
        minReviewers: 2,
        timeout: 24,
        assignmentStrategy: 'round_robin',
        mergeStrategy: 'all_approved',
        reviewers: [],
      },
      notifications: {
        email: { enabled: true },
        dingtalk: { enabled: false },
        wechat: { enabled: false },
        events: {
          reviewRequested: ['email'],
          reviewCompleted: ['email'],
          reviewTimeout: ['email'],
          mergeCompleted: ['email'],
        },
      },
    }),
  });

  const emit = defineEmits(['update:value']);

  const { createMessage } = useMessage();
  const activeTab = ref('rules');

  // 配置数据
  const config = reactive<CodeReviewConfig>({
    rules: [],
    checkers: [],
    workflow: {
      autoAssign: true,
      minReviewers: 2,
      timeout: 24,
      assignmentStrategy: 'round_robin',
      mergeStrategy: 'all_approved',
      reviewers: [],
    },
    notifications: {
      email: { enabled: true },
      dingtalk: { enabled: false },
      wechat: { enabled: false },
      events: {
        reviewRequested: ['email'],
        reviewCompleted: ['email'],
        reviewTimeout: ['email'],
        mergeCompleted: ['email'],
      },
    },
  });

  // 规则表格列配置
  const ruleColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '严重程度', dataIndex: 'severity', key: 'severity' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '启用', dataIndex: 'enabled', key: 'enabled' },
    { title: '操作', key: 'action' },
  ];

  // 检查器表格列配置
  const checkerColumns = [
    { title: '检查器名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '启用', dataIndex: 'enabled', key: 'enabled' },
    { title: '配置', key: 'config' },
    { title: '操作', key: 'action' },
  ];

  // 审查者表格列配置
  const reviewerColumns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '专业领域', dataIndex: 'expertise', key: 'expertise' },
    { title: '活跃', dataIndex: 'active', key: 'active' },
    { title: '操作', key: 'action' },
  ];

  // 弹窗注册
  const [registerRuleModal, { openModal: openRuleModal }] = useModal();
  const [registerCheckerModal, { openModal: openCheckerModal }] = useModal();
  const [registerReviewerModal, { openModal: openReviewerModal }] = useModal();
  const [registerCheckerConfigModal, { openModal: openCheckerConfigModal }] = useModal();

  // 监听props变化
  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        Object.assign(config, newValue);
      }
    },
    { immediate: true, deep: true }
  );

  // 监听config变化，向上传递
  watch(
    config,
    (newConfig) => {
      emit('update:value', { ...newConfig });
    },
    { deep: true }
  );

  // ==================== 规则管理 ====================

  /**
   * 添加规则
   */
  function addRule() {
    openRuleModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑规则
   */
  function editRule(index: number) {
    openRuleModal(true, {
      isUpdate: true,
      record: config.rules[index],
      index,
    });
  }

  /**
   * 删除规则
   */
  function removeRule(index: number) {
    config.rules.splice(index, 1);
  }

  /**
   * 规则操作成功回调
   */
  function handleRuleSuccess(data: { rule: ReviewRule; index?: number }) {
    if (data.index !== undefined) {
      config.rules[data.index] = data.rule;
    } else {
      config.rules.push(data.rule);
    }
  }

  // ==================== 检查器管理 ====================

  /**
   * 添加检查器
   */
  function addChecker() {
    openCheckerModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑检查器
   */
  function editChecker(index: number) {
    openCheckerModal(true, {
      isUpdate: true,
      record: config.checkers[index],
      index,
    });
  }

  /**
   * 删除检查器
   */
  function removeChecker(index: number) {
    config.checkers.splice(index, 1);
  }

  /**
   * 配置检查器
   */
  function configChecker(index: number) {
    openCheckerConfigModal(true, {
      checker: config.checkers[index],
      index,
    });
  }

  /**
   * 检查器操作成功回调
   */
  function handleCheckerSuccess(data: { checker: ReviewChecker; index?: number }) {
    if (data.index !== undefined) {
      config.checkers[data.index] = data.checker;
    } else {
      config.checkers.push(data.checker);
    }
  }

  // ==================== 审查者管理 ====================

  /**
   * 添加审查者
   */
  function addReviewer() {
    openReviewerModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑审查者
   */
  function editReviewer(index: number) {
    openReviewerModal(true, {
      isUpdate: true,
      record: config.workflow.reviewers[index],
      index,
    });
  }

  /**
   * 删除审查者
   */
  function removeReviewer(index: number) {
    config.workflow.reviewers.splice(index, 1);
  }

  /**
   * 审查者操作成功回调
   */
  function handleReviewerSuccess(data: { reviewer: Reviewer; index?: number }) {
    if (data.index !== undefined) {
      config.workflow.reviewers[data.index] = data.reviewer;
    } else {
      config.workflow.reviewers.push(data.reviewer);
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取规则类型文本
   */
  function getRuleTypeText(type: string): string {
    const typeMap = {
      code_style: '代码风格',
      security: '安全检查',
      performance: '性能检查',
      complexity: '复杂度检查',
      documentation: '文档检查',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取规则类型颜色
   */
  function getRuleTypeColor(type: string): string {
    const colorMap = {
      code_style: 'blue',
      security: 'red',
      performance: 'orange',
      complexity: 'purple',
      documentation: 'green',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取严重程度文本
   */
  function getSeverityText(severity: string): string {
    const severityMap = {
      error: '错误',
      warning: '警告',
      info: '信息',
    };
    return severityMap[severity] || severity;
  }

  /**
   * 获取严重程度颜色
   */
  function getSeverityColor(severity: string): string {
    const colorMap = {
      error: 'red',
      warning: 'orange',
      info: 'blue',
    };
    return colorMap[severity] || 'default';
  }

  /**
   * 获取检查器类型文本
   */
  function getCheckerTypeText(type: string): string {
    const typeMap = {
      eslint: 'ESLint',
      sonarqube: 'SonarQube',
      checkstyle: 'Checkstyle',
      pmd: 'PMD',
      spotbugs: 'SpotBugs',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取检查器类型颜色
   */
  function getCheckerTypeColor(type: string): string {
    const colorMap = {
      eslint: 'blue',
      sonarqube: 'green',
      checkstyle: 'orange',
      pmd: 'purple',
      spotbugs: 'red',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取角色文本
   */
  function getRoleText(role: string): string {
    const roleMap = {
      senior: '高级工程师',
      lead: '技术负责人',
      architect: '架构师',
      admin: '管理员',
    };
    return roleMap[role] || role;
  }

  /**
   * 获取角色颜色
   */
  function getRoleColor(role: string): string {
    const colorMap = {
      senior: 'blue',
      lead: 'green',
      architect: 'purple',
      admin: 'red',
    };
    return colorMap[role] || 'default';
  }
</script>

<style lang="less" scoped>
  .code-review-config-editor {
    .toolbar {
      margin-bottom: 16px;
    }

    .reviewers-list {
      .toolbar {
        margin-bottom: 12px;
      }
    }

    .notifications-config {
      padding: 16px;
      background-color: #fafafa;
      border-radius: 6px;
    }
  }
</style>