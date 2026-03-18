import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchNotes = createAsyncThunk('notes/fetchAll', async (params = {}, { rejectWithValue }) => {
  try { const res = await api.get('/notes', { params }); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createNote = createAsyncThunk('notes/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/notes', data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateNote = createAsyncThunk('notes/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/notes/${id}`, data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteNote = createAsyncThunk('notes/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/notes/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const notesSlice = createSlice({
  name: 'notes',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (s) => { s.loading = true })
      .addCase(fetchNotes.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchNotes.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createNote.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(updateNote.fulfilled, (s, a) => { const i = s.items.findIndex(n => n._id === a.payload._id); if (i !== -1) s.items[i] = a.payload })
      .addCase(deleteNote.fulfilled, (s, a) => { s.items = s.items.filter(n => n._id !== a.payload) })
  }
})

export default notesSlice.reducer
