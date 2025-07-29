// ===============================
// 导入所有表定义
// ===============================
import { conversations, messages, promptTemplates } from './conversations'
import {
  type UserMembership,
  type UserUsageLimit,
  coupons,
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
} from './payments'
import { apiKeys, notifications, systemConfigs } from './system'
import { users } from './users'

// ===============================
// 用户模块导出
// ===============================
export {
  AdminLevel,
  Currency,
  Language,
  Theme,
  users,
  type NewUser,
  type User,
} from './users'

// ===============================
// 支付模块导出
// ===============================
export {
  DiscountType,
  DurationType,
  MembershipStatus,
  PaymentSource,
  PaymentStatus,
  coupons,
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
  type Coupon,
  type MembershipPlan,
  type NewCoupon,
  type NewMembershipPlan,
  type NewPaymentRecord,
  type NewUserMembership,
  type NewUserUsageLimit,
  type PaymentRecord,
  type UserMembership,
  type UserUsageLimit,
} from './payments'

// ===============================
// AI对话模块导出
// ===============================
export {
  ConversationType,
  MessageRole,
  PromptCategory,
  VariableType,
  conversations,
  messages,
  promptTemplates,
  type Conversation,
  type Message,
  type NewConversation,
  type NewMessage,
  type NewPromptTemplate,
  type PromptTemplate,
} from './conversations'

// ===============================
// 系统模块导出
// ===============================
export {
  ApiScope,
  ConfigCategory,
  ConfigDataType,
  NotificationPriority,
  NotificationType,
  apiKeys,
  notifications,
  systemConfigs,
  type ApiKey,
  type NewApiKey,
  type NewNotification,
  type NewSystemConfig,
  type Notification,
  type SystemConfig,
} from './system'

// ===============================
// 所有表的联合导出 (用于Drizzle Kit)
// ===============================
export const schema = {
  // 用户模块
  users,

  // 支付模块
  membershipPlans,
  userMemberships,
  paymentRecords,
  userUsageLimits,
  coupons,

  // AI对话模块
  conversations,
  messages,
  promptTemplates,

  // 系统模块
  apiKeys,
  notifications,
  systemConfigs,
}

// ===============================
// 全局类型定义
// ===============================

// 通用查询结果类型
export type PaginationResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API响应类型
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 数据库事务类型
export type DatabaseTransaction = Parameters<
  Parameters<typeof import('@/lib/db').db.transaction>[0]
>[0]

// 查询过滤器类型
export type QueryFilters = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: Date
  endDate?: Date
}

// 用户权限检查结果
export type PermissionCheck = {
  hasPermission: boolean
  reason?: string
  membership?: UserMembership
  limits?: UserUsageLimit
}
