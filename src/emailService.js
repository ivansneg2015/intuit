// emailService.js
const nodemailer = require('nodemailer');

const sendEmailWithAttachment = async (to, subject, text, attachment) => {
  const transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
      user: 'sneg.ivan2015@yandex.ru',
      pass: '159noobnoob'
    }
  });

  const mailOptions = {
    from: 'sneg.ivan2015@yandex.ru',
    to,
    subject,
    text,
    attachments: [
      {
        filename: 'chart.png',
        content: attachment,
        encoding: 'base64'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmailWithAttachment };
