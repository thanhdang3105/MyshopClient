import React from 'react';
import styles from './Cartlist.module.scss';
import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import { Link, useNavigate } from 'react-router-dom';
import { Empty, Button } from 'antd';
import { DeleteFilled, ShoppingFilled, WalletOutlined, CaretUpFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { cartListSelector } from '../../../redux/selector';
import axios from 'axios';
import cartListSlice from '../../../redux/cartListSlice';

const cx = classNames.bind(styles);

export default function CartList({ children, setCountItemCart }) {
    const [cartItem, setCartItem] = React.useState([]);
    // const [visible, setVisible] = React.useState({});

    const cartList = useSelector(cartListSelector);
    const loading = useSelector(({ cartList }) => cartList.loading);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useLayoutEffect(() => {
        setCartItem(cartList);
    }, [cartList]);

    React.useEffect(() => {
        const count = cartItem?.length;
        setCountItemCart(count);
    }, [cartItem, setCountItemCart]);

    React.useEffect(() => {
        loading === false && children.ref.current.click();
    }, [loading, children.ref]);

    const removeItemCart = (id) => {
        axios
            .post(process.env.REACT_APP_API_URL + '/api/cartList', {
                action: 'delete',
                data: { _id: id },
            })
            .then((res) => res.status === 200 && dispatch(cartListSlice.actions.removeItemCart(id)))
            .catch((err) => console.error(err));
    };

    return (
        <Tippy
            placement="bottom-start"
            interactive
            arrow
            trigger="click"
            render={(attrs) => (
                <>
                    <div data-popper-arrow className="popper_arrowTippy">
                        <CaretUpFilled />
                    </div>
                    <div {...attrs} className={cx('wrapper_cart')}>
                        <h4 className={cx('cart_heading')}>Giỏ hàng</h4>
                        {cartItem?.length ? (
                            <>
                                <ul className={cx('cart_list')}>
                                    {cartItem?.map((item) => {
                                        return (
                                            <li key={item._id} className={cx('cart_item')}>
                                                <Link to={item.path} className={cx('item_imgBox')}>
                                                    <img className={cx('img')} src={item.imageURL} alt={item.name} />
                                                </Link>
                                                <div className={cx('item_info')}>
                                                    <Link to={item.path} className={cx('item_name')}>
                                                        {item.name}
                                                    </Link>
                                                    <div className={cx('item_desc')}>
                                                        <span className={cx('item_size')}>
                                                            Màu: {item.color}, Size: {item.size.toUpperCase()}
                                                        </span>
                                                        <span className={cx('item_price')}>
                                                            Giá:{' '}
                                                            {Number(item.price * item.amount).toLocaleString('en-gb')}đ
                                                            x {item.amount}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="text"
                                                    className={cx('btn_removeCart')}
                                                    icon={<DeleteFilled />}
                                                    onClick={() => removeItemCart(item._id)}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className={cx('cart_control')}>
                                    <Button
                                        className={cx('btn_cart')}
                                        icon={<ShoppingFilled />}
                                        onClick={() => {
                                            children.ref.current.click();
                                            navigate('/gio-hang');
                                        }}
                                    >
                                        Giỏ hàng
                                    </Button>
                                    <Button
                                        className={cx('btn_cart')}
                                        icon={<WalletOutlined />}
                                        onClick={() => {
                                            children.ref.current.click();
                                            navigate('/thanh-toan');
                                        }}
                                    >
                                        Thanh toán
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <Empty
                                className={cx('no_item')}
                                image={`${process.env.PUBLIC_URL}/img/empty.svg`}
                                imageStyle={{
                                    height: 60,
                                }}
                                description={<span>Chưa có sản phẩm nào!</span>}
                            ></Empty>
                        )}
                    </div>
                </>
            )}
        >
            {children}
        </Tippy>
    );
}
