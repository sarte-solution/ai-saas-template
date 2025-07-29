import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { auth } from '@clerk/nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

/**
 * tRPC上下文创建函数
 * 包含认证用户信息和数据库连接
 */
export async function createTRPCContext() {
  const { userId } = await auth()

  return {
    db,
    userId,
    logger,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * 初始化tRPC实例
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 导出tRPC路由器和过程创建器
 */
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

/**
 * 认证中间件
 * 确保用户已登录
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  })
})

/**
 * 管理员中间件
 * 确保用户是管理员
 */
const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // 检查用户是否是管理员
  const user = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, ctx.userId!),
  })

  if (!user?.isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN', message: '需要管理员权限' })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user,
    },
  })
})

/**
 * 保护的过程（需要认证）
 */
export const protectedProcedure = publicProcedure.use(enforceUserIsAuthed)

/**
 * 管理员过程（需要管理员权限）
 */
export const adminProcedure = publicProcedure.use(enforceUserIsAdmin)
