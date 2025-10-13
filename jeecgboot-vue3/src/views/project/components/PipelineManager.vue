<template>
  <div class="pipeline-manager">
    <a-card :bordered="false" class="pm-card">
      <div class="pm-actions">
        <a-button type="primary" @click="openReleaseDrawer">
          新建发布
        </a-button>
        <a-button class="ml8" @click="loadHistory" :loading="historyLoading">
          刷新历史
        </a-button>
      </div>

      <a-table
        class="pm-table"
        :data-source="pipelineHistory"
        :columns="historyColumns"
        :loading="historyLoading"
        row-key="buildId"
        :pagination="{ pageSize: 10 }"
      />
    </a-card>

    <a-drawer
      :visible="releaseVisible"
      :width="520"
      title="新建发布"
      @close="closeReleaseDrawer"
      destroyOnClose
    >
      <a-form layout="vertical">
        <a-form-item label="流水线配置">
          <a-select
            v-model:value="releaseForm.pipelineConfigId"
            :options="pipelineConfigOptions"
            placeholder="请选择流水线配置"
          />
        </a-form-item>
        <a-form-item label="环境">
          <a-select v-model:value="releaseForm.environment" :options="environmentOptions" />
        </a-form-item>
        <a-form-item label="版本">
          <a-input v-model:value="releaseForm.version" :readonly="true" />
        </a-form-item>
        <a-form-item label="分支">
          <a-select
            v-model:value="releaseForm.branch"
            :options="branchOptions"
            :loading="branchesLoading"
            placeholder="请选择分支"
            @change="onBranchChange"
          />
        </a-form-item>
        <a-form-item label="提交ID">
          <a-select
            v-model:value="releaseForm.commitId"
            :options="commitOptions"
            :loading="commitsLoading"
            placeholder="请选择提交ID（随分支变化）"
            :disabled="!releaseForm.branch"
            show-search
            :filter-option="true"
          />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="releaseForm.remark" :rows="3" placeholder="本次发布说明" />
        </a-form-item>
        <div class="pm-drawer-actions">
          <a-button @click="closeReleaseDrawer">取消</a-button>
          <a-button type="primary" class="ml8" :loading="releaseSubmitting" @click="submitRelease">
            提交发布
          </a-button>
        </div>
      </a-form>
    </a-drawer>
    <a-modal :visible="logsVisible" title="构建日志" @cancel="() => (logsVisible = false)" :footer="null" width="800px">
      <a-spin :spinning="logsLoading">
        <pre class="pm-logs">{{ logsText }}</pre>
      </a-spin>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, h } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { formatToDateTime } from '/@/utils/dateUtil';
import { getPipelineHistory, triggerPipeline, retryBuild, getBuildLogs, getGitBranches, getProjectDetail } from '../Project.api';
import { getPipelineConfig as getAppPipelineConfig } from '/@/views/appmanage/AppManage.api';

const props = defineProps<{ projectId: string | number; appId?: string | number }>();

const { createMessage } = useMessage();

// 历史列表
const historyLoading = ref(false);
const pipelineHistory = ref<any[]>([]);
const historyColumns = [
  { title: '构建ID', dataIndex: 'buildId', key: 'buildId' },
  { title: '环境', dataIndex: 'environment', key: 'environment' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '分支', dataIndex: 'branch', key: 'branch' },
  { title: '提交ID', dataIndex: 'commitId', key: 'commitId' },
  { title: '时间', dataIndex: 'createTime', key: 'createTime',
    customRender: ({ text }: any) => (text ? formatToDateTime(text) : '-') },
  { title: '操作', key: 'action',
    customRender: ({ record }: any) => {
      return h('div', { class: 'pm-actions-cell' }, [
        h(
          'a-button',
          { size: 'small', onClick: () => handleRetryBuild(record) },
          { default: () => '重新构建' }
        ),
        h(
          'a-button',
          { size: 'small', class: 'ml8', onClick: () => handleViewLogs(record) },
          { default: () => '查看日志' }
        ),
      ]);
    }
  },
];

async function loadHistory() {
  if (!props.projectId) return;
  try {
    historyLoading.value = true;
    const res: any = await getPipelineHistory({ projectId: String(props.projectId), page: 1, pageSize: 10 });
    const list = Array.isArray(res?.records) ? res.records : (Array.isArray(res) ? res : []);
    pipelineHistory.value = list || [];
  } catch (e) {
    console.warn('加载流水线历史失败:', e);
  } finally {
    historyLoading.value = false;
  }
}

// 新建发布
const releaseVisible = ref(false);
const releaseSubmitting = ref(false);
const environmentOptions = [
  { label: '开发环境', value: 'dev' },
  { label: '测试环境', value: 'test' },
  { label: '生产环境', value: 'prod' },
];

const releaseForm = reactive({
  environment: 'dev',
  version: '',
  branch: '',
  commitId: '',
  remark: '',
  pipelineConfigId: '',
});

function pad(n: number) { return String(n).padStart(2, '0'); }
function generateReleaseVersion() {
  const d = new Date();
  return `v${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function openReleaseDrawer() {
  releaseForm.environment = 'dev';
  releaseForm.version = generateReleaseVersion();
  // 设定默认分支为项目基础信息中的分支
  if (projectInfo.value?.gitBranch) {
    releaseForm.branch = projectInfo.value.gitBranch;
    // 加载该分支的提交列表
    onBranchChange(projectInfo.value.gitBranch);
  }
  // 加载必要选择项
  loadBranches();
  // 根据项目关联的应用，加载流水线配置
  loadPipelineConfigsByProject();
  releaseVisible.value = true;
}

function closeReleaseDrawer() {
  releaseVisible.value = false;
}

async function submitRelease() {
  if (!props.projectId) return;
  try {
    releaseSubmitting.value = true;
    const payload: any = {
      projectId: String(props.projectId),
      environment: releaseForm.environment,
      branch: releaseForm.branch || undefined,
      commitId: releaseForm.commitId || undefined,
      parameters: {
        version: releaseForm.version,
        remark: releaseForm.remark,
        pipelineConfigId: releaseForm.pipelineConfigId || undefined,
      },
    };
    await triggerPipeline(payload);
    createMessage.success('已触发发布流程');
    releaseVisible.value = false;
    await loadHistory();
  } catch (e: any) {
    console.error('触发发布失败:', e);
    createMessage.error(e?.message || '触发发布失败');
  } finally {
    releaseSubmitting.value = false;
  }
}

// 项目基础信息（关联应用、默认分支）
const projectInfo = ref<any>(null);

async function loadProjectInfo() {
  if (!props.projectId) return;
  try {
    // 修正参数名：后端要求传入 id，而非 projectId
    const info: any = await getProjectDetail({ id: String(props.projectId) });
    projectInfo.value = info?.result || info || null;
  } catch (e) {
    console.warn('获取项目基础信息失败:', e);
  }
}

onMounted(async () => {
  await loadProjectInfo();
  await loadHistory();
});

const pipelineConfigOptions = ref<{ label: string; value: string }[]>([]);

async function loadPipelineConfigsByProject() {
  releaseForm.pipelineConfigId = '';
  pipelineConfigOptions.value = [];
  // 优先使用父组件传入的 appId，其次再从项目详情中推断
  const appId = (props.appId ?? getAppIdFromProject(projectInfo.value)) as string | number | undefined;
  if (!appId) {
    console.warn('项目未找到关联的应用ID，无法加载流水线配置');
    return;
  }
  try {
    const resp: any = await getAppPipelineConfig(String(appId));
    // 兼容多种响应结构
    const list = resp?.result || resp?.data || resp?.records || resp?.list || resp;
    const pipelines: any[] = Array.isArray(list) ? list : (Array.isArray(list?.pipelines) ? list.pipelines : []);
    pipelineConfigOptions.value = (pipelines || []).map((p: any) => ({ label: p?.pipelineName || p?.name || p?.id, value: String(p?.id || p?.pipelineId || p?.name) }));
  } catch (e) {
    console.warn('获取应用流水线配置失败:', e);
  }
}

function getAppIdFromProject(project: any): string | undefined {
  if (!project) return undefined;
  return (
    project.appId || project.app_id || project.appCode || project.app?.id || project.app?.appId || project.appIdRef || project.applicationId || undefined
  );
}

// 分支 & 提交ID
const branchesLoading = ref(false);
const commitList = ref<any[]>([]);
const commitsLoading = ref(false);
const branchOptions = ref<{ label: string; value: string }[]>([]);
const commitOptions = computed(() => (commitList.value || []).map((c: any) => ({ label: `${c?.shortId || c?.id || c} ${c?.message ? '- ' + c.message : ''}`, value: String(c?.id || c) })));

async function loadBranches() {
  if (!props.projectId) return;
  try {
    branchesLoading.value = true;
    const res: any = await getGitBranches({ projectId: String(props.projectId) });
    const arr = Array.isArray(res) ? res : (Array.isArray(res?.records) ? res.records : []);
    branchOptions.value = (arr || []).map((b: any) => ({ label: b?.name || b, value: String(b?.name || b) }));
  } catch (e) {
    console.warn('获取分支失败:', e);
    // 同步给用户提示，便于排查
    try { createMessage?.error('获取分支失败，请检查后端接口 /project/git/branches 和项目ID'); } catch {}
  } finally {
    branchesLoading.value = false;
  }
}

async function onBranchChange(branch: string) {
  releaseForm.commitId = '';
  await loadCommits(branch);
}

async function loadCommits(branch?: string) {
  // 由于当前未提供项目级提交列表API，这里尝试从历史列表中提取该分支的提交作为备选
  try {
    commitsLoading.value = true;
    const res: any = await getPipelineHistory({ projectId: String(props.projectId), page: 1, pageSize: 50, branch });
    const list = Array.isArray(res?.records) ? res.records : (Array.isArray(res) ? res : []);
    const commits = (list || [])
      .filter((i: any) => (!branch || i?.branch === branch) && !!i?.commitId)
      .map((i: any) => ({ id: i.commitId, shortId: String(i.commitId).slice(0, 8), message: i.commitMessage || '' }));
    // 去重
    const uniq: Record<string, any> = {};
    commits.forEach((c) => { if (!uniq[c.id]) uniq[c.id] = c; });
    commitList.value = Object.values(uniq);
  } catch (e) {
    console.warn('获取提交列表失败:', e);
  } finally {
    commitsLoading.value = false;
  }
}

// 历史操作：重试与日志
const logsVisible = ref(false);
const logsLoading = ref(false);
const logsText = ref('');

async function handleRetryBuild(record: any) {
  try {
    if (!record?.buildId) return;
    await retryBuild({ projectId: String(props.projectId), buildId: String(record.buildId) });
    createMessage.success('已重新触发构建');
    await loadHistory();
  } catch (e: any) {
    createMessage.error(e?.message || '重新构建失败');
  }
}

async function handleViewLogs(record: any) {
  logsVisible.value = true;
  logsText.value = '';
  try {
    logsLoading.value = true;
    if (!record?.buildId) return;
    const res: any = await getBuildLogs({ projectId: String(props.projectId), buildId: String(record.buildId) });
    logsText.value = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  } catch (e) {
    logsText.value = '获取日志失败';
  } finally {
    logsLoading.value = false;
  }
}
</script>

<style scoped>
.pm-card {
  margin-top: 8px;
}
.pm-actions {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.ml8 { margin-left: 8px; }
.pm-table :deep(.ant-table) {
  font-size: 13px;
}
.pm-drawer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.pm-logs {
  background: #0b1022;
  color: #d2d6ef;
  padding: 12px;
  border-radius: 6px;
  min-height: 300px;
  white-space: pre-wrap;
}
</style>