'use client'

import { trpc } from '@/lib/trpc/client'

/**
 * 会员状态hook，带性能优化
 * 替代原有的useUserMembership hook
 */
export function useUserMembership(userId?: string) {
  const { data: membershipStatus, isLoading } =
    trpc.payments.getUserMembershipStatus.useQuery(
      userId ? { userId } : undefined,
      {
        // 性能优化配置
        enabled: !!userId, // 只有用户ID存在时才查询
        staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜，避免频繁查询
        gcTime: 10 * 60 * 1000, // 10分钟垃圾回收时间
        refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
        refetchOnMount: false, // 组件挂载时不自动刷新（如果有缓存）
        retry: 1, // 失败只重试1次
      }
    )

  return {
    hasActiveMembership: Boolean(membershipStatus?.hasActiveMembership),
    currentPlan: membershipStatus?.currentPlan || null,
    membershipStatus,
    isLoading,
    remainingDays: membershipStatus?.remainingDays || 0,
    nextExpiryDate: membershipStatus?.nextExpiryDate,
    usage: membershipStatus?.usage,
  }
}
