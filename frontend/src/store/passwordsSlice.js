import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchPasswords = createAsyncThunk('passwords/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/passwords'); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createPassword = createAsyncThunk('passwords/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/passwords', data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updatePassword = createAsyncThunk('passwords/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/passwords/${id}`, data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deletePassword = createAsyncThunk('passwords/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/passwords/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const passwordsSlice = createSlice({
  name: 'passwords',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPasswords.pending, (s) => { s.loading = true })
      .addCase(fetchPasswords.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchPasswords.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createPassword.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(updatePassword.fulfilled, (s, a) => {
        const i = s.items.findIndex(p => p._id === a.payload._id)
        if (i !== -1) s.items[i] = a.payload
      })
      .addCase(deletePassword.fulfilled, (s, a) => { s.items = s.items.filter(p => p._id !== a.payload) })
  }
})

export default passwordsSlice.reducer
