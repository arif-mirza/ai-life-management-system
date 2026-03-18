import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchEducation = createAsyncThunk('education/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/education')
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const addSemester = createAsyncThunk('education/addSemester', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/education/semesters', data)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateSemester = createAsyncThunk('education/updateSemester', async ({ semesterId, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/education/semesters/${semesterId}`, data)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteSemester = createAsyncThunk('education/deleteSemester', async (semesterId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/education/semesters/${semesterId}`)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const addCourse = createAsyncThunk('education/addCourse', async ({ semesterId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/education/semesters/${semesterId}/courses`, data)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateCourse = createAsyncThunk('education/updateCourse', async ({ semesterId, courseId, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/education/semesters/${semesterId}/courses/${courseId}`, data)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteCourse = createAsyncThunk('education/deleteCourse', async ({ semesterId, courseId }, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/education/semesters/${semesterId}/courses/${courseId}`)
    return res.data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const educationSlice = createSlice({
  name: 'education',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEducation.pending, (s) => { s.loading = true })
      .addCase(fetchEducation.fulfilled, (s, a) => { s.loading = false; s.data = a.payload })
      .addCase(fetchEducation.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(addSemester.fulfilled, (s, a) => { s.data = a.payload })
      .addCase(updateSemester.fulfilled, (s, a) => { s.data = a.payload })
      .addCase(deleteSemester.fulfilled, (s, a) => { s.data = a.payload })
      .addCase(addCourse.fulfilled, (s, a) => { s.data = a.payload })
      .addCase(updateCourse.fulfilled, (s, a) => { s.data = a.payload })
      .addCase(deleteCourse.fulfilled, (s, a) => { s.data = a.payload })
  }
})

export default educationSlice.reducer
