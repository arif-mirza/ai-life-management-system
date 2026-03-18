const DiaryEntry = require('../models/DiaryEntry');

// @GET /api/diary
const getEntries = async (req, res) => {
  try {
    const { mood, search, from, to } = req.query;
    const query = { user: req.user._id };

    if (mood) query.mood = mood;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const entries = await DiaryEntry.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/diary
const createEntry = async (req, res) => {
  try {
    const { date, title, mood, content } = req.body;
    const entry = await DiaryEntry.create({
      user: req.user._id,
      date,
      title,
      mood,
      content
    });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @PUT /api/diary/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @DELETE /api/diary/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEntries, createEntry, updateEntry, deleteEntry };
