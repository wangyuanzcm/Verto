<template>
  <div class="v-form">
    <el-form
      ref="formRef"
      :model="modelValue"
      :rules="rules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :label-suffix="labelSuffix"
      :inline="inline"
      :inline-message="inlineMessage"
      :status-icon="statusIcon"
      :show-message="showMessage"
      :size="size"
      :disabled="disabled"
      :validate-on-rule-change="validateOnRuleChange"
      :hide-required-asterisk="hideRequiredAsterisk"
      :require-asterisk-position="requireAsteriskPosition"
      :scroll-to-error="scrollToError"
      @validate="handleValidate"
    >
      <template v-for="(item, index) in formItems" :key="item.prop || index">
        <!-- 分组标题 -->
        <div v-if="item.type === 'group'" class="v-form__group">
          <div class="v-form__group-title">
            <el-icon v-if="item.icon" class="v-form__group-icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </div>
          <div v-if="item.description" class="v-form__group-description">
            {{ item.description }}
          </div>
        </div>
        
        <!-- 分割线 -->
        <el-divider v-else-if="item.type === 'divider'" :content-position="item.contentPosition || 'center'">
          {{ item.label }}
        </el-divider>
        
        <!-- 表单项 -->
        <el-form-item
          v-else
          :prop="item.prop"
          :label="item.label"
          :label-width="item.labelWidth"
          :required="item.required"
          :rules="item.rules"
          :error="item.error"
          :show-message="item.showMessage !== false"
          :inline-message="item.inlineMessage"
          :size="item.size || size"
          :class="[
            'v-form__item',
            `v-form__item--${item.type || 'input'}`,
            item.className
          ]"
        >
          <!-- 输入框 -->
          <el-input
            v-if="item.type === 'input' || !item.type"
            v-model="modelValue[item.prop]"
            :type="item.inputType || 'text'"
            :placeholder="item.placeholder"
            :clearable="item.clearable !== false"
            :show-password="item.showPassword"
            :show-word-limit="item.showWordLimit"
            :maxlength="item.maxlength"
            :minlength="item.minlength"
            :disabled="item.disabled || disabled"
            :readonly="item.readonly"
            :resize="item.resize"
            :autosize="item.autosize"
            :autocomplete="item.autocomplete"
            :name="item.name"
            :max="item.max"
            :min="item.min"
            :step="item.step"
            :size="item.size || size"
            :prefix-icon="item.prefixIcon"
            :suffix-icon="item.suffixIcon"
            :rows="item.rows"
            :validate-event="item.validateEvent !== false"
            @blur="handleBlur(item, $event)"
            @focus="handleFocus(item, $event)"
            @change="handleChange(item, $event)"
            @input="handleInput(item, $event)"
            @clear="handleClear(item)"
          >
            <template v-if="item.prepend" #prepend>
              <span>{{ item.prepend }}</span>
            </template>
            <template v-if="item.append" #append>
              <span>{{ item.append }}</span>
            </template>
            <template v-if="item.prefix" #prefix>
              <el-icon><component :is="item.prefix" /></el-icon>
            </template>
            <template v-if="item.suffix" #suffix>
              <el-icon><component :is="item.suffix" /></el-icon>
            </template>
          </el-input>
          
          <!-- 文本域 -->
          <el-input
            v-else-if="item.type === 'textarea'"
            v-model="modelValue[item.prop]"
            type="textarea"
            :placeholder="item.placeholder"
            :clearable="item.clearable !== false"
            :show-word-limit="item.showWordLimit"
            :maxlength="item.maxlength"
            :minlength="item.minlength"
            :disabled="item.disabled || disabled"
            :readonly="item.readonly"
            :resize="item.resize"
            :autosize="item.autosize"
            :rows="item.rows || 3"
            :size="item.size || size"
            :validate-event="item.validateEvent !== false"
            @blur="handleBlur(item, $event)"
            @focus="handleFocus(item, $event)"
            @change="handleChange(item, $event)"
            @input="handleInput(item, $event)"
            @clear="handleClear(item)"
          />
          
          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="item.type === 'number'"
            v-model="modelValue[item.prop]"
            :placeholder="item.placeholder"
            :min="item.min"
            :max="item.max"
            :step="item.step || 1"
            :step-strictly="item.stepStrictly"
            :precision="item.precision"
            :disabled="item.disabled || disabled"
            :readonly="item.readonly"
            :controls="item.controls !== false"
            :controls-position="item.controlsPosition"
            :size="item.size || size"
            :value-on-clear="item.valueOnClear"
            :validate-event="item.validateEvent !== false"
            @blur="handleBlur(item, $event)"
            @focus="handleFocus(item, $event)"
            @change="handleChange(item, $event)"
          />
          
          <!-- 选择器 -->
          <el-select
            v-else-if="item.type === 'select'"
            v-model="modelValue[item.prop]"
            :placeholder="item.placeholder"
            :multiple="item.multiple"
            :disabled="item.disabled || disabled"
            :value-key="item.valueKey"
            :size="item.size || size"
            :clearable="item.clearable !== false"
            :collapse-tags="item.collapseTags"
            :collapse-tags-tooltip="item.collapseTagsTooltip"
            :multiple-limit="item.multipleLimit"
            :name="item.name"
            :effect="item.effect"
            :autocomplete="item.autocomplete"
            :filterable="item.filterable"
            :allow-create="item.allowCreate"
            :filter-method="item.filterMethod"
            :remote="item.remote"
            :remote-method="item.remoteMethod"
            :remote-show-suffix="item.remoteShowSuffix"
            :loading="item.loading"
            :loading-text="item.loadingText"
            :no-match-text="item.noMatchText"
            :no-data-text="item.noDataText"
            :popper-class="item.popperClass"
            :reserve-keyword="item.reserveKeyword"
            :default-first-option="item.defaultFirstOption"
            :teleported="item.teleported !== false"
            :persistent="item.persistent"
            :automatic-dropdown="item.automaticDropdown"
            :clear-icon="item.clearIcon"
            :fit-input-width="item.fitInputWidth"
            :suffix-icon="item.suffixIcon"
            :tag-type="item.tagType"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
            @visible-change="handleVisibleChange(item, $event)"
            @remove-tag="handleRemoveTag(item, $event)"
            @clear="handleClear(item)"
            @blur="handleBlur(item, $event)"
            @focus="handleFocus(item, $event)"
          >
            <el-option
              v-for="option in item.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </el-select>
          
          <!-- 级联选择器 -->
          <el-cascader
            v-else-if="item.type === 'cascader'"
            v-model="modelValue[item.prop]"
            :options="item.options"
            :placeholder="item.placeholder"
            :size="item.size || size"
            :disabled="item.disabled || disabled"
            :clearable="item.clearable !== false"
            :show-all-levels="item.showAllLevels !== false"
            :collapse-tags="item.collapseTags"
            :collapse-tags-tooltip="item.collapseTagsTooltip"
            :separator="item.separator || ' / '"
            :filterable="item.filterable"
            :filter-method="item.filterMethod"
            :debounce="item.debounce"
            :before-filter="item.beforeFilter"
            :popper-class="item.popperClass"
            :teleported="item.teleported !== false"
            :tag-type="item.tagType"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
            @expand-change="handleExpandChange(item, $event)"
            @blur="handleBlur(item, $event)"
            @focus="handleFocus(item, $event)"
            @visible-change="handleVisibleChange(item, $event)"
            @remove-tag="handleRemoveTag(item, $event)"
          />
          
          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="modelValue[item.prop]"
            :type="item.dateType || 'date'"
            :placeholder="item.placeholder"
            :start-placeholder="item.startPlaceholder"
            :end-placeholder="item.endPlaceholder"
            :format="item.format"
            :value-format="item.valueFormat"
            :size="item.size || size"
            :disabled="item.disabled || disabled"
            :clearable="item.clearable !== false"
            :readonly="item.readonly"
            :editable="item.editable !== false"
            :prefix-icon="item.prefixIcon"
            :clear-icon="item.clearIcon"
            :name="item.name"
            :disabled-date="item.disabledDate"
            :shortcuts="item.shortcuts"
            :cell-class-name="item.cellClassName"
            :range-separator="item.rangeSeparator"
            :default-value="item.defaultValue"
            :default-time="item.defaultTime"
            :popper-class="item.popperClass"
            :teleported="item.teleported !== false"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
            @blur="handleBlur(item, $event)"
            @focus="handleFocus(item, $event)"
            @calendar-change="handleCalendarChange(item, $event)"
            @panel-change="handlePanelChange(item, $event)"
            @visible-change="handleVisibleChange(item, $event)"
          />
          
          <!-- 时间选择器 -->
          <el-time-picker
            v-else-if="item.type === 'time'"
            v-model="modelValue[item.prop]"
            :placeholder="item.placeholder"
            :start-placeholder="item.startPlaceholder"
            :end-placeholder="item.endPlaceholder"
            :is-range="item.isRange"
            :arrow-control="item.arrowControl"
            :format="item.format"
            :value-format="item.valueFormat"
            :size="item.size || size"
            :disabled="item.disabled || disabled"
            :clearable="item.clearable !== false"
            :readonly="item.readonly"
            :editable="item.editable !== false"
            :prefix-icon="item.prefixIcon"
            :clear-icon="item.clearIcon"
            :name="item.name"
            :disabled-hours="item.disabledHours"
            :disabled-minutes="item.disabledMinutes"
            :disabled-seconds="item.disabledSeconds"
            :range-separator="item.rangeSeparator"
            :default-value="item.defaultValue"
            :popper-class="item.popperClass"
            :teleported="item.teleported !== false"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
            @blur="handleBlur(item, $event)"
            @focus="handleFocus(item, $event)"
            @visible-change="handleVisibleChange(item, $event)"
          />
          
          <!-- 开关 -->
          <el-switch
            v-else-if="item.type === 'switch'"
            v-model="modelValue[item.prop]"
            :disabled="item.disabled || disabled"
            :loading="item.loading"
            :size="item.size || size"
            :width="item.width"
            :inline-prompt="item.inlinePrompt"
            :active-icon="item.activeIcon"
            :inactive-icon="item.inactiveIcon"
            :active-text="item.activeText"
            :inactive-text="item.inactiveText"
            :active-value="item.activeValue"
            :inactive-value="item.inactiveValue"
            :active-color="item.activeColor"
            :inactive-color="item.inactiveColor"
            :border-color="item.borderColor"
            :name="item.name"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
          />
          
          <!-- 单选框组 -->
          <el-radio-group
            v-else-if="item.type === 'radio'"
            v-model="modelValue[item.prop]"
            :size="item.size || size"
            :disabled="item.disabled || disabled"
            :text-color="item.textColor"
            :fill="item.fill"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
          >
            <template v-if="item.optionType === 'button'">
              <el-radio-button
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                :disabled="option.disabled"
                :name="option.name"
              >
                {{ option.label }}
              </el-radio-button>
            </template>
            <template v-else>
              <el-radio
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                :disabled="option.disabled"
                :border="item.border"
                :name="option.name"
              >
                {{ option.label }}
              </el-radio>
            </template>
          </el-radio-group>
          
          <!-- 多选框组 -->
          <el-checkbox-group
            v-else-if="item.type === 'checkbox'"
            v-model="modelValue[item.prop]"
            :size="item.size || size"
            :disabled="item.disabled || disabled"
            :min="item.min"
            :max="item.max"
            :text-color="item.textColor"
            :fill="item.fill"
            :tag="item.tag"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
          >
            <template v-if="item.optionType === 'button'">
              <el-checkbox-button
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                :disabled="option.disabled"
                :name="option.name"
                :true-label="option.trueLabel"
                :false-label="option.falseLabel"
              >
                {{ option.label }}
              </el-checkbox-button>
            </template>
            <template v-else>
              <el-checkbox
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                :disabled="option.disabled"
                :border="item.border"
                :name="option.name"
                :true-label="option.trueLabel"
                :false-label="option.falseLabel"
                :indeterminate="option.indeterminate"
              >
                {{ option.label }}
              </el-checkbox>
            </template>
          </el-checkbox-group>
          
          <!-- 滑块 -->
          <el-slider
            v-else-if="item.type === 'slider'"
            v-model="modelValue[item.prop]"
            :min="item.min || 0"
            :max="item.max || 100"
            :disabled="item.disabled || disabled"
            :step="item.step || 1"
            :show-input="item.showInput"
            :show-input-controls="item.showInputControls"
            :input-size="item.inputSize"
            :show-stops="item.showStops"
            :show-tooltip="item.showTooltip !== false"
            :format-tooltip="item.formatTooltip"
            :range="item.range"
            :vertical="item.vertical"
            :height="item.height"
            :label="item.sliderLabel"
            :debounce="item.debounce"
            :tooltip-class="item.tooltipClass"
            :marks="item.marks"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
            @input="handleInput(item, $event)"
          />
          
          <!-- 评分 -->
          <el-rate
            v-else-if="item.type === 'rate'"
            v-model="modelValue[item.prop]"
            :max="item.max || 5"
            :disabled="item.disabled || disabled"
            :allow-half="item.allowHalf"
            :low-threshold="item.lowThreshold"
            :high-threshold="item.highThreshold"
            :colors="item.colors"
            :void-color="item.voidColor"
            :disabled-void-color="item.disabledVoidColor"
            :icon-classes="item.iconClasses"
            :void-icon-class="item.voidIconClass"
            :disabled-void-icon-class="item.disabledVoidIconClass"
            :show-text="item.showText"
            :show-score="item.showScore"
            :text-color="item.textColor"
            :texts="item.texts"
            :score-template="item.scoreTemplate"
            :size="item.size || size"
            @change="handleChange(item, $event)"
          />
          
          <!-- 颜色选择器 -->
          <el-color-picker
            v-else-if="item.type === 'color'"
            v-model="modelValue[item.prop]"
            :disabled="item.disabled || disabled"
            :size="item.size || size"
            :show-alpha="item.showAlpha"
            :color-format="item.colorFormat"
            :popper-class="item.popperClass"
            :predefine="item.predefine"
            :validate-event="item.validateEvent !== false"
            @change="handleChange(item, $event)"
            @active-change="handleActiveChange(item, $event)"
          />
          
          <!-- 上传 -->
          <el-upload
            v-else-if="item.type === 'upload'"
            v-model:file-list="modelValue[item.prop]"
            :action="item.action"
            :headers="item.headers"
            :method="item.method"
            :multiple="item.multiple"
            :data="item.data"
            :name="item.name"
            :with-credentials="item.withCredentials"
            :show-file-list="item.showFileList !== false"
            :drag="item.drag"
            :accept="item.accept"
            :on-preview="item.onPreview"
            :on-remove="item.onRemove"
            :on-success="item.onSuccess"
            :on-error="item.onError"
            :on-progress="item.onProgress"
            :on-change="item.onChange"
            :before-upload="item.beforeUpload"
            :before-remove="item.beforeRemove"
            :list-type="item.listType"
            :auto-upload="item.autoUpload !== false"
            :file-list="item.fileList"
            :http-request="item.httpRequest"
            :disabled="item.disabled || disabled"
            :limit="item.limit"
            :on-exceed="item.onExceed"
          >
            <template v-if="item.drag">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                {{ item.dragText || '将文件拖到此处，或' }}
                <em>{{ item.clickText || '点击上传' }}</em>
              </div>
            </template>
            <template v-else-if="item.listType === 'picture-card'">
              <el-icon><Plus /></el-icon>
            </template>
            <template v-else>
              <VButton type="primary" :icon="Upload">
                {{ item.buttonText || '点击上传' }}
              </VButton>
            </template>
            <template v-if="item.tip" #tip>
              <div class="el-upload__tip">{{ item.tip }}</div>
            </template>
          </el-upload>
          
          <!-- 自定义插槽 -->
          <template v-else-if="item.type === 'slot'">
            <slot :name="item.slot" :item="item" :model="modelValue" />
          </template>
          
          <!-- 帮助文本 -->
          <template v-if="item.help" #label>
            <span class="v-form__label">
              {{ item.label }}
              <el-tooltip v-if="item.help" :content="item.help" placement="top">
                <el-icon class="v-form__help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
        </el-form-item>
      </template>
      
      <!-- 表单操作按钮 -->
      <el-form-item v-if="showActions" class="v-form__actions">
        <slot name="actions" :loading="loading" :validate="validate" :reset="resetFields">
          <VButton
            v-if="showSubmit"
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ submitText }}
          </VButton>
          <VButton
            v-if="showReset"
            type="default"
            @click="handleReset"
          >
            {{ resetText }}
          </VButton>
          <VButton
            v-if="showCancel"
            type="default"
            @click="handleCancel"
          >
            {{ cancelText }}
          </VButton>
        </slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type Ref } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElCascader,
  ElDatePicker,
  ElTimePicker,
  ElSwitch,
  ElRadioGroup,
  ElRadio,
  ElRadioButton,
  ElCheckboxGroup,
  ElCheckbox,
  ElCheckboxButton,
  ElSlider,
  ElRate,
  ElColorPicker,
  ElUpload,
  ElDivider,
  ElIcon,
  ElTooltip,
  type FormInstance,
  type FormRules
} from 'element-plus'
import {
  QuestionFilled,
  UploadFilled,
  Plus,
  Upload
} from '@element-plus/icons-vue'
import VButton from './VButton.vue'

/**
 * 自定义表单组件
 * 基于Element Plus Form扩展，提供更多表单项类型和功能
 */

// 表单项选项接口
interface FormOption {
  label: string
  value: any
  disabled?: boolean
  name?: string
  trueLabel?: string | number
  falseLabel?: string | number
  indeterminate?: boolean
}

// 表单项接口
interface FormItem {
  type?: 'input' | 'textarea' | 'number' | 'select' | 'cascader' | 'date' | 'time' | 'switch' | 'radio' | 'checkbox' | 'slider' | 'rate' | 'color' | 'upload' | 'slot' | 'group' | 'divider'
  prop?: string
  label?: string
  labelWidth?: string | number
  required?: boolean
  rules?: any[]
  error?: string
  showMessage?: boolean
  inlineMessage?: boolean
  size?: 'large' | 'default' | 'small'
  className?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  help?: string
  description?: string
  icon?: any
  contentPosition?: 'left' | 'center' | 'right'
  
  // 输入框相关
  inputType?: string
  showPassword?: boolean
  showWordLimit?: boolean
  maxlength?: number
  minlength?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  autosize?: boolean | object
  autocomplete?: string
  name?: string
  max?: number
  min?: number
  step?: number
  prefixIcon?: any
  suffixIcon?: any
  rows?: number
  validateEvent?: boolean
  prepend?: string
  append?: string
  prefix?: any
  suffix?: any
  
  // 数字输入框相关
  stepStrictly?: boolean
  precision?: number
  controls?: boolean
  controlsPosition?: 'right' | ''
  valueOnClear?: number | 'min' | 'max'
  
  // 选择器相关
  options?: FormOption[]
  multiple?: boolean
  valueKey?: string
  collapseTags?: boolean
  collapseTagsTooltip?: boolean
  multipleLimit?: number
  effect?: 'dark' | 'light'
  filterable?: boolean
  allowCreate?: boolean
  filterMethod?: Function
  remote?: boolean
  remoteMethod?: Function
  remoteShowSuffix?: boolean
  loading?: boolean
  loadingText?: string
  noMatchText?: string
  noDataText?: string
  popperClass?: string
  reserveKeyword?: boolean
  defaultFirstOption?: boolean
  teleported?: boolean
  persistent?: boolean
  automaticDropdown?: boolean
  clearIcon?: any
  fitInputWidth?: boolean
  tagType?: 'success' | 'info' | 'warning' | 'danger'
  
  // 级联选择器相关
  showAllLevels?: boolean
  separator?: string
  debounce?: number
  beforeFilter?: Function
  
  // 日期选择器相关
  dateType?: string
  startPlaceholder?: string
  endPlaceholder?: string
  format?: string
  valueFormat?: string
  editable?: boolean
  clearIcon?: any
  disabledDate?: Function
  shortcuts?: any[]
  cellClassName?: Function
  rangeSeparator?: string
  defaultValue?: Date | [Date, Date]
  defaultTime?: Date | [Date, Date]
  
  // 时间选择器相关
  isRange?: boolean
  arrowControl?: boolean
  disabledHours?: Function
  disabledMinutes?: Function
  disabledSeconds?: Function
  
  // 开关相关
  width?: number
  inlinePrompt?: boolean
  activeIcon?: any
  inactiveIcon?: any
  activeText?: string
  inactiveText?: string
  activeValue?: boolean | string | number
  inactiveValue?: boolean | string | number
  activeColor?: string
  inactiveColor?: string
  borderColor?: string
  
  // 单选框/多选框相关
  optionType?: 'default' | 'button'
  textColor?: string
  fill?: string
  border?: boolean
  tag?: string
  
  // 滑块相关
  showInput?: boolean
  showInputControls?: boolean
  inputSize?: 'large' | 'default' | 'small'
  showStops?: boolean
  showTooltip?: boolean
  formatTooltip?: Function
  range?: boolean
  vertical?: boolean
  height?: string
  sliderLabel?: string
  tooltipClass?: string
  marks?: object
  
  // 评分相关
  allowHalf?: boolean
  lowThreshold?: number
  highThreshold?: number
  colors?: string[] | object
  voidColor?: string
  disabledVoidColor?: string
  iconClasses?: string[] | object
  voidIconClass?: string
  disabledVoidIconClass?: string
  showText?: boolean
  showScore?: boolean
  textColor?: string
  texts?: string[]
  scoreTemplate?: string
  
  // 颜色选择器相关
  showAlpha?: boolean
  colorFormat?: 'hsl' | 'hsv' | 'hex' | 'rgb'
  predefine?: string[]
  
  // 上传相关
  action?: string
  headers?: object
  method?: string
  data?: object
  withCredentials?: boolean
  showFileList?: boolean
  drag?: boolean
  accept?: string
  onPreview?: Function
  onRemove?: Function
  onSuccess?: Function
  onError?: Function
  onProgress?: Function
  onChange?: Function
  beforeUpload?: Function
  beforeRemove?: Function
  listType?: 'text' | 'picture' | 'picture-card'
  autoUpload?: boolean
  fileList?: any[]
  httpRequest?: Function
  limit?: number
  onExceed?: Function
  dragText?: string
  clickText?: string
  buttonText?: string
  tip?: string
  
  // 自定义插槽
  slot?: string
}

// 定义组件属性
interface Props {
  /** 表单数据对象 */
  modelValue: Record<string, any>
  /** 表单项配置 */
  formItems: FormItem[]
  /** 表单验证规则 */
  rules?: FormRules
  /** 表单域标签的宽度 */
  labelWidth?: string | number
  /** 表单域标签的位置 */
  labelPosition?: 'left' | 'right' | 'top'
  /** 表单域标签的后缀 */
  labelSuffix?: string
  /** 行内表单模式 */
  inline?: boolean
  /** 是否在输入框中显示校验结果反馈图标 */
  statusIcon?: boolean
  /** 是否显示校验错误信息 */
  showMessage?: boolean
  /** 是否以行内形式展示校验信息 */
  inlineMessage?: boolean
  /** 用于控制该表单内组件的尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 是否禁用该表单内的所有组件 */
  disabled?: boolean
  /** 是否在 rules 属性改变后立即触发一次验证 */
  validateOnRuleChange?: boolean
  /** 是否隐藏必填字段的标签旁边的红色星号 */
  hideRequiredAsterisk?: boolean
  /** 星号的位置 */
  requireAsteriskPosition?: 'left' | 'right'
  /** 当校验失败时，滚动到第一个错误表单项 */
  scrollToError?: boolean
  /** 是否显示操作按钮 */
  showActions?: boolean
  /** 是否显示提交按钮 */
  showSubmit?: boolean
  /** 是否显示重置按钮 */
  showReset?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 提交按钮文本 */
  submitText?: string
  /** 重置按钮文本 */
  resetText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否加载中 */
  loading?: boolean
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  formItems: () => [],
  labelWidth: '100px',
  labelPosition: 'right',
  labelSuffix: '',
  inline: false,
  statusIcon: false,
  showMessage: true,
  inlineMessage: false,
  size: 'default',
  disabled: false,
  validateOnRuleChange: true,
  hideRequiredAsterisk: false,
  requireAsteriskPosition: 'left',
  scrollToError: false,
  showActions: true,
  showSubmit: true,
  showReset: true,
  showCancel: false,
  submitText: '提交',
  resetText: '重置',
  cancelText: '取消',
  loading: false
})

// 定义事件
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  validate: [prop: string, isValid: boolean, message: string]
  submit: [data: Record<string, any>]
  reset: []
  cancel: []
  blur: [item: FormItem, event: Event]
  focus: [item: FormItem, event: Event]
  change: [item: FormItem, value: any]
  input: [item: FormItem, value: any]
  clear: [item: FormItem]
  visibleChange: [item: FormItem, visible: boolean]
  removeTag: [item: FormItem, tag: any]
  expandChange: [item: FormItem, value: any]
  calendarChange: [item: FormItem, value: any]
  panelChange: [item: FormItem, value: any]
  activeChange: [item: FormItem, value: any]
}>

// 响应式数据
const formRef: Ref<FormInstance | null> = ref(null)

// 监听表单数据变化
watch(
  () => props.modelValue,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

/**
 * 处理表单验证
 */
const handleValidate = (prop: string, isValid: boolean, message: string) => {
  emit('validate', prop, isValid, message)
}

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  try {
    const valid = await validate()
    if (valid) {
      emit('submit', props.modelValue)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 处理表单重置
 */
const handleReset = () => {
  resetFields()
  emit('reset')
}

/**
 * 处理取消
 */
const handleCancel = () => {
  emit('cancel')
}

/**
 * 处理失焦事件
 */
const handleBlur = (item: FormItem, event: Event) => {
  emit('blur', item, event)
}

/**
 * 处理聚焦事件
 */
const handleFocus = (item: FormItem, event: Event) => {
  emit('focus', item, event)
}

/**
 * 处理值变化事件
 */
const handleChange = (item: FormItem, value: any) => {
  emit('change', item, value)
}

/**
 * 处理输入事件
 */
const handleInput = (item: FormItem, value: any) => {
  emit('input', item, value)
}

/**
 * 处理清空事件
 */
const handleClear = (item: FormItem) => {
  emit('clear', item)
}

/**
 * 处理可见性变化事件
 */
const handleVisibleChange = (item: FormItem, visible: boolean) => {
  emit('visibleChange', item, visible)
}

/**
 * 处理标签移除事件
 */
const handleRemoveTag = (item: FormItem, tag: any) => {
  emit('removeTag', item, tag)
}

/**
 * 处理展开变化事件
 */
const handleExpandChange = (item: FormItem, value: any) => {
  emit('expandChange', item, value)
}

/**
 * 处理日历变化事件
 */
const handleCalendarChange = (item: FormItem, value: any) => {
  emit('calendarChange', item, value)
}

/**
 * 处理面板变化事件
 */
const handlePanelChange = (item: FormItem, value: any) => {
  emit('panelChange', item, value)
}

/**
 * 处理活动颜色变化事件
 */
const handleActiveChange = (item: FormItem, value: any) => {
  emit('activeChange', item, value)
}

/**
 * 对整个表单进行校验
 */
const validate = (callback?: Function): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!formRef.value) {
      resolve(false)
      return
    }
    
    formRef.value.validate((valid: boolean, fields?: any) => {
      if (callback) {
        callback(valid, fields)
      }
      resolve(valid)
    })
  })
}

/**
 * 对部分表单字段进行校验
 */
const validateField = (props: string | string[], callback?: Function): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!formRef.value) {
      resolve(false)
      return
    }
    
    formRef.value.validateField(props, (errorMessage?: string) => {
      const valid = !errorMessage
      if (callback) {
        callback(valid, errorMessage)
      }
      resolve(valid)
    })
  })
}

/**
 * 重置整个表单
 */
const resetFields = () => {
  formRef.value?.resetFields()
}

/**
 * 清理某个字段的表单验证信息
 */
const clearValidate = (props?: string | string[]) => {
  formRef.value?.clearValidate(props)
}

/**
 * 滚动到指定表单字段
 */
const scrollToField = (prop: string) => {
  formRef.value?.scrollToField(prop)
}

// 暴露方法
defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.v-form {
  &__group {
    margin: 24px 0 16px;
    
    &:first-child {
      margin-top: 0;
    }
    
    &-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: $font-size-large;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }
    
    &-icon {
      color: var(--el-color-primary);
    }
    
    &-description {
      font-size: $font-size-small;
      color: var(--el-text-color-regular);
      line-height: 1.5;
    }
  }
  
  &__item {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    // 特殊表单项样式
    &--switch {
      :deep(.el-form-item__content) {
        line-height: 32px;
      }
    }
    
    &--slider {
      :deep(.el-form-item__content) {
        padding-right: 20px;
      }
    }
    
    &--rate {
      :deep(.el-form-item__content) {
        line-height: 32px;
      }
    }
    
    &--upload {
      :deep(.el-form-item__content) {
        line-height: 1;
      }
    }
  }
  
  &__label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  &__help-icon {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
    cursor: help;
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
  
  &__actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-lighter);
    
    :deep(.el-form-item__content) {
      display: flex;
      gap: 12px;
      justify-content: flex-start;
    }
  }
  
  // 行内表单样式
  &.inline {
    .v-form__item {
      margin-bottom: 16px;
    }
    
    .v-form__actions {
      margin-top: 16px;
      padding-top: 16px;
    }
  }
  
  // 响应式设计
  @include mobile {
    .v-form__group {
      margin: 16px 0 12px;
      
      &-title {
        font-size: $font-size-base;
      }
    }
    
    .v-form__item {
      margin-bottom: 16px;
    }
    
    .v-form__actions {
      margin-top: 24px;
      padding-top: 16px;
      
      :deep(.el-form-item__content) {
        flex-direction: column;
        align-items: stretch;
      }
    }
    
    // 移动端表单项全宽
    :deep(.el-form-item__content) {
      .el-input,
      .el-select,
      .el-cascader,
      .el-date-editor,
      .el-time-picker {
        width: 100% !important;
      }
    }
  }
  
  @include tablet {
    .v-form__actions {
      :deep(.el-form-item__content) {
        flex-wrap: wrap;
      }
    }
  }
}

// Element Plus 组件样式增强
:deep(.el-form) {
  // 表单项标签样式
  .el-form-item__label {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  
  // 必填星号样式
  .el-form-item.is-required {
    .el-form-item__label::before {
      color: var(--el-color-danger);
    }
  }
  
  // 错误状态样式
  .el-form-item.is-error {
    .el-form-item__content {
      .el-input__wrapper,
      .el-textarea__inner,
      .el-select__wrapper {
        box-shadow: 0 0 0 1px var(--el-color-danger) inset;
      }
    }
  }
  
  // 成功状态样式
  .el-form-item.is-success {
    .el-form-item__content {
      .el-input__wrapper,
      .el-textarea__inner,
      .el-select__wrapper {
        box-shadow: 0 0 0 1px var(--el-color-success) inset;
      }
    }
  }
}

// 上传组件样式增强
:deep(.el-upload) {
  .el-upload-dragger {
    border: 2px dashed var(--el-border-color);
    border-radius: $border-radius-base;
    background-color: var(--el-fill-color-blank);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
    
    .el-icon--upload {
      font-size: 48px;
      color: var(--el-text-color-placeholder);
      margin-bottom: 16px;
    }
    
    .el-upload__text {
      color: var(--el-text-color-regular);
      font-size: $font-size-base;
      
      em {
        color: var(--el-color-primary);
        font-style: normal;
      }
    }
  }
  
  .el-upload__tip {
    font-size: $font-size-small;
    color: var(--el-text-color-placeholder);
    margin-top: 8px;
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .v-form {
    &__group {
      &-title {
        color: var(--el-text-color-primary);
      }
      
      &-description {
        color: var(--el-text-color-regular);
      }
    }
    
    &__help-icon {
      &:hover {
        color: var(--el-color-primary-light-3);
      }
    }
  }
}
</style>