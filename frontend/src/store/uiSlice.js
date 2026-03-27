import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    darkMode: false,
    activeModal: null,
    modalData: null,
  },
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen(state, action) { state.sidebarOpen = action.payload },
    toggleDarkMode(state) { state.darkMode = !state.darkMode },
    setDarkMode(state, action) { state.darkMode = action.payload },
    openModal(state, action) { state.activeModal = action.payload.modal; state.modalData = action.payload.data || null },
    closeModal(state) { state.activeModal = null; state.modalData = null },
  }
})

export const { toggleSidebar, setSidebarOpen, toggleDarkMode, setDarkMode, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer
