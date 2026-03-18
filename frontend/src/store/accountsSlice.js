import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchAccounts = createAsyncThunk('accounts/fetchAll', async (params = {}, { rejectWithValue }) => {
  try { const res = await api.get('/accounts', { params }); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchAccountSummary = createAsyncThunk('accounts/summary', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/accounts/summary'); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createAccount = createAsyncThunk('accounts/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/accounts', data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateAccount = createAsyncThunk('accounts/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/accounts/${id}`, data); return res.data.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteAccount = createAsyncThunk('accounts/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/accounts/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: { items: [], summary: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (s) => { s.loading = true })
      .addCase(fetchAccounts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchAccounts.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchAccountSummary.fulfilled, (s, a) => { s.summary = a.payload })
      .addCase(createAccount.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(updateAccount.fulfilled, (s, a) => {
        const i = s.items.findIndex(item => item._id === a.payload._id)
        if (i !== -1) s.items[i] = a.payload
      })
      .addCase(deleteAccount.fulfilled, (s, a) => { s.items = s.items.filter(item => item._id !== a.payload) })
  }
})

export default accountsSlice.reducer
