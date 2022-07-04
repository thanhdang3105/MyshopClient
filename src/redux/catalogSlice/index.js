import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import productsListSlice from '../productsSlice';
import axios from 'axios';

export default createSlice({
    name: 'catalog',
    initialState: {
        catalogs: [],
        categorys: [],
        editCatalog: {},
        findCatalog: [],
    },
    reducers: {
        setInitCatalogs: (state, { payload }) => ({ ...state, catalogs: payload }),
    },
    extraReducers: (builder) => {
        builder.addCase(reloadInitState.fulfilled, (state, { payload }) => ({
            ...state,
            catalogs: payload.catalog,
            categorys: payload.category,
        }));
    },
});

export const reloadInitState = createAsyncThunk('catalogs/reloadData', async (_, { dispatch }) => {
    const {
        data: { catalogs, categorys, products },
    } = await axios.get(process.env.REACT_APP_API_URL + '/api/database');
    const catalogdata = [];
    catalogs.map((catalog) => {
        categorys.map((cate) => {
            if (catalog.category.includes(cate.name)) {
                const collect = cate.children.filter((item) => item.catalog.includes(catalog.name));
                collect.sort((a, b) => a.name.localeCompare(b.name));
                if (catalogdata.length) {
                    const check = catalogdata.find((item) => item._id === catalog._id);
                    if (check) {
                        check.category.push({ ...cate, children: collect });
                    } else {
                        catalogdata.push({ ...catalog, category: [{ ...cate, children: collect }] });
                    }
                } else {
                    catalogdata.push({ ...catalog, category: [{ ...cate, children: collect }] });
                }
            } else if (!catalog.category.length) {
                const check = catalogdata.find((item) => item._id === catalog._id);
                if (!check) {
                    catalogdata.push(catalog);
                }
            }
            return cate;
        });
        return catalog;
    });
    catalogdata.map((item) => {
        item.category.sort((a, b) => a.name.localeCompare(b.name));
        return item;
    });
    dispatch(productsListSlice.actions.setInitProducts(products));
    return { catalog: catalogdata, category: categorys };
});
