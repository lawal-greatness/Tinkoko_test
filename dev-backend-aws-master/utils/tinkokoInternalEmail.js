require('dotenv').config()

const sgMail = require('@sendgrid/mail')
const pug = require('pug')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = class TinkokoInternalEmail {
  constructor(content, recipientEmail) {
    this.to = recipientEmail
    this.quote = content.quote
    this.personName = content.name
    this.phone = content.phone
    this.email = content.email
    this.city = content.city
    this.address = content.address
    this.description = content.description
    this.message = content.message
    this.from = `Tinkoko <${process.env.ACTIVATE_EMAIL_FROM}>`
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../mails/${template}.pug`, {
      quote: this.quote,
      personName: this.personName,
      phone: this.phone,
      email: this.email,
      city: this.city,
      address: this.address,
      description: this.description,
      businessName: this.businessName,
      industry: this.industry,
      country: this.country,
      lga: this.lga,
      companyName: this.companyName,
      message: this.message,

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

  async sendQuoteEmail() {
    await this.send('quoteEmail', 'New Quote From Customer.')
  }

  async sendAdvertEmail() {
    await this.send('advertEmail', 'New Advert From Company.')
  }

  async sendContactEmail() {
    await this.send('contactUsEmail', 'A Customer has contacted you.')
  }
}
