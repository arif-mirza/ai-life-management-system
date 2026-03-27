const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPrayerLog,
  upsertPrayerLog,
  getPrayerStats,
  getQuranProgress,
  upsertQuranStatus,
  bulkUpsertQuran,
  bulkUpsertPrayerLog
} = require('../controllers/namazController');

router.use(protect);

// Prayer log
router.get('/log', getPrayerLog);
router.post('/log', upsertPrayerLog);
router.post('/log/bulk', bulkUpsertPrayerLog);
router.get('/stats', getPrayerStats);

// Quran progress
router.get('/quran', getQuranProgress);
router.post('/quran', upsertQuranStatus);
router.post('/quran/bulk', bulkUpsertQuran);

module.exports = router;
