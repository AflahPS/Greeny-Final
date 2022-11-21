const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASS,
    },
  });

  //2) Define email options
  const emailOptions = {
    from: `Administrator -Greeny Inc, <${process.env.EMAIL_ADDRESS}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) Send the email
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
