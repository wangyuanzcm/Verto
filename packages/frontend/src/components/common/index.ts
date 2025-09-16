/**
 * 通用组件统一导出
 */

// 导入所有组件
import Button from './Button.vue'
import Icon from './Icon.vue'
import Input from './Input.vue'
import Modal from './Modal.vue'
import Table from './Table.vue'
import Pagination from './Pagination.vue'

// 导出所有组件
export {
  Button,
  Icon,
  Input,
  Modal,
  Table,
  Pagination
}

// 默认导出
export default {
  Button,
  Icon,
  Input,
  Modal,
  Table,
  Pagination
}

// 组件类型定义
export type {
  ButtonProps,
  IconProps,
  InputProps,
  ModalProps,
  TableProps,
  PaginationProps
} from './types'