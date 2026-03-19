const app = require('../app');
const connectDB = require('../lib/connectDb');

module.exports = async (req, res) => {
  try {
    const requestPath = req.url || req.path || '/';
    const isPublicHealthRoute = requestPath === '/' || requestPath === '/health' || requestPath === '/api/health';

    if (!isPublicHealthRoute) {
      await connectDB();
    }

    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Serverless function failed'
    });
  }
};
