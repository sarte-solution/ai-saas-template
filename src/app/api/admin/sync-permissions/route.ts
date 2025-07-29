import { users } from '@/drizzle/schemas'
import { updateClerkUserMetadata } from '@/lib/clerk'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 检查是否有认证
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 检查当前用户是否是管理员
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 获取所有管理员用户
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))

    let successCount = 0
    let failedCount = 0
    const results = []

    for (const user of adminUsers) {
      try {
        await updateClerkUserMetadata(user.id, {
          isAdmin: true,
          adminLevel: user.adminLevel || 1,
          role: 'admin',
        })

        successCount++
        results.push({
          userId: user.id,
          email: user.email,
          status: 'success',
        })
      } catch (error) {
        failedCount++
        results.push({
          userId: user.id,
          email: user.email,
          status: 'failed',
          error: error instanceof Error ? error.message : '未知错误',
        })
      }
    }

    return NextResponse.json({
      message: '管理员权限同步完成',
      total: adminUsers.length,
      successCount,
      failedCount,
      results,
    })
  } catch (error) {
    console.error('同步管理员权限失败:', error)
    return NextResponse.json(
      {
        error: '同步失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
