const AccountTransaction = require('../models/AccountTransaction');

const parseDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// @GET /api/accounts
const getTransactions = async (req, res) => {
  try {
    const { type, category, search, from, to } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (from || to) {
      query.date = {};
      if (from) {
        const d = parseDate(from);
        if (d) query.date.$gte = d;
      }
      if (to) {
        const d = parseDate(to);
        if (d) query.date.$lte = d;
      }
    }
    if (search) {
      query.$or = [
        { category: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await AccountTransaction.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/accounts/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const totals = await AccountTransaction.aggregate([
      { $match: { user: userId } },
      { $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      } }
    ]);

    const monthTotals = await AccountTransaction.aggregate([
      { $match: { user: userId, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      } }
    ]);

    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpense = totals.find(t => t._id === 'expense')?.total || 0;
    const monthIncome = monthTotals.find(t => t._id === 'income')?.total || 0;
    const monthExpense = monthTotals.find(t => t._id === 'expense')?.total || 0;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        monthIncome,
        monthExpense,
        monthNet: monthIncome - monthExpense
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/accounts
const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, date, note } = req.body;
    const entry = await AccountTransaction.create({
      user: req.user._id,
      type,
      category,
      amount,
      date,
      note
    });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @PUT /api/accounts/:id
const updateTransaction = async (req, res) => {
  try {
    const entry = await AccountTransaction.findOneAndUpdate(
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

// @DELETE /api/accounts/:id
const deleteTransaction = async (req, res) => {
  try {
    const entry = await AccountTransaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
