import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export default createSlice({
    name: 'products',
    initialState: {
        products: [],
        productEdit: {},
        searchProduct: '',
        loading: 0,
    },
    reducers: {
        setProgress: (state, { payload }) => ({ ...state, loading: payload }),
        setInitProducts: (state, { payload }) => ({ ...state, products: payload, loading: 100 }),
        addProducts: (state, { payload }) => {
            state.products.push(payload);
            return state;
        },
        updateProducts: (state, { payload }) => {
            const indexUpdate = state.products.findIndex((product) => product._id === payload._id);
            state.products.splice(indexUpdate, 1, payload);
            return state;
        },
        deleteProduct: (state, { payload }) => {
            const indexUpdate = state.products.findIndex((product) => product._id === payload);
            state.products.splice(indexUpdate, 1);
            return state;
        },
        setProductEdit: (state, { payload }) => ({ ...state, productEdit: payload }),
        setSearchProduct: (state, { payload }) => ({ ...state, searchProduct: payload }),
    },
    extraReducers: (builder) => {
        builder.addCase(reloadProductState.fulfilled, (state, { payload }) => ({ ...state, products: payload }));
    },
});

export const reloadProductState = createAsyncThunk('products/reloadData', async () => {
    const { data } = await axios.get(process.env.REACT_APP_API_URL + '/api/database');
    return data.products;
});
