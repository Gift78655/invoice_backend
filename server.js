// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const upload = multer();

// CORS config to allow frontend Render app
app.use(cors({
  origin: 'https://invoice-front-mn5z.onrender.com',
  methods: ['POST'],
  credentials: false
}));

// Email sending endpoint
app.post('/api/send-invoice', upload.single('pdf'), async (req, res) => {
  const { email } = req.body;
  const pdfBuffer = req.file?.buffer;

  if (!email || !pdfBuffer) {
    return res.status(400).send('Missing email or PDF');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Future Finance Group" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Invoice from Future Finance',
      text: 'Please find attached your invoice.',
      attachments: [
        {
          filename: req.file.originalname || 'invoice.pdf',
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('✅ Email sent');
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).send('Failed to send email');
  }
});

// Use PORT from env or fallback to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Email server running on port ${PORT}`));
