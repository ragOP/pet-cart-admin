import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  name: null,
  email: null,
  role: null,
  token: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, ...userDetails } = action.payload;
      return {
        ...state,
        ...userDetails,
        token,
      };
    },
    clearCredentials: () => initialState,
    updateServices: (state, action) => {
      state.services = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, updateServices } =
  adminSlice.actions;
export default adminSlice.reducer;
