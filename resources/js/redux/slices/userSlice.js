import { createSlice } from "@reduxjs/toolkit";

const islogin = () => {
  // Remplacé: plus d'ACCESS_TOKEN en localStorage (Sanctum stateful cookies)
  return false;
};

const initialState = {
  isLogin: islogin(),
  token: null,
  userInfo:localStorage.getItem("USER_DATA") != null ? localStorage.getItem("USER_DATA") : [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoginInfo(state,action){
      const info = action.payload;
      let userdata=localStorage.setItem("USER_DATA",JSON.stringify(info.userInfo));
      state.userInfo=JSON.stringify(info.userInfo);
      state.token = null;
      state.isLogin=true;
    },

    logout(state,action){
      localStorage.removeItem("USER_DATA");
      state.token=null;
      state.userInfo=[];
      state.isLogin=false;
    },
  },
});

export const userAction = userSlice.actions;
export default userSlice.reducer;
