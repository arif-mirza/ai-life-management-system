const PasswordEntry = require('../models/PasswordEntry');
const { encrypt, decrypt } = require('../lib/encryption');

// GET /api/passwords
const getPasswords = async (req, res) => {
  try {
    const entries = await PasswordEntry.find({ user: req.user._id }).sort({ updatedAt: -1 });
    // Decrypt passwords before sending to client
    const decrypted = entries.map(e => ({
      _id: e._id,
      platform: e.platform,
      username: e.username,
      password: decrypt(e.encryptedPassword),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));
    res.json({ success: true, data: decrypted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/passwords
const createPassword = async (req, res) => {
  try {
    const { platform, username, password } = req.body;
    const entry = await PasswordEntry.create({
      user: req.user._id,
      platform,
      username,
      encryptedPassword: encrypt(password || '')
    });
    res.status(201).json({
      success: true,
      data: {
        _id: entry._id,
        platform: entry.platform,
        username: entry.username,
        password: password || '',
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/passwords/:id
const updatePassword = async (req, res) => {
  try {
    const { platform, username, password } = req.body;
    const update = { platform, username };
    if (password !== undefined) update.encryptedPassword = encrypt(password);

    const entry = await PasswordEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    res.json({
      success: true,
      data: {
        _id: entry._id,
        platform: entry.platform,
        username: entry.username,
        password: decrypt(entry.encryptedPassword),
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/passwords/:id
const deletePassword = async (req, res) => {
  try {
    const entry = await PasswordEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPasswords, createPassword, updatePassword, deletePassword };
