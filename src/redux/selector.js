import { createSelector } from '@reduxjs/toolkit';

const productsSelector = ({ products }) => {
    let Products = [];
    if (products.products.length) {
        Products = Array.from(products.products).sort((a, b) => {
            const item1 = new Date(a.createdAt).getTime();
            const item2 = new Date(b.createdAt).getTime();
            return item2 - item1;
        });
    }
    return Products;
};
const productEditSelector = ({ products }) => products.productEdit;
const productSearchSelector = ({ products }) => products.searchProduct;
const catalogSelector = ({ catalog }) => catalog.catalogs;
const categorySelector = ({ catalog }) => catalog.categorys;
const cartListSelector = ({ cartList }) => cartList.cartList;

const productsSearch = createSelector(productsSelector, productSearchSelector, (products, search) => {
    const productsFilter =
        search !== ''
            ? products.filter(
                  (product) =>
                      product.name.toLowerCase().includes(search.toLowerCase()) ||
                      product.collections.toLowerCase().includes(search.toLowerCase()) ||
                      product.category.toLowerCase().includes(search.toLowerCase()) ||
                      product.catalog.toLowerCase().includes(search.toLowerCase()) ||
                      product.color.toLowerCase().includes(search.toLowerCase()) ||
                      product.size.toLowerCase().includes(search.toLowerCase()) ||
                      product.price <= Number(search),
              )
            : [];
    return productsFilter;
});

export { productsSearch, productsSelector, productEditSelector, catalogSelector, categorySelector, cartListSelector };
