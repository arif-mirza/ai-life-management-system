import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchDiary = createAsyncThunk('diary/fetchAll', async (params = {}, { rejectWithValue }) => {
  try { const res = await api.get('/diary', { params }); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createDiary = createAsyncThunk('diary/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/diary', data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateDiary = createAsyncThunk('diary/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/diary/${id}`, data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteDiary = createAsyncThunk('diary/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/diary/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const diarySlice = createSlice({
  name: 'diary',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiary.pending, (s) => { s.loading = true })
      .addCase(fetchDiary.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchDiary.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createDiary.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(updateDiary.fulfilled, (s, a) => { const i = s.items.findIndex(d => d._id === a.payload._id); if (i !== -1) s.items[i] = a.payload })
      .addCase(deleteDiary.fulfilled, (s, a) => { s.items = s.items.filter(d => d._id !== a.payload) })
  }
})

export default diarySlice.reducer
