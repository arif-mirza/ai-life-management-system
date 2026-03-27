import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'
import toast from 'react-hot-toast'

// ── Thunks ──────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk('dailyTasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/daily-tasks')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks')
  }
})

export const createTask = createAsyncThunk('dailyTasks/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/daily-tasks', payload)
    toast.success('Task added!')
    return res.data.data
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add task')
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateTask = createAsyncThunk('dailyTasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/daily-tasks/${id}`, data)
    toast.success('Task updated!')
    return res.data.data
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update task')
    return rejectWithValue(err.response?.data?.message)
  }
})

export const deleteTask = createAsyncThunk('dailyTasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/daily-tasks/${id}`)
    toast.success('Task deleted')
    return id
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete task')
    return rejectWithValue(err.response?.data?.message)
  }
})

// ── Slice ────────────────────────────────────────────────────────

const dailyTasksSlice = createSlice({
  name: 'dailyTasks',
  initialState: {
    items: [],
    loading: false,
    saving: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      // create
      .addCase(createTask.pending, (state) => { state.saving = true })
      .addCase(createTask.fulfilled, (state, action) => { state.saving = false; state.items.unshift(action.payload) })
      .addCase(createTask.rejected, (state) => { state.saving = false })
      // update
      .addCase(updateTask.pending, (state) => { state.saving = true })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.saving = false
        const idx = state.items.findIndex(t => t._id === action.payload._id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateTask.rejected, (state) => { state.saving = false })
      // delete
      .addCase(deleteTask.pending, (state) => { state.saving = true })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.saving = false
        state.items = state.items.filter(t => t._id !== action.payload)
      })
      .addCase(deleteTask.rejected, (state) => { state.saving = false })
  }
})

export default dailyTasksSlice.reducer
