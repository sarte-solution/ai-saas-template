import { users } from '@/drizzle/schemas'
import { TRPCError } from '@trpc/server'
import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm'
import { z } from 'zod'
import { adminProcedure, createTRPCRouter } from '../server'

export const usersRouter = createTRPCRouter({
  /**
   * 获取用户列表（分页、搜索、排序）
   */
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortBy: z
          .enum(['createdAt', 'email', 'fullName', 'lastLoginAt'])
          .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        isActive: z.boolean().optional(),
        isAdmin: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder, isActive, isAdmin } =
        input

      // 构建查询条件
      const conditions = []

      if (search) {
        conditions.push(
          ilike(users.email, `%${search}%`),
          ilike(users.fullName, `%${search}%`)
        )
      }

      if (isActive !== undefined) {
        conditions.push(eq(users.isActive, isActive))
      }

      if (isAdmin !== undefined) {
        conditions.push(eq(users.isAdmin, isAdmin))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // 获取总数
      const totalResult = await ctx.db
        .select({ total: count() })
        .from(users)
        .where(whereClause)

      const total = totalResult[0]?.total || 0

      // 获取用户列表
      const orderColumn = users[sortBy]
      const orderDirection =
        sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn)

      const userList = await ctx.db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(orderDirection)
        .limit(limit)
        .offset((page - 1) * limit)

      return {
        users: userList,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  /**
   * 根据ID获取用户详情
   */
  getUserById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      return user
    }),

  /**
   * 获取用户统计数据
   */
  getUserStats: adminProcedure.query(async ({ ctx }) => {
    const [stats] = await ctx.db
      .select({
        totalUsers: sql<number>`count(*)`,
        activeUsers: sql<number>`count(*) filter (where is_active = true)`,
        adminUsers: sql<number>`count(*) filter (where is_admin = true)`,
        newUsersThisMonth: sql<number>`count(*) filter (where created_at >= date_trunc('month', current_date))`,
      })
      .from(users)

    return stats
  }),

  /**
   * 更新用户信息
   */
  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        fullName: z.string().optional(),
        isAdmin: z.boolean().optional(),
        isActive: z.boolean().optional(),
        adminLevel: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning()

      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      ctx.logger.info(`管理员更新用户: ${updatedUser.email}`, {
        adminId: ctx.userId,
        targetUserId: id,
        changes: updateData,
      })

      return updatedUser
    }),

  /**
   * 切换用户状态
   */
  toggleUserStatus: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          isActive: !user.isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id))
        .returning()

      ctx.logger.info(
        `管理员切换用户状态: ${updatedUser?.email} -> ${updatedUser?.isActive ? '激活' : '禁用'}`,
        {
          adminId: ctx.userId,
          targetUserId: input.id,
        }
      )

      return updatedUser
    }),

  /**
   * 删除用户
   */
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      // 检查是否为超级管理员，防止误删
      if (user.adminLevel === 2) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '无法删除超级管理员账户',
        })
      }

      await ctx.db.delete(users).where(eq(users.id, input.id))

      ctx.logger.info(`管理员删除用户: ${user.email}`, {
        adminId: ctx.userId,
        targetUserId: input.id,
      })

      return { message: '用户删除成功' }
    }),

  /**
   * 批量更新用户
   */
  bulkUpdateUsers: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        isActive: z.boolean().optional(),
        isAdmin: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userIds, ...updateData } = input

      await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(sql`id = ANY(${userIds})`)

      ctx.logger.info(`管理员批量更新用户: ${userIds.length} 个用户`, {
        adminId: ctx.userId,
        userIds,
        changes: updateData,
      })

      return { message: `成功更新 ${userIds.length} 个用户` }
    }),

  /**
   * 创建新用户
   */
  createUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        fullName: z.string().min(1),
        isAdmin: z.boolean().default(false),
        adminLevel: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查邮箱是否已存在
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '该邮箱已存在',
        })
      }

      // 生成临时用户ID (在实际应用中可能需要与Clerk集成)
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          id: tempUserId,
          email: input.email,
          fullName: input.fullName,
          isAdmin: input.isAdmin,
          adminLevel: input.adminLevel,
          isActive: input.isActive,
          avatarUrl: null,
          totalUseCases: 0,
          totalTutorials: 0,
          totalBlogs: 0,
          preferences: {
            theme: 'light',
            language: 'zh',
            currency: 'CNY',
            timezone: 'Asia/Shanghai',
          },
          country: null,
          locale: 'zh',
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      if (!newUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建用户失败',
        })
      }

      ctx.logger.info(`管理员创建用户: ${newUser.email}`, {
        adminId: ctx.userId,
        newUserId: newUser.id,
        userEmail: input.email,
      })

      return newUser
    }),
})
