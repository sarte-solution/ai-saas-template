'use client'

import {
  AuthGuardClient,
  ProfileForm,
  UserProfileClient,
} from '@/components/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield } from 'lucide-react'
import { Suspense } from 'react'

function SettingsContent() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">账户设置</h1>
        <p className="text-muted-foreground mt-2">管理您的账户信息和偏好设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<SettingsComponentSkeleton />}>
          <UserProfileClient />
        </Suspense>

        <Suspense fallback={<SettingsComponentSkeleton />}>
          <ProfileForm />
        </Suspense>
      </div>

      {/* 账户安全 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            账户安全
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">登录方式</h3>
                <p className="text-sm text-muted-foreground">
                  通过 Clerk 认证服务管理
                </p>
              </div>
              <div className="text-sm text-green-600">已启用</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">两步验证</h3>
                <p className="text-sm text-muted-foreground">
                  为您的账户提供额外保护
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                可在 Clerk 中配置
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsComponentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuardClient requireAuth>
      <SettingsContent />
    </AuthGuardClient>
  )
}
