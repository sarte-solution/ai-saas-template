import { MembershipCenter } from '@/components/payment/MembershipCenter'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function MembershipPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in?redirect=/membership')
  }

  return (
    <div className="min-h-screen bg-background">
      <MembershipCenter />
    </div>
  )
}

export const metadata = {
  title: '会员中心 - AI SaaS Template',
  description: '管理您的会员权益、查看使用统计和账单信息',
}
