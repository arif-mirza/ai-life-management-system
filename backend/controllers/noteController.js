const Note = require('../models/Note');

const getNotes = async (req, res) => {
  try {
    const { category, search, pinned } = req.query;
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (pinned === 'true') filter.isPinned = true;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
    const notes = await Note.find(filter)
      .populate('relatedGoal', 'title')
      .sort({ isPinned: -1, updatedAt: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createNote = async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
