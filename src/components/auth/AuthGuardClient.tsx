'use client'

import { AUTH_ROUTES } from '@/constants/auth'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuthGuardClientProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdminAccess?: boolean
  redirectTo?: string
}

export function AuthGuardClient({
  children,
  requireAuth = false,
  requireAdminAccess = false,
  redirectTo = AUTH_ROUTES.SIGN_IN,
}: AuthGuardClientProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    const needsAuth = requireAuth || requireAdminAccess

    // 检查认证要求
    if (needsAuth) {
      if (!isSignedIn) {
        router.push(redirectTo)
        return
      }

      // 检查管理员权限
      if (requireAdminAccess) {
        const isAdmin = user?.publicMetadata?.isAdmin
        if (!isAdmin) {
          router.push('/')
          return
        }
      }
    }

    setIsInitialized(true)
  }, [
    isLoaded,
    isSignedIn,
    user,
    requireAuth,
    requireAdminAccess,
    redirectTo,
    router,
  ])

  // 显示加载状态直到认证检查完成
  const isLoading = !(isLoaded && isInitialized)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const needsAuth = requireAuth || requireAdminAccess

  // 如果需要认证但未登录，不渲染内容（即将重定向）
  if (needsAuth && !isSignedIn) {
    return null
  }

  // 如果需要管理员权限但不是管理员，不渲染内容（即将重定向）
  const isAdmin = user?.publicMetadata?.isAdmin
  if (requireAdminAccess && !isAdmin) {
    return null
  }

  return <>{children}</>
}

// 专门的管理员守卫组件
export function AdminGuardClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardClient requireAuth requireAdminAccess>
      {children}
    </AuthGuardClient>
  )
}
