import { users } from '@/drizzle/schemas'
import { updateClerkUserMetadata } from '@/lib/clerk'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'

async function syncAdminStatus() {
  console.log('开始同步管理员状态到Clerk...')

  try {
    // 获取所有管理员用户
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))

    console.log(`找到 ${adminUsers.length} 个管理员用户`)

    for (const user of adminUsers) {
      try {
        console.log(`正在同步用户: ${user.email} (${user.id})`)

        // 更新Clerk中的publicMetadata
        await updateClerkUserMetadata(user.id, {
          isAdmin: true,
          adminLevel: user.adminLevel || 1,
          role: 'admin',
        })

        console.log(`✅ ${user.email} 同步成功`)
      } catch (error) {
        console.error(`❌ ${user.email} 同步失败:`, error)
      }
    }

    console.log('同步完成！')
  } catch (error) {
    console.error('同步过程出错:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  syncAdminStatus()
    .then(() => {
      process.exit(0)
    })
    .catch(error => {
      console.error('脚本执行失败:', error)
      process.exit(1)
    })
}

export { syncAdminStatus }
