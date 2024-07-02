import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { PURGE } from "redux-persist";

export interface SessionType {
  email: string,
  access_token:string,
  refresh_token:string,
  id:number | null,
  position:string|any,
  city:string|any,
  country:string|any,
  firstName:string|any,
  lastName:string|any,
}

const initialState:SessionType = {
    email:"",
    access_token:"",
    refresh_token:"",
    id:null,
    position:"",
    city:"",
    country:"",
    firstName:"",
    lastName:"",
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
        position:action.payload?.position,
        city:action.payload?.city,
        country:action.payload?.country,
        firstName:action.payload?.firstName,
        lastName:action.payload?.lastName
      }
    },
    removeSession:(state)=>{
        return {
            email:"",
            access_token:"",
            id:null,
            position:"",
            refresh_token:"",
            city:"",
            country:"",
            firstName:"",
            lastName:"",
        }
    }
   
  },
  // extraReducers: (builder) => {
  //   builder.addCase(PURGE, (state) => {
  //       customEntityAdapter.removeAll(state);
  //   });
})

// Action creators are generated for each case reducer function
export const { setSession,removeSession } = sessionSlice.actions

export default sessionSlice.reducer