import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface RefreshType {
  refreshNewMessage: string
}

const initialState: RefreshType = {
  refreshNewMessage: "",
}

export const RefreshSlice = createSlice({
  name: 'refresh',
  initialState,
  reducers: {
    setRefreshMessage: (state,action: PayloadAction<string>) => {
      return{
        refreshNewMessage:action.payload
      }
    },
   
  },
})

// Action creators are generated for each case reducer function
export const { setRefreshMessage } = RefreshSlice.actions

export default RefreshSlice.reducer