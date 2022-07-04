import { configureStore } from '@reduxjs/toolkit';

import productsSlice from './productsSlice';
import catalogSlice from './catalogSlice';
import cartListSlice from './cartListSlice';

const store = configureStore({
    reducer: {
        products: productsSlice.reducer,
        catalog: catalogSlice.reducer,
        cartList: cartListSlice.reducer,
    },
});

export default store;
