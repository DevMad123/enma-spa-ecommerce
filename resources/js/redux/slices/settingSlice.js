import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../axios-client";

export const getCurrencydata = createAsyncThunk("currency", async () => {
  const response = await axiosClient.get("/currency/get");
  return response.data;
});

export const getWishcount = createAsyncThunk("wish", async () => {
  // Plus de token en localStorage: on tente l'appel; 401 => 0
  try {
    const response = await axiosClient.get("user/wish/count");
    if (response?.status === 200) return response.data;
  } catch (_) {}
  return 0;
});

export const shippingCost = createAsyncThunk("shipping", async (info) => {
  const response = await axiosClient.get(
    `shipping/cost/get?division_id=${info.divisionId}&district_id=${info.districtId}`
  );
  return response.data;
});

const initialState = {
  currency: "",
  basepath: "http://127.0.0.1:8000",
  // basepath:'https://admin.demo.reinforcelabhosting.com/',
  loading: false,
  error: null,
  shippingCost: 0,
  shippingLoading: false,
  shippingError: null,
  wishload: false,
  wishcount: 0,
  wisherror: null,
};

const settingSlice = createSlice({
  name: "settingInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // --- Currency
    builder
      .addCase(getCurrencydata.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrencydata.fulfilled, (state, action) => {
        state.loading = false;
        state.currency = action.payload.currency_symbol;
      })
      .addCase(getCurrencydata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Erreur currency";
      });

    // --- Shipping
    builder
      .addCase(shippingCost.pending, (state) => {
        state.shippingLoading = true;
      })
      .addCase(shippingCost.fulfilled, (state, action) => {
        state.shippingLoading = false;
        state.shippingCost = action.payload;
      })
      .addCase(shippingCost.rejected, (state, action) => {
        state.shippingLoading = false;
        state.shippingError = action.error?.message || "Erreur shipping";
      });

    // --- Wish count
    builder
      .addCase(getWishcount.pending, (state) => {
        state.wishload = true;
      })
      .addCase(getWishcount.fulfilled, (state, action) => {
        state.wishload = false;
        state.wishcount = action.payload;
      })
      .addCase(getWishcount.rejected, (state, action) => {
        state.wishload = false;
        state.wisherror = action.error?.message || "Erreur wish";
      });
  },
});

export const settingAction = settingSlice.actions;
export default settingSlice.reducer;
