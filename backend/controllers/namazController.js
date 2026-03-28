const NamazLog = require('../models/NamazLog');
const QuranProgress = require('../models/QuranProgress');

const PRAYERS = ['fajr', 'zuhar', 'asar', 'magrib', 'isha'];

// ── PRAYER LOG ──────────────────────────────────────────────────

// GET /api/namaz/log  (optional ?year=2026)
const getPrayerLog = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.year) {
      const y = req.query.year;
      filter.date = { $gte: `${y}-01-01`, $lte: `${y}-12-31` };
    }
    const logs = await NamazLog.find(filter).sort({ date: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/namaz/log  – upsert one day
const upsertPrayerLog = async (req, res) => {
  try {
    const { date, fajr, zuhar, asar, magrib, isha } = req.body;
    if (!date) return res.status(400).json({ success: false, message: 'date is required' });

    const log = await NamazLog.findOneAndUpdate(
      { user: req.user._id, date },
      { $set: { fajr, zuhar, asar, magrib, isha } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/namaz/stats  – monthly + yearly aggregation
const getPrayerStats = async (req, res) => {
  try {
    const logs = await NamazLog.find({ user: req.user._id }).sort({ date: 1 });

    // Build per-year, per-month stats
    const yearMap = {};
    logs.forEach(log => {
      const [year, month] = log.date.split('-').map(Number);
      if (!yearMap[year]) yearMap[year] = { months: {}, entries: [] };
      yearMap[year].entries.push(log);
      if (!yearMap[year].months[month]) yearMap[year].months[month] = [];
      yearMap[year].months[month].push(log);
    });

    const stats = Object.entries(yearMap).map(([year, { entries, months }]) => ({
      year: Number(year),
      totalEntries: entries.length,
      yearlyRate: calcRate(entries),
      months: Object.entries(months).map(([month, mEntries]) => ({
        month: Number(month),
        daysLogged: mEntries.length,
        rate: calcRate(mEntries)
      }))
    }));

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function calcRate(entries) {
  let completed = 0;
  entries.forEach(e => {
    PRAYERS.forEach(p => { if (e[p] === 'Present' || e[p] === 'Kaza') completed++; });
  });
  const total = entries.length * PRAYERS.length;
  return total ? Math.round((completed / total) * 100) : 0;
}

// ── QURAN PROGRESS ──────────────────────────────────────────────

// GET /api/namaz/quran
const getQuranProgress = async (req, res) => {
  try {
    const progress = await QuranProgress.find({ user: req.user._id });
    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/namaz/quran  – upsert one surah status
const upsertQuranStatus = async (req, res) => {
  try {
    const { surahId, status } = req.body;
    if (!surahId) return res.status(400).json({ success: false, message: 'surahId required' });

    const entry = await QuranProgress.findOneAndUpdate(
      { user: req.user._id, surahId: Number(surahId) },
      { $set: { status } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/namaz/quran/bulk  – upsert all 114 surahs at once (for migration)
const bulkUpsertQuran = async (req, res) => {
  try {
    const { statuses } = req.body; // [{surahId, status}, ...]
    if (!Array.isArray(statuses)) return res.status(400).json({ success: false, message: 'statuses array required' });

    const ops = statuses.map(({ surahId, status }) => ({
      updateOne: {
        filter: { user: req.user._id, surahId: Number(surahId) },
        update: { $set: { status } },
        upsert: true
      }
    }));
    await QuranProgress.bulkWrite(ops);
    res.json({ success: true, message: 'Bulk upsert complete' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/namaz/log/bulk  – import prayer log from localStorage (migration)
const bulkUpsertPrayerLog = async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ success: false, message: 'entries array required' });

    const ops = entries.map(({ date, fajr, zuhar, asar, magrib, isha }) => ({
      updateOne: {
        filter: { user: req.user._id, date },
        update: { $set: { fajr, zuhar, asar, magrib, isha } },
        upsert: true
      }
    }));
    await NamazLog.bulkWrite(ops);
    res.json({ success: true, message: 'Bulk prayer log import complete' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPrayerLog,
  upsertPrayerLog,
  getPrayerStats,
  getQuranProgress,
  upsertQuranStatus,
  bulkUpsertQuran,
  bulkUpsertPrayerLog
};
