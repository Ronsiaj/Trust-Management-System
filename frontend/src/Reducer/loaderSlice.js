import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    bigLoading : false
}

const loadingSlice = createSlice({
    name: "loading",
    initialState,
    reducers: {
        loadingTrue: (state) => {
            state.loading = true
        },
        loadingFalse : (state) => {
            state.loading = false
        },
        clearValue: () => initialState,
    }
});

export const { loadingTrue, loadingFalse , clearValue } = loadingSlice.actions
export default loadingSlice.reducer;