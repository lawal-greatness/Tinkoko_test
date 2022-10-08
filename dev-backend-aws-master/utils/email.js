require('dotenv').config()

const sgMail = require('@sendgrid/mail')
const pug = require('pug')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// const msg = {
//   to: 'test@example.com', // Change to your recipient
//   from: 'test@example.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstName = user.firstName
    this.url = url
    this.from = `Tinkoko <${process.env.ACTIVATE_EMAIL_FROM}>`
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../mails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    })

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html)
    }

    // 3) Create a transport and send email
    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error.response.body)
      })
  }

  async sendEmailVerification() {
    await this.send('verifyAccount', 'Tinkoko.')
  }

  async sendReferralEmail() {
    await this.send('referralBonus', 'Your Referral Bonus with Tinkoko.')
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes).'
    )
  }
  async buyerWelcomeEmail() {
    await this.send('buyerWelcome', 'Welcome to Tinkoko.')
  }
  async sellerWelcomeEmail() {
    await this.send('sellerWelcome', 'Welcome to Tinkoko.')
  }
}
