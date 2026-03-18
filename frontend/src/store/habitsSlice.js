import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchHabits = createAsyncThunk('habits/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/habits'); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createHabit = createAsyncThunk('habits/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/habits', data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateHabit = createAsyncThunk('habits/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/habits/${id}`, data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteHabit = createAsyncThunk('habits/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/habits/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const logHabit = createAsyncThunk('habits/log', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.post(`/habits/${id}/log`, data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const removeHabitLog = createAsyncThunk('habits/removeLog', async ({ id, date }, { rejectWithValue }) => {
  try { const res = await api.delete(`/habits/${id}/log`, { data: { date } }); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchHabitStats = createAsyncThunk('habits/stats', async (params = {}, { rejectWithValue }) => {
  try { const res = await api.get('/habits/stats', { params }); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const habitsSlice = createSlice({
  name: 'habits',
  initialState: { items: [], stats: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const updateItem = (s, a) => { const i = s.items.findIndex(h => h._id === a.payload._id); if (i !== -1) s.items[i] = a.payload }
    builder
      .addCase(fetchHabits.pending, (s) => { s.loading = true })
      .addCase(fetchHabits.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchHabits.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createHabit.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(updateHabit.fulfilled, updateItem)
      .addCase(deleteHabit.fulfilled, (s, a) => { s.items = s.items.filter(h => h._id !== a.payload) })
      .addCase(logHabit.fulfilled, updateItem)
      .addCase(removeHabitLog.fulfilled, updateItem)
      .addCase(fetchHabitStats.fulfilled, (s, a) => { s.stats = a.payload })
  }
})

export default habitsSlice.reducer
