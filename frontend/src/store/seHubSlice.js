import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchSEHub = createAsyncThunk('seHub/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/se-hub')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const addSEHubTask = createAsyncThunk('seHub/addTask', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/se-hub/tasks', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateSEHubTask = createAsyncThunk('seHub/updateTask', async ({ taskId, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/se-hub/tasks/${taskId}`, data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const deleteSEHubTask = createAsyncThunk('seHub/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/se-hub/tasks/${taskId}`)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const seHubSlice = createSlice({
  name: 'seHub',
  initialState: {
    data: { tasks: [], summary: { total: 0, completed: 0, inProgress: 0, pending: 0, progress: 0 } },
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSEHub.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSEHub.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchSEHub.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addSEHubTask.fulfilled, (state, action) => {
        state.data = action.payload
      })
      .addCase(updateSEHubTask.fulfilled, (state, action) => {
        state.data = action.payload
      })
      .addCase(deleteSEHubTask.fulfilled, (state, action) => {
        state.data = action.payload
      })
  }
})

export default seHubSlice.reducer
