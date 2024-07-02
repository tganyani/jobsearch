import { createSlice } from "@reduxjs/toolkit";

export type OpenType = {
  openAbout:boolean
  openContact:boolean
  openAddress:boolean
  openImage: boolean
  openName:boolean
};

const initialState: OpenType = {
    openAbout:false,
    openContact:false,
    openAddress:false,
    openImage:false,
    openName:false
};

export const recruiterModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setOpenAbout: (state) => {
      state.openAbout = true;
    },
    setCloseAbout: (state) => {
      state.openAbout = false;
    },
    setOpenCantact: (state) => {
        state.openContact = true;
      },
      setCloseContact: (state) => {
        state.openContact = false;
      },
      setOpenAddress: (state) => {
        state.openAddress = true;
      },
      setCloseAddress: (state) => {
        state.openAddress = false;
      },
      setOpenImage: (state) => {
        state.openImage = true;
      },
      setCloseImage: (state) => {
        state.openImage = false;
      },
      setOpenName: (state) => {
        state.openName= true;
      },
      setCloseName: (state) => {
        state.openName = false;
      },
  },
});

// Action creators are generated for each case reducer function
export const {
  setCloseAbout,
  setOpenAbout,
  setOpenCantact,
  setCloseContact,
  setOpenAddress,
  setCloseAddress,
  setOpenImage,
  setCloseImage,
  setCloseName,
  setOpenName,
} = recruiterModalSlice.actions;

export default recruiterModalSlice.reducer;


