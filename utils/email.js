const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) create a trnasporter
  var transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '0be268ca2d57c7',
      pass: 'fce09ba775a59a',
    },
  });
  //2) define th email options
  const emailOptions = {
    from: 'Tomaz Ovsenjak <tomaz@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) Actually sen the email
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
