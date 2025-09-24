<!--应用管理列表-->
<template>
  <div class="app-manage">
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form
        ref="formRef"
        @keyup.enter.native="searchQuery"
        :model="queryParam"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        style="background-color: #f7f8fc"
      >
        <a-row :gutter="24">
          <a-col :xl="7" :lg="7" :md="8" :sm="24">
            <a-form-item name="appName" label="应用简称">
              <JInput v-model:value="queryParam.appName" placeholder="请输入应用简称" />
            </a-form-item>
          </a-col>
          <a-col :xl="7" :lg="7" :md="8" :sm="24">
            <a-form-item name="domain" label="所属领域">
              <j-dict-select-tag v-model:value="queryParam.domain" dict-code="app_domain" placeholder="请选择所属领域" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-col :lg="6">
                <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
                <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
              </a-col>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    
    <!-- 卡片列表区域 -->
    <a-row :span="24" class="app-manage-row">
      <!-- 新增应用卡片 -->
      <a-col :xxl="4" :xl="6" :lg="6" :md="6" :sm="12" :xs="24">
        <a-card class="add-app-card" @click="handleCreateApp">
          <div class="flex">
            <Icon icon="ant-design:plus-outlined" class="add-app-card-icon" size="20"></Icon>
            <span class="add-app-card-title">创建应用</span>
          </div>
        </a-card>
      </a-col>
      
      <!-- 应用列表卡片 -->
      <a-col :xxl="4" :xl="6" :lg="6" :md="6" :sm="12" :xs="24" v-for="item in appDataList" :key="item.id">
        <a-card class="app-card pointer" @click="handleViewDetail(item)">
          <div class="flex">
            <div class="app-icon">
              <Icon icon="ant-design:appstore-outlined" size="32" color="#1890ff"></Icon>
            </div>
            <div class="header-text">
              <span class="header-text-top app-name ellipsis">{{ item.appName }}</span>
              <span class="header-text-top app-create ellipsis">
                <a-tag color="blue">{{ item.domain_dictText || '未分类' }}</a-tag>
                <span>创建者：{{ item.createBy_dictText || item.createBy }}</span>
              </span>
            </div>
          </div>
          
          <div class="card-description">
            <span>{{ item.appDescription || '暂无描述' }}</span>
          </div>
          
          <div class="card-managers" v-if="item.managers_dictText">
            <Icon icon="ant-design:user-outlined" size="14" style="margin-right: 4px;"></Icon>
            <span class="managers-text">{{ item.managers_dictText }}</span>
          </div>
          
          <div class="card-footer">
            <a-tooltip title="查看详情">
              <div class="card-footer-icon" @click.prevent.stop="handleViewDetail(item)">
                <Icon class="operation" icon="ant-design:eye-outlined" size="18" color="#1F2329"></Icon>
              </div>
            </a-tooltip>
            
            <a-divider type="vertical" style="float: left" />
            
            <a-tooltip title="编辑">
              <div class="card-footer-icon" @click.prevent.stop="handleEditClick(item)">
                <Icon icon="ant-design:edit-outlined" class="operation" size="18" color="#1F2329"></Icon>
              </div>
            </a-tooltip>
            
            <a-divider type="vertical" style="float: left" />
            
            <a-tooltip title="删除">
              <div class="card-footer-icon" @click.prevent.stop="handleDeleteClick(item)">
                <Icon icon="ant-design:delete-outlined" class="operation" size="18" color="#1F2329"></Icon>
              </div>
            </a-tooltip>
            
            <a-divider type="vertical" style="float: left" />
            
            <a-tooltip title="访问Git">
              <div class="card-footer-icon" @click.prevent.stop="handleOpenGit(item.gitUrl)">
                <Icon icon="ant-design:github-outlined" class="operation" size="18" color="#1F2329"></Icon>
              </div>
            </a-tooltip>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 分页 -->
    <Pagination
      v-if="appDataList.length > 0"
      :current="pageNo"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :total="total"
      :showQuickJumper="true"
      :showSizeChanger="true"
      @change="handlePageChange"
      class="list-footer"
      size="small"
      :show-total="() => `共${total}条`"
    />
    
    <!-- 应用管理弹窗 -->
    <AppManageModal @register="registerModal" @success="handleSuccess"></AppManageModal>
  </div>
</template>

<script lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useModal } from '@/components/Modal';
  import { Pagination } from 'ant-design-vue';
  import AppManageModal from './components/AppManageModal.vue';
  import Icon from '@/components/Icon';
  import { getAppList, deleteApp } from './AppManage.api';
  import { useMessage } from '@/hooks/web/useMessage';
  import JInput from '@/components/Form/src/jeecg/components/JInput.vue';
  import JDictSelectTag from '@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { useRouter } from "vue-router";
  import type { AppManageModel, AppManageQueryParam } from './AppManage.data';

  export default {
    name: 'AppManageList',
    components: {
      JDictSelectTag,
      JInput,
      Icon,
      Pagination,
      AppManageModal,
    },
    emits: ['success', 'register'],
    setup(props, { emit }) {
      const router = useRouter();
      
      /**
       * 应用数据列表
       */
      const appDataList = ref<AppManageModel[]>([]);
      
      // 分页相关
      const pageNo = ref<number>(1);
      const pageSize = ref<number>(12);
      const total = ref<number>(0);
      const pageSizeOptions = ref<any>(['12', '24', '36']);
      
      // 弹窗相关
      const [registerModal, { openModal }] = useModal();
      const { createMessage } = useMessage();
      
      // 查询参数
      const queryParam = reactive<AppManageQueryParam>({});
      
      // 查询区域label宽度
      const labelCol = reactive({
        xs: 24,
        sm: 4,
        xl: 6,
      });
      const wrapperCol = reactive({
        xs: 24,
        sm: 20,
        xl: 18,
      });

      /**
       * 加载应用列表数据
       */
      const loadData = async () => {
        try {
          const params = {
            ...queryParam,
            pageNo: pageNo.value,
            pageSize: pageSize.value,
          };
          
          const result = await getAppList(params);
          if (result.success) {
            appDataList.value = result.result.records || [];
            total.value = result.result.total || 0;
          } else {
            createMessage.error(result.message || '加载数据失败');
          }
        } catch (error) {
          console.error('加载应用列表失败:', error);
          createMessage.error('加载数据失败');
        }
      };

      /**
       * 搜索查询
       */
      const searchQuery = () => {
        pageNo.value = 1;
        loadData();
      };

      /**
       * 重置搜索
       */
      const searchReset = () => {
        Object.keys(queryParam).forEach(key => {
          queryParam[key] = undefined;
        });
        pageNo.value = 1;
        loadData();
      };

      /**
       * 分页变化处理
       */
      const handlePageChange = (page: number, size: number) => {
        pageNo.value = page;
        pageSize.value = size;
        loadData();
      };

      /**
       * 创建应用
       * 打开模板选择和应用创建的两步流程弹窗
       */
      const handleCreateApp = () => {
        openModal(true, {
          isUpdate: false,
        });
      };

      /**
       * 编辑应用
       */
      const handleEditClick = (record: AppManageModel) => {
        openModal(true, {
          record,
          isUpdate: true,
        });
      };

      /**
       * 查看应用详情
       */
      const handleViewDetail = (record: AppManageModel) => {
        console.log('跳转到应用详情，ID:', record.id);
        router.push(`/appmanage/detail/${record.id}`);
      };

      /**
       * 删除应用
       */
      const handleDeleteClick = (record: AppManageModel) => {
        deleteApp({ id: record.id }, () => {
          createMessage.success('删除成功');
          loadData();
        });
      };

      /**
       * 打开Git地址
       */
      const handleOpenGit = (gitUrl: string) => {
        if (gitUrl) {
          window.open(gitUrl, '_blank');
        } else {
          createMessage.warning('Git地址为空');
        }
      };

      /**
       * 操作成功回调
       * @param result 创建或更新的应用信息
       */
      const handleSuccess = (result) => {
        // 如果是新建应用且有返回结果，跳转到应用详情页
        if (result && result.id) {
          console.log('新建应用成功，跳转到详情页:', result);
          router.push(`/appmanage/detail/${result.id}?tab=basic`);
        } else {
          // 否则刷新列表
          loadData();
        }
      };

      // 组件挂载时加载数据
      onMounted(() => {
        loadData();
      });

      return {
        appDataList,
        pageNo,
        pageSize,
        total,
        pageSizeOptions,
        queryParam,
        labelCol,
        wrapperCol,
        registerModal,
        searchQuery,
        searchReset,
        handlePageChange,
        handleCreateApp,
        handleEditClick,
        handleViewDetail,
        handleDeleteClick,
        handleOpenGit,
        handleSuccess,
      };
    },
  };
</script>

<style lang="less" scoped>
  .app-manage {
    padding: 16px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 64px);

    .app-manage-row {
      margin-top: 16px;
      
      :deep(.ant-col) {
        padding: 12px;
        margin-bottom: 16px;
      }
    }

    .add-app-card {
      height: 200px;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #1890ff;
        background-color: #f6ffed;
      }

      .flex {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .add-app-card-icon {
        color: #1890ff;
      }

      .add-app-card-title {
        color: #1890ff;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .app-card {
      height: 200px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .flex {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .app-icon {
        flex-shrink: 0;
      }

      .header-text {
        flex: 1;
        min-width: 0;

        .app-name {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 4px;
        }

        .app-create {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .card-description {
        margin-bottom: 12px;
        font-size: 14px;
        color: #595959;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 36px;
      }

      .card-managers {
        margin-bottom: 12px;
        font-size: 12px;
        color: #8c8c8c;
        display: flex;
        align-items: center;

        .managers-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .card-footer {
        position: absolute;
        bottom: 16px;
        left: 16px;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        .card-footer-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: #f5f5f5;
          }
        }
      }
    }

    .list-footer {
      margin-top: 24px;
      text-align: center;
    }

    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pointer {
      cursor: pointer;
    }
  }
</style>