import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import productsSlice from '../../../redux/productsSlice';
import { productsSelector } from '../../../redux/selector';
import TableCustum from '../../patials/TableCustom';
import EditProduct from './EditProduct';

const columns = [
    {
        title: 'Tên sản phẩm',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'Price',
        render: (text) => text.toLocaleString('en-gb') + 'đ',
    },
    {
        title: 'Danh mục',
        dataIndex: 'catalog',
        key: 'catalog',
        responsive: ['sm'],
    },
    {
        title: 'Loại sản phẩm',
        dataIndex: 'category',
        key: 'category',
        responsive: ['md'],
    },
    {
        title: 'Kích cỡ',
        dataIndex: 'size',
        key: 'size',
        responsive: ['lg'],
    },
    {
        title: 'Màu sắc',
        dataIndex: 'color',
        key: 'color',
        responsive: ['lg'],
    },
];

export default function ListProducts() {
    const products = useSelector(productsSelector);
    const [productList, setProductList] = React.useState([]);
    const [isEdit, setIsEdit] = React.useState(false);

    const dispatch = useDispatch();

    React.useLayoutEffect(() => {
        const data = [];
        products.forEach((item) => data.push({ ...item, key: item._id }));
        setProductList(data);
    }, [products]);

    const handleProductEdit = (id) => {
        setIsEdit(true);
        const productEdit = productList.find((item) => item._id === id);
        dispatch(productsSlice.actions.setProductEdit(productEdit));
    };

    const handleRemoveProduct = (id) => {
        axios
            .delete(process.env.REACT_APP_API_URL + '/api/deleteProduct/' + id)
            .then((response) => {
                response.status === 200 && dispatch(productsSlice.actions.deleteProduct(id));
            })
            .catch((err) => console.log(err));
    };

    return (
        <>
            <EditProduct edit={{ isEdit, setIsEdit }} />
            <TableCustum
                data={productList}
                columns={columns}
                event1={{ name1: 'Edit', handleEvent1: handleProductEdit }}
                event2={{ name2: 'Xoá', handleEvent2: handleRemoveProduct }}
            />
        </>
    );
}
