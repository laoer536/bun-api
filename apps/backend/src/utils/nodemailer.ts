import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'

export function sendEmail(title: string, content: string, toMail: string) {
  const transporter = nodemailer.createTransport({
    //node_modules/nodemailer/lib/well-known/services.json  Check the relevant configurations, and if you use QQ mailbox, check the relevant configurations of QQ mailbox
    service: '163', //类型qq邮箱
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_AUTH_EMAIL!, // The email address of the PNP sender
      pass: process.env.NODEMAILER_AUTH_PASS!, // SMTP's authorization code
    },
  })
  const mailOptions: Mail.Options = {
    from: { name: 'bun-api', address: process.env.NODEMAILER_AUTH_EMAIL! }, // sender
    to: toMail, //Recipient mailboxes, multiple mailboxes are spaced with commas
    subject: title, // title
    html: `<div>${content}</div>`, //Email content
  }
  return transporter.sendMail(mailOptions)
}
