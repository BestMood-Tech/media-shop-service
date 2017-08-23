const nodemailer = require('nodemailer');

export class Nodemailer {
  private nodemailerMailgun: any;

  constructor() {
    this.nodemailerMailgun = nodemailer.createTransport({
      service: 'Mailgun',
      host: 'smtp.mailgun.org',
      port: 465,
      auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASS
      }
    })
  }

  public sendMailInvoiceLink(email, orderId) {
    return this.nodemailerMailgun.sendMail({
      from: 'BMT',
      to: `${email}`,
      subject: 'Media shop - BMT',
      text: 'Link to Invoice?',
      html: `
              <div>
                <h1>Notification</h1>
                <p>
                  <a href="https://s3.eu-central-1.amazonaws.com/${process.env.PDF_BUCKET}/${orderId}">Invoice link</a>
                </p>
              </div>
            `
    });
  }
}
