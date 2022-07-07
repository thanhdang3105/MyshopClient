import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { cartListSelector } from '../../../redux/selector';
import TableCustum from '../../patials/TableCustom';
import style from './CartList.module.scss';
import classNames from 'classnames/bind';
import { Button } from 'antd';
import Input from 'antd/lib/input/Input';
import axios from 'axios';
import cartListSlice from '../../../redux/cartListSlice';
import confirm from 'antd/lib/modal/confirm';

const cx = classNames.bind(style);

export default function CartList() {
    const cartList = useSelector(cartListSelector);
    const dispatch = useDispatch();

    const handleEvent2 = (id) => {
        confirm({
            title: 'Bạn có chắc muốn xoá sản phảm này không?',
            onOk: () => {
                axios
                    .post(process.env.REACT_APP_API_URL + '/api/cartList', {
                        action: 'delete',
                        data: { _id: id },
                    })
                    .then((res) => res.status === 200 && dispatch(cartListSlice.actions.removeItemCart(id)))
                    .catch((err) => alert(err));
            },
            type: 'confirm',
        });
    };

    const handleAmount = (id, action, amount) => {
        if (action === 'down' && amount === 1) {
            confirm({
                title: 'Bạn có chắc muốn xoá sản phảm này không?',
                onOk: () => {
                    dispatch(cartListSlice.actions.handleAmount({ id, action }));
                },
                type: 'confirm',
            });
        } else if (action === 'up' && amount === 5) {
            alert('Tối đa 5 chiếc/sẩn phẩm nếu muốn đặt thêm hãy tạo đơn mới hoặc liên hệ hotline xin cảm ơn.');
        } else {
            dispatch(cartListSlice.actions.handleAmount({ id, action }));
        }
    };
    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'imageURL',
            key: 'imageURL',
            render: (text, record) => (
                <Link key={record._id} to={record.path}>
                    <img width="80" height="80" style={{ objectFit: 'contain' }} src={text} alt="Ảnh" />
                </Link>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Link key={record._id} to={record.path}>
                    {text}
                </Link>
            ),
            responsive: ['md'],
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: (text) => text.toUpperCase(),
        },
        {
            title: 'Màu',
            dataIndex: 'color',
            key: 'color',
            ellipsis: 'ellipsis',
            responsive: ['sm'],
        },
        {
            title: 'Số lượng',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record) => {
                return (
                    <Input
                        className={cx('input_amount')}
                        size="small"
                        value={text}
                        disabled
                        prefix={
                            <Button size="small" onClick={() => handleAmount(record._id, 'down', record.amount)}>
                                -
                            </Button>
                        }
                        suffix={
                            <Button size="small" onClick={() => handleAmount(record._id, 'up', record.amount)}>
                                +
                            </Button>
                        }
                    />
                );
            },
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (text, record) => Number(text * record.amount).toLocaleString('en-gb') + 'đ',
            responsive: ['sm'],
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <TableCustum
                size="small"
                className={cx('table_cartList')}
                data={cartList}
                columns={columns}
                event2={{ name2: undefined, handleEvent2 }}
            />
            <div className={cx('wrapper_info')}>
                <h1>Tóm tắt đơn hàng</h1>
                <p>
                    Tổng cộng:{' '}
                    <span className={cx('text_price')}>
                        {cartList
                            ? cartList
                                  .reduce((total, item) => {
                                      total += item.price * item.amount;
                                      return total;
                                  }, 0)
                                  .toLocaleString('en-gb') + 'đ'
                            : 0 + 'đ'}
                    </span>
                </p>
                {cartList?.length ? (
                    <Link to="/thanh-toan" className={cx('btn')}>
                        Tiến hành thanh toán
                    </Link>
                ) : (
                    <Link to="/danh-muc/all" className={cx('btn')}>
                        Quay lại mua hàng
                    </Link>
                )}
            </div>
        </div>
    );
}
