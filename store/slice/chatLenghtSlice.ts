import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface unReadType {
  unRead:number
}

const initialState: unReadType = {
  unRead: 0,
}

export const unReadSlice = createSlice({
  name: 'unreadChats',
  initialState,
  reducers: {
    setUnReadLenght: (state,action: PayloadAction<number>) => {
      return{
        unRead:action.payload
      }
    },
   
  },
})

// Action creators are generated for each case reducer function
export const { setUnReadLenght } = unReadSlice.actions

export default unReadSlice.reducer





