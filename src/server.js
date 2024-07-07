const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const { to, subject, text, attachment } = req.body;

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
        content: Buffer.from(attachment, 'base64')
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    res.status(500).send('Error sending email');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
