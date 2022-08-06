import { Button, Layout, Menu, Modal, Spin, Tag } from 'antd';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../../firebase/config';
import { Account } from '../../Provider/AccountProvider';
import AccountInfo from './AccountInfo';
import TableCustom from '../../patials/TableCustom';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    InboxOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import style from '../../Admin/ListOders/ListOders.module.scss';
import className from 'classnames/bind';

const cx = className.bind(style);

const itemColumns = [
    {
        key: 'imageURL',
        dataIndex: 'imageURL',
        title: 'Ảnh',
        render: (text, record) => (
            <Link to={record.path} key={record.name + record.size}>
                <img width={80} height={80} style={{ objectFit: 'contain' }} src={text} alt="imageProducts" />
            </Link>
        ),
    },
    {
        key: 'name',
        dataIndex: 'name',
        title: 'Tên sản phẩm',
        render: (text, record) => {
            return (
                <div>
                    <Link to={record.path} className={cx('name_product')}>
                        {text}
                    </Link>
                    <span style={{ fontSize: '12px', color: 'var(--color-link)', display: 'block' }}>
                        {record.color}/{record.size.toUpperCase()} x {record.amount}
                    </span>
                </div>
            );
        },
    },
    {
        key: 'price',
        dataIndex: 'price',
        title: 'Giá',
        render: (text) => text.toLocaleString('en-gb') + 'đ',
    },
];

export default function AccountCentral() {
    const { currentUser, setVisibleLoginModal, odersList, setOdersList } = React.useContext(Account);
    const [previewOder, setPreviewOder] = React.useState({});
    const [collapsed, setCollapsed] = React.useState(false);
    const { page } = useParams();
    const navigate = useNavigate();

    React.useLayoutEffect(() => {
        window.onresize = (e) => {
            if (e.currentTarget.innerWidth < 992) {
                setCollapsed(true);
            } else {
                setCollapsed(false);
            }
        };
        if (currentUser) {
            setVisibleLoginModal(false);
        } else {
            setVisibleLoginModal(true);
        }
        return () => {
            window.onresize = null;
        };
    }, [currentUser, setVisibleLoginModal]);

    const cancelOder = (id) => {
        if (window.confirm('Bạn chắc chắn muốn huỷ đơn hàng này?')) {
            axios
                .post(process.env.REACT_APP_API_URL + '/api/OdersList', {
                    action: 'updateStatusById',
                    _id: id,
                    status: 'cancel',
                })
                .then((result) => {
                    if (result.status === 200) {
                        setOdersList((prev) => {
                            const itemCancel = prev.find((item) => item._id === id);
                            itemCancel.status = 'cancel';
                            return [...prev];
                        });
                    }
                })
                .catch((err) => console.log(err));
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: 'id',
            render: (text, record) => (
                <p className="link" onClick={() => setPreviewOder(record)}>
                    {text}
                </p>
            ),
            ellipsis: 'ellipsis',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            responsive: ['lg'],
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            responsive: ['lg'],
        },
        {
            title: 'Thành tiền',
            dataIndex: 'total',
            key: 'total',
            render: (text) => text.toLocaleString('en-gb') + 'đ',
            responsive: ['sm'],
        },

        {
            title: 'Thanh toán',
            dataIndex: 'payMethod',
            key: 'payMethod',
            responsive: ['md'],
        },
        {
            title: 'Vận chuyển',
            dataIndex: 'transport',
            key: 'transport',
            render: (text) => {
                return text === 'normal' ? 'Bình thường' : 'Hoả tốc';
            },
            responsive: ['md'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => {
                if (text === 'pending') {
                    return (
                        <Tag icon={<ClockCircleOutlined />} color="warning">
                            Chờ xác nhận
                        </Tag>
                    );
                } else if (text === 'confirm') {
                    return (
                        <Tag icon={<ClockCircleOutlined />} color="processing">
                            Đã xác nhận
                        </Tag>
                    );
                } else if (text === 'cancel') {
                    return (
                        <Tag icon={<CloseCircleOutlined />} color="error">
                            Đã huỷ
                        </Tag>
                    );
                } else {
                    return (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            Thành công
                        </Tag>
                    );
                }
            },
        },
    ];

    const logout = () => {
        signOut(auth);
        navigate('/', { replace: true });
    };
    return (
        <Layout>
            <Layout.Sider collapsible collapsed={collapsed} trigger={null} collapsedWidth={40}>
                <Menu
                    style={{ height: '100%' }}
                    mode="inline"
                    theme="light"
                    selectedKeys={[`${page}`]}
                    items={[
                        {
                            key: 'info',
                            label: <Link to="/account/info">Thông tin tài khoản</Link>,
                            icon: <UserOutlined />,
                        },
                        {
                            key: 'orders',
                            label: <Link to="/account/orders">Đơn hàng</Link>,
                            icon: <InboxOutlined />,
                        },
                        {
                            key: 'Logout',
                            label: (
                                <Button type="primary" danger onClick={logout}>
                                    Đăng xuất
                                </Button>
                            ),
                            icon: <LogoutOutlined />,
                        },
                    ]}
                />
            </Layout.Sider>
            <Layout.Content>
                {currentUser ? (
                    page === 'info' ? (
                        <AccountInfo />
                    ) : (
                        <TableCustom
                            style={{ width: '100%' }}
                            data={odersList}
                            columns={columns}
                            event2={{
                                name2: 'Huỷ Đơn',
                                handleEvent2: cancelOder,
                                query: { status: 'pending' },
                                icon: <CloseCircleOutlined />,
                            }}
                        />
                    )
                ) : (
                    <Spin
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                )}
                <Modal
                    width={1000}
                    footer={null}
                    onCancel={() => setPreviewOder([])}
                    centered
                    visible={previewOder?.items}
                >
                    {previewOder?.items?.length && (
                        <>
                            <div className={cx('box_info')}>
                                <div className={cx('col')}>
                                    <p>Mã đơn hàng: {previewOder._id}</p>
                                    <p>Tên khách hàng: {previewOder.name}</p>
                                    <p>Địa chỉ giao hàng: {previewOder.address}</p>
                                    <p>Số điện thoại: {previewOder.phoneNumber}</p>
                                </div>
                                <div className={cx('col')}>
                                    <p>Vận chuyển: {previewOder.transport === 'normal' ? 'Bình thường' : 'Hoả tốc'}</p>
                                    <p>Thanh toán: {previewOder.payMethod}</p>
                                    <p>Thành tiền: {previewOder.total.toLocaleString('en-gb') + 'đ'}</p>
                                    <p>Ghi chú: {previewOder.note}</p>
                                </div>
                            </div>
                            <TableCustom data={previewOder?.items} columns={itemColumns} />
                        </>
                    )}
                </Modal>
            </Layout.Content>
        </Layout>
    );
}
