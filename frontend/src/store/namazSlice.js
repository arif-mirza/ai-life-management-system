import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'
import toast from 'react-hot-toast'

// ── Prayer Log Thunks ────────────────────────────────────────────

export const fetchPrayerLog = createAsyncThunk('namaz/fetchLog', async (year, { rejectWithValue }) => {
  try {
    const params = year ? { year } : {}
    const res = await api.get('/namaz/log', { params })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch prayer log')
  }
})

export const savePrayerEntry = createAsyncThunk('namaz/saveEntry', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/namaz/log', payload)
    toast.success('Prayer entry saved!')
    return res.data.data
  } catch (err) {
    toast.error('Failed to save prayer entry')
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchPrayerStats = createAsyncThunk('namaz/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/namaz/stats')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const bulkImportPrayerLog = createAsyncThunk('namaz/bulkImport', async (entries, { rejectWithValue }) => {
  try {
    await api.post('/namaz/log/bulk', { entries })
    toast.success('Prayer data migrated to cloud!')
    return entries
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// ── Quran Thunks ─────────────────────────────────────────────────

export const fetchQuranProgress = createAsyncThunk('namaz/fetchQuran', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/namaz/quran')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const saveQuranStatus = createAsyncThunk('namaz/saveQuran', async ({ surahId, status }, { rejectWithValue }) => {
  try {
    const res = await api.post('/namaz/quran', { surahId, status })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const bulkImportQuran = createAsyncThunk('namaz/bulkImportQuran', async (statuses, { rejectWithValue }) => {
  try {
    await api.post('/namaz/quran/bulk', { statuses })
    toast.success('Quran progress migrated to cloud!')
    return statuses
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// ── Slice ─────────────────────────────────────────────────────────

const namazSlice = createSlice({
  name: 'namaz',
  initialState: {
    prayerLog: [],      // array of NamazLog docs
    quranProgress: {},  // { surahId: status }
    stats: [],          // per-year stats from server
    loading: false,
    saving: false,
    error: null
  },
  reducers: {
    // Optimistic update for quran status (instant UI feedback)
    optimisticQuranUpdate(state, action) {
      const { surahId, status } = action.payload
      state.quranProgress[surahId] = status
    }
  },
  extraReducers: (builder) => {
    builder
      // ── Prayer log
      .addCase(fetchPrayerLog.pending, (state) => { state.loading = true })
      .addCase(fetchPrayerLog.fulfilled, (state, action) => {
        state.loading = false
        state.prayerLog = action.payload
      })
      .addCase(fetchPrayerLog.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(savePrayerEntry.pending, (state) => { state.saving = true })
      .addCase(savePrayerEntry.fulfilled, (state, action) => {
        state.saving = false
        const idx = state.prayerLog.findIndex(e => e.date === action.payload.date)
        if (idx !== -1) state.prayerLog[idx] = action.payload
        else state.prayerLog.unshift(action.payload)
      })
      .addCase(savePrayerEntry.rejected, (state) => { state.saving = false })

      // ── Stats
      .addCase(fetchPrayerStats.fulfilled, (state, action) => { state.stats = action.payload })

      // ── Bulk import prayer log
      .addCase(bulkImportPrayerLog.fulfilled, (state, action) => {
        // Server handled upsert; merge into local state
        action.payload.forEach(entry => {
          const idx = state.prayerLog.findIndex(e => e.date === entry.date)
          if (idx === -1) state.prayerLog.unshift(entry)
        })
      })

      // ── Quran
      .addCase(fetchQuranProgress.fulfilled, (state, action) => {
        // Convert array to map for fast lookup: { surahId: status }
        const map = {}
        action.payload.forEach(e => { map[e.surahId] = e.status })
        state.quranProgress = map
      })
      .addCase(saveQuranStatus.fulfilled, (state, action) => {
        state.quranProgress[action.payload.surahId] = action.payload.status
      })
      .addCase(bulkImportQuran.fulfilled, (state, action) => {
        action.payload.forEach(({ surahId, status }) => { state.quranProgress[surahId] = status })
      })
  }
})

export const { optimisticQuranUpdate } = namazSlice.actions
export default namazSlice.reducer
