import { env } from '@/env'
import { logger } from '@/lib/logger'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// 邮件服务类型
type EmailProvider = 'resend' | 'smtp'

// 邮件配置
interface EmailConfig {
  provider: EmailProvider
  from: string
}

// 邮件内容接口
interface EmailContent {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// 邮件模板类型
interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// 初始化邮件服务
class EmailService {
  private resend?: Resend
  private nodemailer?: nodemailer.Transporter
  private config: EmailConfig

  constructor() {
    // 根据环境变量选择邮件提供商
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY)
      this.config = {
        provider: 'resend',
        from: 'AI SaaS <noreply@yourdomain.com>', // 替换为你的域名
      }
    } else if (env.SMTP_HOST && env.SMTP_USERNAME && env.SMTP_PASSWORD) {
      this.nodemailer = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number.parseInt(env.SMTP_PORT || '587'),
        secure: Number.parseInt(env.SMTP_PORT || '587') === 465,
        auth: {
          user: env.SMTP_USERNAME,
          pass: env.SMTP_PASSWORD,
        },
      })
      this.config = {
        provider: 'smtp',
        from: `AI SaaS <${env.SMTP_USERNAME}>`,
      }
    } else {
      throw new Error('未配置邮件服务，请设置 RESEND_API_KEY 或 SMTP 配置')
    }
  }

  // 发送邮件
  async sendEmail(content: EmailContent): Promise<boolean> {
    try {
      if (this.config.provider === 'resend' && this.resend) {
        await this.sendWithResend(content)
      } else if (this.config.provider === 'smtp' && this.nodemailer) {
        await this.sendWithSMTP(content)
      } else {
        throw new Error('邮件服务未正确初始化')
      }

      logger.info(`邮件发送成功: ${content.subject} -> ${content.to}`)
      return true
    } catch (error) {
      logger.error('邮件发送失败:', error as Error)
      throw error
    }
  }

  // 使用 Resend 发送
  private async sendWithResend(content: EmailContent) {
    if (!this.resend) throw new Error('Resend 未初始化')

    const result = await this.resend.emails.send({
      from: this.config.from,
      to: Array.isArray(content.to) ? content.to : [content.to],
      subject: content.subject,
      html: content.html,
      text: content.text || '',
      cc: content.cc,
      bcc: content.bcc,
      replyTo: content.replyTo,
      attachments: content.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
    })

    if (result.error) {
      throw new Error(`Resend 错误: ${result.error.message}`)
    }
  }

  // 使用 SMTP 发送
  private async sendWithSMTP(content: EmailContent) {
    if (!this.nodemailer) throw new Error('SMTP 未初始化')

    await this.nodemailer.sendMail({
      from: this.config.from,
      to: content.to,
      subject: content.subject,
      html: content.html,
      text: content.text,
      cc: content.cc,
      bcc: content.bcc,
      replyTo: content.replyTo,
      attachments: content.attachments,
    })
  }

  // 使用模板发送邮件
  async sendWithTemplate(
    to: string | string[],
    templateName: string,
    variables: Record<string, any>
  ): Promise<boolean> {
    const template = await this.getTemplate(templateName, variables)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  // 获取邮件模板
  private async getTemplate(
    templateName: string,
    variables: Record<string, any>
  ): Promise<EmailTemplate> {
    // 这里可以从数据库或文件系统加载模板
    // 目前使用内置模板
    const templates = getBuiltinTemplates()
    const template = templates[templateName]

    if (!template) {
      throw new Error(`模板不存在: ${templateName}`)
    }

    // 替换模板变量
    const subject = this.replaceVariables(template.subject, variables)
    const html = this.replaceVariables(template.html, variables)
    const text = template.text
      ? this.replaceVariables(template.text, variables)
      : undefined

    return { subject, html, text }
  }

  // 替换模板变量
  private replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })
  }
}

// 创建邮件服务实例
export const emailService = new EmailService()

// 便捷发送方法
export const sendEmail = (content: EmailContent) =>
  emailService.sendEmail(content)
export const sendEmailWithTemplate = (
  to: string | string[],
  templateName: string,
  variables: Record<string, any>
) => emailService.sendWithTemplate(to, templateName, variables)

// 内置邮件模板
function getBuiltinTemplates(): Record<string, EmailTemplate> {
  return {
    // 欢迎邮件
    welcome: {
      subject: '欢迎加入 AI SaaS！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">欢迎，{{userName}}！</h1>
          <p>感谢您注册 AI SaaS 平台。我们很高兴您加入我们的社区。</p>
          <p>您现在可以：</p>
          <ul>
            <li>探索我们的 AI 功能</li>
            <li>查看教程和案例</li>
            <li>升级到付费计划获得更多功能</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              开始使用
            </a>
          </div>
          <p>如有任何问题，请随时联系我们的支持团队。</p>
          <p>祝好，<br>AI SaaS 团队</p>
        </div>
      `,
      text: `欢迎，{{userName}}！感谢您注册 AI SaaS 平台。访问 {{dashboardUrl}} 开始使用。`,
    },

    // 密码重置
    passwordReset: {
      subject: '重置您的密码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">重置密码</h1>
          <p>您好，{{userName}}！</p>
          <p>我们收到了重置您账户密码的请求。请点击下面的链接重置密码：</p>
          <div style="margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              重置密码
            </a>
          </div>
          <p>此链接将在 24 小时后过期。</p>
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
          <p>祝好，<br>AI SaaS 团队</p>
        </div>
      `,
      text: `重置密码：{{resetUrl}} （24小时内有效）`,
    },

    // 支付成功
    paymentSuccess: {
      subject: '支付成功确认',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745;">支付成功！</h1>
          <p>您好，{{userName}}！</p>
          <p>我们已收到您的支付，感谢您升级到 {{planName}} 计划。</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3>订单详情</h3>
            <p><strong>计划：</strong>{{planName}}</p>
            <p><strong>金额：</strong>{{amount}} {{currency}}</p>
            <p><strong>期限：</strong>{{duration}}</p>
            <p><strong>到期时间：</strong>{{expiryDate}}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              查看仪表板
            </a>
          </div>
          <p>祝好，<br>AI SaaS 团队</p>
        </div>
      `,
      text: `支付成功！您已升级到 {{planName}} 计划。访问 {{dashboardUrl}} 查看详情。`,
    },

    // 支付失败
    paymentFailed: {
      subject: '支付失败通知',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc3545;">支付失败</h1>
          <p>您好，{{userName}}！</p>
          <p>很抱歉，您的支付未能成功处理。请检查您的支付信息并重试。</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3>失败详情</h3>
            <p><strong>计划：</strong>{{planName}}</p>
            <p><strong>金额：</strong>{{amount}} {{currency}}</p>
            <p><strong>原因：</strong>{{failureReason}}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="{{retryUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              重新支付
            </a>
          </div>
          <p>如需帮助，请联系我们的支持团队。</p>
          <p>祝好，<br>AI SaaS 团队</p>
        </div>
      `,
      text: `支付失败：{{planName}} {{amount}} {{currency}}。访问 {{retryUrl}} 重新支付。`,
    },

    // 试用期即将结束
    trialEnding: {
      subject: '试用期即将结束',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ffc107;">试用期即将结束</h1>
          <p>您好，{{userName}}！</p>
          <p>您的试用期将在 {{daysLeft}} 天后结束。为了继续享受我们的服务，请选择适合的付费计划。</p>
          <div style="margin: 30px 0;">
            <a href="{{pricingUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              查看付费计划
            </a>
          </div>
          <p>升级后您将获得：</p>
          <ul>
            <li>无限制的 AI 功能使用</li>
            <li>优先客户支持</li>
            <li>高级功能访问</li>
          </ul>
          <p>祝好，<br>AI SaaS 团队</p>
        </div>
      `,
      text: `试用期将在 {{daysLeft}} 天后结束。访问 {{pricingUrl}} 选择付费计划。`,
    },

    // 订阅即将到期
    subscriptionExpiring: {
      subject: '订阅即将到期',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ffc107;">订阅即将到期</h1>
          <p>您好，{{userName}}！</p>
          <p>您的 {{planName}} 订阅将在 {{expiryDate}} 到期。</p>
          <p>为了确保服务不中断，请及时续费。</p>
          <div style="margin: 30px 0;">
            <a href="{{renewUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              立即续费
            </a>
          </div>
          <p>如有任何问题，请联系我们的支持团队。</p>
          <p>祝好，<br>AI SaaS 团队</p>
        </div>
      `,
      text: `您的 {{planName}} 订阅将在 {{expiryDate}} 到期。访问 {{renewUrl}} 续费。`,
    },
  }
}

// 发送特定类型的邮件
export const sendWelcomeEmail = (
  to: string,
  userName: string,
  dashboardUrl: string
) => sendEmailWithTemplate(to, 'welcome', { userName, dashboardUrl })

export const sendPasswordResetEmail = (
  to: string,
  userName: string,
  resetUrl: string
) => sendEmailWithTemplate(to, 'passwordReset', { userName, resetUrl })

export const sendPaymentSuccessEmail = (
  to: string,
  userName: string,
  planName: string,
  amount: string,
  currency: string,
  duration: string,
  expiryDate: string,
  dashboardUrl: string
) =>
  sendEmailWithTemplate(to, 'paymentSuccess', {
    userName,
    planName,
    amount,
    currency,
    duration,
    expiryDate,
    dashboardUrl,
  })

export const sendPaymentFailedEmail = (
  to: string,
  userName: string,
  planName: string,
  amount: string,
  currency: string,
  failureReason: string,
  retryUrl: string
) =>
  sendEmailWithTemplate(to, 'paymentFailed', {
    userName,
    planName,
    amount,
    currency,
    failureReason,
    retryUrl,
  })

export const sendTrialEndingEmail = (
  to: string,
  userName: string,
  daysLeft: number,
  pricingUrl: string
) =>
  sendEmailWithTemplate(to, 'trialEnding', { userName, daysLeft, pricingUrl })

export const sendSubscriptionExpiringEmail = (
  to: string,
  userName: string,
  planName: string,
  expiryDate: string,
  renewUrl: string
) =>
  sendEmailWithTemplate(to, 'subscriptionExpiring', {
    userName,
    planName,
    expiryDate,
    renewUrl,
  })

// 验证邮件服务配置
export const isEmailConfigured = (): boolean => {
  return !!(
    env.RESEND_API_KEY ||
    (env.SMTP_HOST && env.SMTP_USERNAME && env.SMTP_PASSWORD)
  )
}

// 测试邮件发送
export const testEmailService = async (to: string): Promise<boolean> => {
  try {
    return await sendEmail({
      to,
      subject: 'AI SaaS 邮件服务测试',
      html: '<p>这是一封测试邮件，确认邮件服务工作正常。</p>',
      text: '这是一封测试邮件，确认邮件服务工作正常。',
    })
  } catch (error) {
    logger.error('邮件服务测试失败:', error as Error)
    return false
  }
}
