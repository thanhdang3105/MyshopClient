import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export default createSlice({
    name: 'products',
    initialState: {
        products: [],
        productEdit: {},
        searchProduct: '',
    },
    reducers: {
        setInitProducts: (state, { payload }) => ({ ...state, products: payload }),
        addProducts: (state, { payload }) => {
            state.products.push(payload);
            return state;
        },
        updateProducts: (state, { payload }) => {
            const indexUpdate = state.products.findIndex((product) => product._id === payload._id);
            state.products.splice(indexUpdate, 1, payload);
            console.log({ indexUpdate });
            console.log({ state: state.products });
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
    const { data } = await axios.get('/api/database');
    return data.products;
});
