const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    (this.url = url),
      (this.from = `Ovsenjak Tomaž <${process.env.EMAIL_FROM}>`);
  }

  createTransport() {
    //development and production
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
    return transporter;
  }

  //send the actual email
  async send(template, subject) {
    //render html based on the pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //define the email options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),
    };

    //cretea a transport and send email
    await this.createTransport().sendMail(emailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'valid for only 10 minutes');
  }
};
