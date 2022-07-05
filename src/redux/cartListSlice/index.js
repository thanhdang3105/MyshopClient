import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const cartListSlice = createSlice({
    name: 'cartList',
    initialState: {
        cartList: [],
        loading: '',
    },
    reducers: {
        setLoadingCart: (state, { payload }) => ({ ...state, loading: payload }),
        setInitCarts: (state, { payload }) => ({ ...state, cartList: payload }),
        removeItemCart: (state, { payload }) => {
            const newCart = state.cartList.filter((item) => item._id !== payload);
            return { ...state, cartList: newCart };
        },
        handleAmount: (state, { payload }) => {
            const item = state.cartList.find((item) => item._id === payload.id);
            let action = 'update';
            switch (payload.action) {
                case 'up':
                    item.amount += 1;
                    break;
                case 'down':
                    if (item.amount === 1) {
                        action = 'delete';
                    } else {
                        item.amount -= 1;
                    }
                    break;
                default:
                    throw new Error(`Invalid action ${payload.action}`);
            }
            axios.post(process.env.REACT_APP_API_URL + '/api/cartList', {
                action,
                data: { _id: payload.id, amount: item.amount },
            });
            return action === 'delete' ? state.cartList.filter((item) => item._id !== payload.id) : state;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCartList.pending, (state) => {
                state.loading = true;
                return state;
            })
            .addCase(addCartList.fulfilled, (state, { payload }) => {
                if (typeof payload === 'number') {
                    state.cartList[payload].amount += 1;
                    state.loading = false;
                    return state;
                }
                return { ...state, cartList: payload, loading: false };
            });
    },
});

export default cartListSlice;

export const addCartList = createAsyncThunk('CartList/AddCart', async (product, { getState }) => {
    const state = getState().cartList.cartList;
    const check = state.findIndex(
        (item) => item.slug === product.slug && item.color === product.color && item.size === product.size,
    );
    if (check === -1) {
        const res = await axios.post(process.env.REACT_APP_API_URL + '/api/cartList', {
            action: 'create',
            data: product,
        });
        const data = await res.data;
        return [...state, data];
    } else {
        axios.post(process.env.REACT_APP_API_URL + '/api/cartList', {
            action: 'update',
            data: { _id: state[check]._id, amount: state[check].amount + 1 },
        });
        return check;
    }
});
