// Add this to server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors({ origin: 'https://invoice-front-mn5z.onrender.com' }));
app.use(express.json());

const invoices = {}; // In-memory store

// Save invoice
app.post('/api/invoice', (req, res) => {
  const { invoiceNumber, ...data } = req.body;
  if (!invoiceNumber) return res.status(400).json({ error: 'Missing invoiceNumber' });
  invoices[invoiceNumber] = data;
  res.status(201).json({ message: 'Invoice saved' });
});

// Fetch invoice by number
app.get('/api/invoice/:invoiceNumber', (req, res) => {
  const invoice = invoices[req.params.invoiceNumber];
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

// Email endpoint (already working)
app.post('/api/send-invoice', upload.single('pdf'), async (req, res) => {
  const { email } = req.body;
  const pdfBuffer = req.file?.buffer;
  if (!email || !pdfBuffer) return res.status(400).send('Missing email or PDF');

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
    attachments: [{ filename: req.file.originalname || 'invoice.pdf', content: pdfBuffer }],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('✅ Email sent');
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).send('Failed to send email');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

