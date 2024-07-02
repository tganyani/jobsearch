import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface SessionType {
  email: string,
  access_token:string,
  refresh_token:string,
  id:number | null,
  position:string
}

const initialState:SessionType = {
    email:"",
    access_token:"",
    refresh_token:"",
    id:null,
    position:"",
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state,action: PayloadAction<SessionType>) => {
      return{
        email:action.payload.email,
        access_token: action.payload.access_token,
        refresh_token:action.payload.refresh_token,
        id:action.payload.id,
        position:action.payload.position
      }
    },
    removeSession:(state)=>{
        return {
            email:"",
            access_token:"",
            id:null,
            position:"",
            refresh_token:"",
        }
    }
   
  },
})

// Action creators are generated for each case reducer function
export const { setSession,removeSession } = sessionSlice.actions

export default sessionSlice.reducer