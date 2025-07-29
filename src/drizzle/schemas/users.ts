import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

// ===============================
// 用户表 (Clerk 集成 + 管理员权限)
// ===============================

export const users = pgTable(
  'users',
  {
    // Clerk 同步字段
    id: varchar('id', { length: 255 }).primaryKey(), // Clerk User ID
    email: varchar('email', { length: 255 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }),
    avatarUrl: text('avatar_url'),

    // 管理员权限
    isAdmin: boolean('is_admin').default(false), // 管理员标识
    adminLevel: integer('admin_level').default(0), // 管理员等级 (0=普通用户, 1=管理员, 2=超级管理员)

    // 业务字段
    totalUseCases: integer('total_use_cases').default(0), // 总使用案例数
    totalTutorials: integer('total_tutorials').default(0), // 总教程数
    totalBlogs: integer('total_blogs').default(0), // 总博客数

    // 状态
    isActive: boolean('is_active').default(true),
    lastLoginAt: timestamp('last_login_at'),

    // 偏好设置
    preferences: jsonb('preferences')
      .$type<{
        theme: 'light' | 'dark'
        language: 'en' | 'zh'
        currency: 'USD' | 'CNY'
        timezone: string
      }>()
      .default({
        theme: 'light',
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
      }),

    // 地理信息
    country: varchar('country', { length: 10 }), // 国家代码
    locale: varchar('locale', { length: 10 }).default('en'), // 语言环境

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    emailIdx: index('users_email_idx').on(table.email),
    isActiveIdx: index('users_is_active_idx').on(table.isActive),
    isAdminIdx: index('users_is_admin_idx').on(table.isAdmin),
    countryIdx: index('users_country_idx').on(table.country),
  })
)

// ===============================
// 类型导出
// ===============================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// ===============================
// 枚举定义
// ===============================

export enum AdminLevel {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Language {
  EN = 'en',
  ZH = 'zh',
}

export enum Currency {
  USD = 'USD',
  CNY = 'CNY',
}
