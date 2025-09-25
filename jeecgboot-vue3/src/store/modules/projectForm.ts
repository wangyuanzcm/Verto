import { defineStore } from 'pinia';
import { store } from '/@/store';
import { ProjectFormData } from '/@/views/project/Project.data';

/**
 * 项目表单状态接口
 */
interface ProjectFormState {
  // 当前步骤
  currentStep: number;
  // 表单数据
  formData: ProjectFormData;
  // 是否为编辑模式
  isEdit: boolean;
  // 编辑的原始数据
  originalData: Partial<ProjectFormData> | null;
  // 临时数据缓存（用于步骤间切换）
  tempData: Partial<ProjectFormData>;
}

/**
 * 项目表单Store
 * 用于管理分步表单的数据状态和步骤切换
 */
export const useProjectFormStore = defineStore({
  id: 'project-form',
  state: (): ProjectFormState => ({
    currentStep: 0,
    formData: {
      id: '',
      type: 'requirement',
      requirementId: '',
      bugId: '',
      title: '',
      description: '',
      appId: '',
      developerId: '',
      status: 'planning',
      priority: 'medium',
      gitBranch: '',
      designLinks: [],
      startTime: '',
      testTime: '',
      onlineTime: '',
      releaseTime: '',
      remark: '',
    },
    isEdit: false,
    originalData: null,
    tempData: {},
  }),

  getters: {
    /**
     * 获取当前步骤
     */
    getCurrentStep(): number {
      return this.currentStep;
    },

    /**
     * 获取表单数据
     */
    getFormData(): ProjectFormData {
      return this.formData;
    },

    /**
     * 获取是否为编辑模式
     */
    getIsEdit(): boolean {
      return this.isEdit;
    },

    /**
     * 获取临时数据
     */
    getTempData(): Partial<ProjectFormData> {
      return this.tempData;
    },

    /**
     * 检查是否有未保存的更改
     */
    hasUnsavedChanges(): boolean {
      if (!this.isEdit || !this.originalData) return false;
      
      // 比较当前数据与原始数据
      const current = JSON.stringify(this.formData);
      const original = JSON.stringify({
        ...this.formData,
        ...this.originalData,
      });
      
      return current !== original;
    },
  },

  actions: {
    /**
     * 初始化表单数据
     * @param editData 编辑数据（可选）
     */
    initFormData(editData?: Partial<ProjectFormData>) {
      if (editData && editData.id) {
        // 编辑模式
        this.isEdit = true;
        this.originalData = { ...editData };
        this.formData = {
          ...this.formData,
          ...editData,
          designLinks: editData.designLinks || [],
        };
        this.tempData = { ...this.formData };
      } else {
        // 新建模式
        this.isEdit = false;
        this.originalData = null;
        this.resetFormData();
      }
      this.currentStep = 0;
    },

    /**
     * 重置表单数据
     */
    resetFormData() {
      this.formData = {
        id: '',
        type: 'requirement',
        requirementId: '',
        bugId: '',
        title: '',
        description: '',
        appId: '',
        developerId: '',
        status: 'planning',
        priority: 'medium',
        gitBranch: '',
        designLinks: [],
        startTime: '',
        testTime: '',
        onlineTime: '',
        releaseTime: '',
        remark: '',
      };
      this.tempData = {};
      this.currentStep = 0;
    },

    /**
     * 更新表单数据
     * @param data 部分表单数据
     */
    updateFormData(data: Partial<ProjectFormData>) {
      Object.assign(this.formData, data);
      Object.assign(this.tempData, data);
    },

    /**
     * 设置当前步骤
     * @param step 步骤索引
     */
    setCurrentStep(step: number) {
      this.currentStep = step;
    },

    /**
     * 下一步
     */
    nextStep() {
      if (this.currentStep < 2) {
        this.currentStep++;
      }
    },

    /**
     * 上一步
     */
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },

    /**
     * 保存临时数据到表单数据
     */
    saveTempDataToForm() {
      Object.assign(this.formData, this.tempData);
    },

    /**
     * 从表单数据恢复临时数据
     */
    restoreTempDataFromForm() {
      this.tempData = { ...this.formData };
    },

    /**
     * 清除临时数据
     */
    clearTempData() {
      this.tempData = {};
    },

    /**
     * 清除所有数据
     */
    clearAll() {
      this.resetFormData();
      this.isEdit = false;
      this.originalData = null;
      this.tempData = {};
      this.currentStep = 0;
    },
  },
});

/**
 * 在setup外使用
 */
export function useProjectFormStoreWithOut() {
  return useProjectFormStore(store);
}