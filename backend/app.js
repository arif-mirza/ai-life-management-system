const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const configuredOrigins = [
  'http://localhost:5173',
  'https://ai-life-management-system.vercel.app',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
];

if (process.env.VERCEL_URL) {
  configuredOrigins.push(`https://${process.env.VERCEL_URL}`);
}

const vercelPreviewPattern = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (configuredOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LifePortal API is live',
    health: '/api/health'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'LifePortal API is running'
  });
});

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database not connected' });
  }
  return next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/diary', require('./routes/diaryRoutes'));
app.use('/api/passwords', require('./routes/passwordRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/se-hub', require('./routes/seHubRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'LifePortal API is running'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
