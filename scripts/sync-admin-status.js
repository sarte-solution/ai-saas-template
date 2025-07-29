const { Pool } = require('pg')
const { createClerkClient } = require('@clerk/backend')

// 从环境变量获取配置
require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

if (!(DATABASE_URL && CLERK_SECRET_KEY)) {
  console.error('❌ 缺少必要的环境变量: DATABASE_URL 或 CLERK_SECRET_KEY')
  process.exit(1)
}

// 初始化数据库连接
const pool = new Pool({
  connectionString: DATABASE_URL,
})

// 初始化 Clerk 客户端
const clerkClient = createClerkClient({
  secretKey: CLERK_SECRET_KEY,
})

async function syncAdminStatus() {
  console.log('🚀 开始同步管理员状态到Clerk...')

  try {
    // 查询所有管理员用户
    const result = await pool.query('SELECT * FROM users WHERE is_admin = true')
    const adminUsers = result.rows

    console.log(`📋 找到 ${adminUsers.length} 个管理员用户`)

    if (adminUsers.length === 0) {
      console.log('⚠️  没有找到管理员用户，请先在数据库中设置 is_admin = true')
      return
    }

    for (const user of adminUsers) {
      try {
        console.log(`🔄 正在同步用户: ${user.email} (${user.id})`)

        // 更新Clerk中的publicMetadata
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: {
            isAdmin: true,
            adminLevel: user.admin_level || 1,
            role: 'admin',
          },
        })

        console.log(`✅ ${user.email} 同步成功`)
      } catch (error) {
        console.error(`❌ ${user.email} 同步失败:`, error.message)
      }
    }

    console.log('🎉 同步完成！现在导航菜单中应该可以看到管理员入口了。')
  } catch (error) {
    console.error('💥 同步过程出错:', error.message)
  } finally {
    await pool.end()
  }
}

// 执行同步
syncAdminStatus()
  .then(() => {
    console.log('✨ 脚本执行完毕')
    process.exit(0)
  })
  .catch(error => {
    console.error('🚨 脚本执行失败:', error.message)
    process.exit(1)
  })
