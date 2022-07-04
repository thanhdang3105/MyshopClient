import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const cartListSlice = createSlice({
    name: 'cartList',
    initialState: [],
    reducers: {
        setInitCarts: (state, { payload }) => payload,
        removeItemCart: (state, { payload }) => state.filter((item) => item._id !== payload),
        handleAmount: (state, { payload }) => {
            const item = state.find((item) => item._id === payload.id);
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
            return action === 'delete' ? state.filter((item) => item._id !== payload.id) : state;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addCartList.fulfilled, (state, { payload }) => {
            if (typeof payload === 'number') {
                state[payload].amount += 1;
                return state;
            }
            return payload;
        });
    },
});

export default cartListSlice;

export const addCartList = createAsyncThunk('CartList/AddCart', async (product, { getState }) => {
    const state = getState().cartList;
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
