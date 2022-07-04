import { Badge, Button, Cascader, Divider, Form, Input, Layout, message, Radio } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React from 'react';
import { Account } from '../../Provider/AccountProvider';
import style from './Payment.module.scss';
import className from 'classnames/bind';
import { CreditCardOutlined, DollarOutlined, LeftOutlined, MediumOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { cartListSelector } from '../../../redux/selector';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cartListSlice from '../../../redux/cartListSlice';

const cx = className.bind(style);

export default function Payment() {
    const { dataProvinces, currentUser, setOdersList } = React.useContext(Account);
    const dataCart = useSelector(cartListSelector);
    const [totalPrice, setTotalPrice] = React.useState({ total: 0, transport: 0 });
    const [discount, setDiscount] = React.useState({ code: '', value: 0 });
    const [transport, setTransport] = React.useState('normal');
    const [payMethod, setPayMethod] = React.useState('COD');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    React.useLayoutEffect(() => {
        if (!dataCart.length) {
            message.info({
                content: 'Chưa có sản phẩm để thanh toán',
                key: 'pageError',
                duration: 3,
            });
            setTimeout(() => {
                navigate('/account/orders');
            }, 2000);
            return;
        }
        const total = dataCart?.reduce((total, item) => {
            total += item.amount * item.price;
            return total;
        }, 0);
        if (transport === 'normal') {
            setTotalPrice({ total, transport: 0 });
        } else {
            setTotalPrice({ total, transport: 50000 });
        }
    }, [dataCart, transport, navigate]);

    React.useLayoutEffect(() => {
        const arrAddress = currentUser?.address.split(',');
        const address = arrAddress?.slice(0, arrAddress.length - 2);
        const address_province = arrAddress?.slice(arrAddress.length - 2, arrAddress.length);
        form.setFieldsValue({
            name: currentUser?.name,
            phoneNumber: currentUser?.phoneNumber,
            address,
            address_province,
        });
    }, [currentUser, form]);

    React.useEffect(() => {
        switch (payMethod) {
            case 'COD':
                document.querySelector('.banking').classList.remove('show');
                document.querySelector('.cod').classList.add('show');
                break;
            case 'BANKING':
                document.querySelector('.cod').classList.remove('show');
                document.querySelector('.banking').classList.add('show');
                break;
            case 'MOMO':
                document.querySelector('.banking').classList.remove('show');
                document.querySelector('.cod').classList.remove('show');
                break;
            default:
                throw new Error('Invalid method');
        }
    }, [payMethod]);

    const handleDiscount = (value) => {
        setDiscount({ code: value.code, value: 0.1 });
    };

    const handleFinish = (value) => {
        message.loading({
            content: 'Đặt hàng...',
            key: 'oder',
        });
        value.address = value.address.concat(value.address_province).join(',');
        const data = {
            user: currentUser.uid,
            name: value.name,
            total: totalPrice.total + totalPrice.transport - totalPrice.total * discount.value,
            phoneNumber: value.phoneNumber,
            address: value.address,
            transport,
            payMethod,
            note: value.note,
            discount: discount.code,
            items: dataCart.map((item) => {
                const { user, _id, slug, ...value } = item;
                return value;
            }),
        };
        Promise.all([
            axios.post('/api/OdersList', { action: 'create', data }),
            axios.post('/api/cartList', { action: 'deleteByUserId', data: { userId: currentUser.uid } }),
        ])
            .then(([resultOder, resultCart]) => {
                if (resultOder.status === 200) {
                    message.success({
                        content: 'Đặt hàng thành công',
                        key: 'oder',
                        duration: 2,
                    });
                    dispatch(cartListSlice.actions.setInitCarts([]));
                    setOdersList((prev) => {
                        prev.push(resultOder.data);
                        return prev;
                    });
                    setTimeout(() => {
                        navigate('/account/orders', { replace: true });
                    }, 2000);
                }
            })
            .catch((err) => console.error(err));
    };

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return (
        <Layout className={cx('wrapper')}>
            <Layout.Content className={cx('content_info')}>
                <Form form={form} className={cx('form_info')} onFinish={handleFinish}>
                    <div style={{ flex: 1 }}>
                        <h1>Thông tin nhận hàng</h1>
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên người nhận!' }]}
                        >
                            <Input placeholder="Nhập Họ và Tên..." />
                        </Form.Item>
                        <Form.Item
                            name="phoneNumber"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại người nhận!' }]}
                        >
                            <Input placeholder="Nhập số điện thoại..." />
                        </Form.Item>
                        <Form.Item
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng!' }]}
                        >
                            <Input placeholder="Nhập địa chỉ..." />
                        </Form.Item>
                        <Form.Item
                            name="address_province"
                            rules={[{ required: true, message: 'Vui lòng chọn quận huyện!' }]}
                        >
                            <Cascader
                                allowClear
                                options={dataProvinces}
                                showSearch={{ filter }}
                                placeholder="Chọn quận huyện"
                            />
                        </Form.Item>
                        <Form.Item name="note">
                            <TextArea placeholder="Ghi chú" />
                        </Form.Item>
                    </div>
                    <div className={cx('div_transport')}>
                        <h1>Vận chuyển</h1>
                        <Radio.Group
                            value={transport}
                            size="large"
                            className={cx('transport_list')}
                            onChange={(e) => setTransport(e.target.value)}
                        >
                            <Input.Group compact className={cx('transport_item')}>
                                <Radio value="normal">Bình thường</Radio>
                                <p>Miễn phí</p>
                            </Input.Group>
                            <Input.Group compact className={cx('transport_item')}>
                                <Radio value="power">Hoả tốc</Radio>
                                <p>50.000đ</p>
                            </Input.Group>
                        </Radio.Group>
                        <h1 style={{ marginTop: '20px' }}>Thanh toán</h1>
                        <Radio.Group
                            value={payMethod}
                            size="large"
                            className={cx('transport_list')}
                            onChange={(e) => setPayMethod(e.target.value)}
                        >
                            <Input.Group compact className={cx('transport_item')}>
                                <Radio onClick={() => document.querySelector('.cod').classList.add('show')} value="COD">
                                    Thanh toán khi nhận hàng
                                </Radio>
                                <DollarOutlined />
                            </Input.Group>
                            <Input.Group compact className={`${cx('transport_item')} cod`}>
                                Bạn chỉ phải thanh toán khi nhận được hàng
                            </Input.Group>
                            <Input.Group compact className={cx('transport_item')}>
                                <Radio value="BANKING">Chuyển khoản</Radio>
                                <CreditCardOutlined />
                            </Input.Group>
                            <Input.Group compact className={`${cx('transport_item')} banking`}>
                                STK: 3210131052000 <br />
                                Ngân hàng: MB <br />
                                Chủ tài khoản: Đặng Hữu Thanh <br />
                                Vui lòng ghi nội dung ck:
                                <br />
                                Họ và tên,Số điện thoại đặt hàng,Tên tài khoản nếu có
                            </Input.Group>
                            <Input.Group compact className={cx('transport_item')}>
                                <Radio value="MOMO">Ví điện tử MOMO</Radio>
                                <MediumOutlined />
                            </Input.Group>
                        </Radio.Group>
                    </div>
                </Form>
                <Divider />
                <div style={{ textAlign: 'right' }}>
                    <Link to="ho-tro" style={{ color: '#2db7f5' }}>
                        Điều khoản sử dụng
                    </Link>
                </div>
            </Layout.Content>
            <Layout.Content className={cx('content_cart')}>
                <h1 className={cx('content_cart-title')}>Đơn hàng ( sản phẩm)</h1>
                <div className={cx('content_box')}>
                    <ul className={cx('list_item')}>
                        {dataCart?.map((item) => (
                            <li key={item._id} className={cx('item_cart')}>
                                <Badge count={item.amount} color="#2db7f5">
                                    <img
                                        className={cx('img_item')}
                                        src={require(`../../../asset/img/${item.imageURL}`)}
                                        alt={item.name}
                                    />
                                </Badge>
                                <div className={cx('item_title')}>
                                    <Link to={item.path}>{item.name}</Link>
                                    <span>
                                        {item.color} / {item.size.toUpperCase()}
                                    </span>
                                </div>
                                <p className={cx('item_price')}>{item.price.toLocaleString('en-gb')}đ</p>
                            </li>
                        ))}
                    </ul>
                    <Divider />
                    <Form layout="vertical" onFinish={handleDiscount}>
                        <Form.Item
                            label="Mã ưu đãi"
                            name="code"
                            rules={[{ required: true, message: 'Vui lòng nhập mã của bạn' }]}
                        >
                            <Input placeholder="Nếu có mã ưu đãi hãy nhập vào đây" />
                        </Form.Item>
                        <Button className={cx('btn')} htmlType="submit">
                            Áp dụng mã ưu đãi
                        </Button>
                    </Form>
                    <Divider />
                    <p className={cx('text_box')}>
                        Thành tiền: <span>{totalPrice.total.toLocaleString('en-gb')}đ</span>
                    </p>
                    <p className={cx('text_box')}>
                        Vận chuyển:{' '}
                        <span>
                            {totalPrice.transport ? totalPrice.transport.toLocaleString('en-gb') + 'đ' : 'Miễn phí'}
                        </span>
                    </p>
                    {discount.value !== 0 && (
                        <p className={cx('text_box')}>
                            Chiết khấu:{' '}
                            <span>
                                {(totalPrice.total * discount.value).toLocaleString('en-gb')}({discount.value * 100}%)
                            </span>
                        </p>
                    )}
                    <Divider />
                    <p className={cx('text_box')}>
                        Tổng cộng:{' '}
                        <span style={{ color: '#2db7f5', fontWeight: 'bold', fontSize: '18px' }}>
                            {(
                                totalPrice.total +
                                totalPrice.transport -
                                totalPrice.total * discount.value
                            ).toLocaleString('en-gb')}
                            đ
                        </span>
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px',
                        }}
                    >
                        <Link
                            to="/gio-hang"
                            style={{
                                color: '#2db7f5',
                                fontSize: '18px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                            }}
                        >
                            <LeftOutlined style={{ fontSize: '14px' }} /> Quay lại giỏ hàng
                        </Link>
                        <Button
                            type="primary"
                            size="large"
                            style={{ borderRadius: '5px' }}
                            onClick={() => form.submit()}
                        >
                            Đặt hàng
                        </Button>
                    </div>
                </div>
            </Layout.Content>
        </Layout>
    );
}
