import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/goals', { params })
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/goals', data)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateGoal = createAsyncThunk('goals/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/goals/${id}`, data)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/goals/${id}`)
    return id
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const toggleTarget = createAsyncThunk('goals/toggleTarget', async ({ goalId, targetId }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/goals/${goalId}/target/${targetId}`)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchYearlyStats = createAsyncThunk('goals/yearlyStats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/goals/stats/yearly')
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const goalsSlice = createSlice({
  name: 'goals',
  initialState: { items: [], yearlyStats: [], loading: false, error: null, filters: { year: new Date().getFullYear(), category: '', status: '', search: '' } },
  reducers: {
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload } }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (s) => { s.loading = true })
      .addCase(fetchGoals.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchGoals.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createGoal.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(updateGoal.fulfilled, (s, a) => { const i = s.items.findIndex(g => g._id === a.payload._id); if (i !== -1) s.items[i] = a.payload })
      .addCase(deleteGoal.fulfilled, (s, a) => { s.items = s.items.filter(g => g._id !== a.payload) })
      .addCase(toggleTarget.fulfilled, (s, a) => { const i = s.items.findIndex(g => g._id === a.payload._id); if (i !== -1) s.items[i] = a.payload })
      .addCase(fetchYearlyStats.fulfilled, (s, a) => { s.yearlyStats = a.payload })
  }
})

export const { setFilters } = goalsSlice.actions
export default goalsSlice.reducer
