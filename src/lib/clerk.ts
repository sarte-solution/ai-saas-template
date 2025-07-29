import { env } from '@/env'
import { logger } from '@/lib/logger'
import { type WebhookEvent, createClerkClient } from '@clerk/nextjs/server'
import { Webhook } from 'svix'

// 创建Clerk客户端
const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
})

// Clerk webhook签名验证
export function verifyClerkWebhook(
  body: string,
  headers: Headers
): WebhookEvent {
  const webhookSecret = env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SECRET环境变量未配置')
  }

  // 获取Svix签名头
  const svixId = headers.get('svix-id')
  const svixTimestamp = headers.get('svix-timestamp')
  const svixSignature = headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error('缺少Svix签名头')
  }

  try {
    const webhook = new Webhook(webhookSecret)
    const event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent

    return event
  } catch (error) {
    logger.error('Clerk webhook签名验证失败:', error as Error)
    throw new Error('Invalid webhook signature')
  }
}

// 获取用户信息
export async function getClerkUser(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId)
    return user
  } catch (error) {
    logger.error(`获取Clerk用户失败: ${userId}`, error as Error)
    throw error
  }
}

// 更新用户元数据
export async function updateClerkUserMetadata(
  userId: string,
  metadata: Record<string, any>
) {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: metadata,
    })

    logger.info(`更新Clerk用户元数据成功: ${userId}`)
    return user
  } catch (error) {
    logger.error(`更新Clerk用户元数据失败: ${userId}`, error as Error)
    throw error
  }
}

// 删除用户
export async function deleteClerkUser(userId: string) {
  try {
    await clerkClient.users.deleteUser(userId)
    logger.info(`删除Clerk用户成功: ${userId}`)
  } catch (error) {
    logger.error(`删除Clerk用户失败: ${userId}`, error as Error)
    throw error
  }
}

// 设置用户角色
export async function setClerkUserRole(userId: string, role: string) {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    })

    logger.info(`设置Clerk用户角色成功: ${userId} -> ${role}`)
    return user
  } catch (error) {
    logger.error(`设置Clerk用户角色失败: ${userId}`, error as Error)
    throw error
  }
}

// 批量获取用户
export async function getClerkUsers(params?: {
  limit?: number
  offset?: number
  emailAddress?: string[]
  userId?: string[]
}) {
  try {
    const users = await clerkClient.users.getUserList({
      limit: params?.limit,
      offset: params?.offset,
      emailAddress: params?.emailAddress,
      userId: params?.userId,
    })

    return users
  } catch (error) {
    logger.error('批量获取Clerk用户失败:', error as Error)
    throw error
  }
}

// 邀请用户
export async function inviteClerkUser(params: {
  emailAddress: string
  redirectUrl?: string
  publicMetadata?: Record<string, any>
}) {
  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: params.emailAddress,
      redirectUrl: params.redirectUrl,
      publicMetadata: params.publicMetadata,
    })

    logger.info(`邀请Clerk用户成功: ${params.emailAddress}`)
    return invitation
  } catch (error) {
    logger.error(`邀请Clerk用户失败: ${params.emailAddress}`, error as Error)
    throw error
  }
}

// 获取用户会话
export async function getClerkUserSessions(userId: string) {
  try {
    const sessions = await clerkClient.sessions.getSessionList({
      userId,
    })

    return sessions
  } catch (error) {
    logger.error(`获取Clerk用户会话失败: ${userId}`, error as Error)
    throw error
  }
}

// 撤销用户会话
export async function revokeClerkSession(sessionId: string) {
  try {
    await clerkClient.sessions.revokeSession(sessionId)
    logger.info(`撤销Clerk会话成功: ${sessionId}`)
  } catch (error) {
    logger.error(`撤销Clerk会话失败: ${sessionId}`, error as Error)
    throw error
  }
}

// 创建组织
export async function createClerkOrganization(params: {
  name: string
  slug?: string
  createdBy: string
  publicMetadata?: Record<string, any>
}) {
  try {
    const organization = await clerkClient.organizations.createOrganization({
      name: params.name,
      slug: params.slug,
      createdBy: params.createdBy,
      publicMetadata: params.publicMetadata,
    })

    logger.info(`创建Clerk组织成功: ${organization.id}`)
    return organization
  } catch (error) {
    logger.error('创建Clerk组织失败:', error as Error)
    throw error
  }
}

// 获取组织成员
export async function getClerkOrganizationMembers(organizationId: string) {
  try {
    const members =
      await clerkClient.organizations.getOrganizationMembershipList({
        organizationId,
      })

    return members
  } catch (error) {
    logger.error(`获取Clerk组织成员失败: ${organizationId}`, error as Error)
    throw error
  }
}

// 添加组织成员
export async function addClerkOrganizationMember(params: {
  organizationId: string
  userId: string
  role: string
}) {
  try {
    const membership =
      await clerkClient.organizations.createOrganizationMembership({
        organizationId: params.organizationId,
        userId: params.userId,
        role: params.role,
      })

    logger.info(
      `添加Clerk组织成员成功: ${params.organizationId} + ${params.userId}`
    )
    return membership
  } catch (error) {
    logger.error('添加Clerk组织成员失败:', error as Error)
    throw error
  }
}

// 移除组织成员
export async function removeClerkOrganizationMember(params: {
  organizationId: string
  userId: string
}) {
  try {
    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId: params.organizationId,
      userId: params.userId,
    })

    logger.info(
      `移除Clerk组织成员成功: ${params.organizationId} - ${params.userId}`
    )
  } catch (error) {
    logger.error('移除Clerk组织成员失败:', error as Error)
    throw error
  }
}

// 格式化Clerk用户数据
export function formatClerkUser(clerkUser: any) {
  try {
    // 安全的日期处理函数
    const parseDate = (timestamp: any): Date => {
      if (!timestamp) return new Date()

      if (typeof timestamp === 'number') {
        // 如果是时间戳，确保是毫秒级
        const date = new Date(timestamp)
        return isNaN(date.getTime()) ? new Date() : date
      }

      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        return isNaN(date.getTime()) ? new Date() : date
      }

      if (timestamp instanceof Date) {
        return isNaN(timestamp.getTime()) ? new Date() : timestamp
      }

      return new Date()
    }

    // 提取用户基本信息
    const primaryEmail = clerkUser.email_addresses?.find(
      (email: any) => email.id === clerkUser.primary_email_address_id
    )
    const email =
      primaryEmail?.email_address ||
      clerkUser.email_addresses?.[0]?.email_address ||
      ''

    const formattedUser = {
      id: clerkUser.id,
      email: email,
      fullName:
        `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() ||
        null,
      avatarUrl: clerkUser.image_url || clerkUser.profile_image_url || null,
      isActive: true,
      isAdmin: clerkUser.public_metadata?.isAdmin || false,
      adminLevel: clerkUser.public_metadata?.adminLevel || 0,
      preferences: clerkUser.public_metadata?.preferences || {
        theme: 'light',
        language: 'zh',
        currency: 'CNY',
        timezone: 'Asia/Shanghai',
      },
      country: clerkUser.public_metadata?.country || null,
      locale: clerkUser.public_metadata?.locale || 'zh',
      publicMetadata: clerkUser.public_metadata || {},
      privateMetadata: clerkUser.private_metadata || {},
      createdAt: parseDate(clerkUser.created_at),
      updatedAt: parseDate(clerkUser.updated_at),
      lastSignInAt: parseDate(clerkUser.last_sign_in_at),
      lastActiveAt: parseDate(clerkUser.last_active_at),
    }

    // 验证必需字段
    if (!formattedUser.id) {
      throw new Error('Clerk用户ID不能为空')
    }

    if (!formattedUser.email) {
      throw new Error('Clerk用户邮箱不能为空')
    }

    return formattedUser
  } catch (error) {
    logger.error('格式化Clerk用户数据失败:', error as Error)
    logger.error('原始Clerk用户数据: ' + JSON.stringify(clerkUser))
    throw error
  }
}

// 验证管理员权限
export function isClerkAdmin(user: any): boolean {
  return (
    user?.publicMetadata?.role === 'admin' ||
    user?.publicMetadata?.isAdmin === true ||
    user?.publicMetadata?.adminLevel > 0
  )
}

// 获取用户角色
export function getClerkUserRole(user: any): string {
  return user?.publicMetadata?.role || 'user'
}

// 获取用户权限
export function getClerkUserPermissions(user: any): string[] {
  return user?.publicMetadata?.permissions || []
}
