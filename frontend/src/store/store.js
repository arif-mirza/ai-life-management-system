import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import goalsReducer from './goalsSlice'
import habitsReducer from './habitsSlice'
import notesReducer from './notesSlice'
import dashboardReducer from './dashboardSlice'
import uiReducer from './uiSlice'
import educationReducer from './educationSlice'
import diaryReducer from './diarySlice'
import passwordsReducer from './passwordsSlice'
import accountsReducer from './accountsSlice'
import seHubReducer from './seHubSlice'
import dailyTasksReducer from './dailyTasksSlice'
import namazReducer from './namazSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalsReducer,
    habits: habitsReducer,
    notes: notesReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    education: educationReducer,
    diary: diaryReducer,
    passwords: passwordsReducer,
    accounts: accountsReducer,
    seHub: seHubReducer,
    dailyTasks: dailyTasksReducer,
    namaz: namazReducer,
  },
})
