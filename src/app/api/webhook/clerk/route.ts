import { users } from '@/drizzle/schemas'
import { formatClerkUser, verifyClerkWebhook } from '@/lib/clerk'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()

    // 使用真实的Clerk webhook签名验证
    const event = verifyClerkWebhook(body, headersList)
    logger.info(`收到Clerk webhook: ${event.type}`)

    // 处理不同类型的事件
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data)
        break

      case 'user.updated':
        await handleUserUpdated(event.data)
        break

      case 'user.deleted':
        await handleUserDeleted(event.data)
        break

      case 'session.created':
        await handleSessionCreated(event.data)
        break

      case 'session.ended':
        await handleSessionEnded(event.data)
        break

      case 'email.created':
        await handleEmailCreated(event.data)
        break

      case 'organization.created':
        await handleOrganizationCreated(event.data)
        break

      case 'organizationMembership.created':
        await handleOrganizationMembershipCreated(event.data)
        break

      case 'organizationMembership.deleted':
        await handleOrganizationMembershipDeleted(event.data)
        break

      default:
        logger.info(`未处理的Clerk事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('处理Clerk webhook失败:', error as Error)
    return NextResponse.json({ error: 'Webhook处理失败' }, { status: 500 })
  }
}

// 处理用户创建
async function handleUserCreated(userData: any) {
  try {
    logger.info('开始处理用户创建事件', { userId: userData.id })
    const formattedUser = formatClerkUser(userData)

    // 检查用户是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, formattedUser.id),
    })

    if (existingUser) {
      logger.info(`用户已存在，跳过创建: ${formattedUser.id}`)
      return
    }

    // 创建新用户
    await db.insert(users).values({
      id: formattedUser.id,
      email: formattedUser.email,
      fullName: formattedUser.fullName,
      avatarUrl: formattedUser.avatarUrl,
      isActive: true,
      isAdmin: formattedUser.isAdmin,
      adminLevel: formattedUser.adminLevel,
      totalUseCases: 0,
      totalTutorials: 0,
      totalBlogs: 0,
      preferences: formattedUser.preferences,
      country: formattedUser.country,
      locale: formattedUser.locale,
      lastLoginAt: formattedUser.lastSignInAt,
      createdAt: formattedUser.createdAt,
      updatedAt: formattedUser.updatedAt,
    })

    logger.info(`用户创建成功: ${formattedUser.id} (${formattedUser.email})`)
  } catch (error) {
    logger.error('处理user.created失败:', error as Error)
    logger.error('用户数据: ' + JSON.stringify(userData))
    throw error
  }
}

// 处理用户更新
async function handleUserUpdated(userData: any) {
  try {
    const formattedUser = formatClerkUser(userData)

    // 更新用户信息
    const result = await db
      .update(users)
      .set({
        email: formattedUser.email,
        fullName: formattedUser.fullName,
        avatarUrl: formattedUser.avatarUrl,
        isActive: true, // 默认激活状态，可以根据业务需求调整
        isAdmin: formattedUser.isAdmin,
        adminLevel: formattedUser.adminLevel,
        country: formattedUser.country,
        locale: formattedUser.locale,
        updatedAt: new Date(),
      })
      .where(eq(users.id, formattedUser.id))
      .returning()

    if (result.length === 0) {
      // 如果用户不存在，创建新用户
      await handleUserCreated(userData)
    } else {
      logger.info(`用户更新成功: ${formattedUser.id} (${formattedUser.email})`)
    }
  } catch (error) {
    logger.error('处理user.updated失败:', error as Error)
    throw error
  }
}

// 处理用户删除
async function handleUserDeleted(userData: any) {
  try {
    const userId = userData.id

    // 软删除用户（设置为非活跃状态）
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    logger.info(`用户删除处理成功: ${userId}`)
  } catch (error) {
    logger.error('处理user.deleted失败:', error as Error)
    throw error
  }
}

// 处理会话创建（登录）
async function handleSessionCreated(sessionData: any) {
  try {
    const userId = sessionData.user_id

    // 更新最后登录时间
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    logger.info(`用户登录记录更新: ${userId}`)
  } catch (error) {
    logger.error('处理session.created失败:', error as Error)
    // 登录记录失败不应该影响登录流程，只记录错误
  }
}

// 处理会话结束（登出）
async function handleSessionEnded(sessionData: any) {
  try {
    const userId = sessionData.user_id

    // 这里可以添加登出相关的清理逻辑
    // 比如清除缓存、记录登出时间等

    logger.info(`用户登出记录: ${userId}`)
  } catch (error) {
    logger.error('处理session.ended失败:', error as Error)
    // 登出记录失败不应该影响登出流程，只记录错误
  }
}

// 处理邮箱创建
async function handleEmailCreated(emailData: any) {
  try {
    const userId = emailData.object?.user_id
    const emailAddress = emailData.email_address

    if (userId && emailAddress) {
      // 更新用户邮箱（如果是主邮箱）
      if (emailData.object?.primary) {
        await db
          .update(users)
          .set({
            email: emailAddress,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))

        logger.info(`用户主邮箱更新: ${userId} -> ${emailAddress}`)
      }
    }
  } catch (error) {
    logger.error('处理email.created失败:', error as Error)
    throw error
  }
}

// 处理组织创建
async function handleOrganizationCreated(orgData: any) {
  try {
    const organizationId = orgData.id
    const name = orgData.name
    const createdBy = orgData.created_by

    // TODO: 如果需要组织功能，在这里添加组织创建逻辑
    logger.info(`组织创建: ${organizationId} (${name}) by ${createdBy}`)
  } catch (error) {
    logger.error('处理organization.created失败:', error as Error)
    throw error
  }
}

// 处理组织成员创建
async function handleOrganizationMembershipCreated(membershipData: any) {
  try {
    const userId = membershipData.public_user_data?.user_id
    const organizationId = membershipData.organization?.id
    const role = membershipData.role

    // TODO: 如果需要组织功能，在这里添加成员管理逻辑
    logger.info(`组织成员添加: ${userId} -> ${organizationId} (${role})`)
  } catch (error) {
    logger.error('处理organizationMembership.created失败:', error as Error)
    throw error
  }
}

// 处理组织成员删除
async function handleOrganizationMembershipDeleted(membershipData: any) {
  try {
    const userId = membershipData.public_user_data?.user_id
    const organizationId = membershipData.organization?.id

    // TODO: 如果需要组织功能，在这里添加成员删除逻辑
    logger.info(`组织成员移除: ${userId} -> ${organizationId}`)
  } catch (error) {
    logger.error('处理organizationMembership.deleted失败:', error as Error)
    throw error
  }
}
