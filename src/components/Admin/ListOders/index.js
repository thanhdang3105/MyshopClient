import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Modal, Tag, Select, message } from 'antd';
import axios from 'axios';
import React from 'react';
import TableCustum from '../../patials/TableCustom';
import style from './ListOders.module.scss';
import className from 'classnames/bind';

const cx = className.bind(style);

const itemColumns = [
    {
        key: 'imageURL',
        dataIndex: 'imageURL',
        title: 'Ảnh',
        render: (text) => (
            <img key={text} width={80} height={80} style={{ objectFit: 'contain' }} src={text} alt="imageProducts" />
        ),
    },
    {
        key: 'name',
        dataIndex: 'name',
        title: 'Tên sản phẩm',
        render: (text, record) => {
            return (
                <div>
                    <h3 className={cx('name_product')}>{text}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-link)' }}>
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

export default function ListOders({ data: { odersList, setOdersList } }) {
    const [previewOder, setPreviewOder] = React.useState({});
    const [isChangeStatus, setIsChangeStatus] = React.useState(false);

    const handleOderStatus = (id) => {
        setIsChangeStatus(true);
        setPreviewOder(odersList.find((item) => item._id === id));
    };

    const closeChangeStatus = React.useCallback(() => {
        setIsChangeStatus(false);
        setPreviewOder({});
    }, []);

    const handleChangeStatus = (value) => {
        message.loading({
            key: 'changeStatusOder',
            content: 'Đang Cập nhật trạng thái',
            duration: 1,
        });
        axios
            .post('/api/OdersList', { action: 'updateStatusById', _id: previewOder._id, status: value })
            .then((result) => {
                if (result.status === 200) {
                    setOdersList((prev) => {
                        const itemUpdate = prev.find((item) => item._id === previewOder._id);
                        itemUpdate.status = value;
                        return prev;
                    });
                }
                closeChangeStatus();
                message.success({
                    key: 'changeStatusOder',
                    content: 'Cập nhật trạng thái thành công',
                    duration: 2,
                });
            })
            .catch((err) => console.log(err));
    };
    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: 'id',
            render: (text) => (
                <p
                    key={text}
                    className="link"
                    onClick={() => {
                        setPreviewOder(odersList.find((item) => item._id === text));
                    }}
                >
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
            responsive: ['xl'],
        },
        {
            title: 'Thành tiền',
            dataIndex: 'total',
            key: 'total',
            render: (text) => text.toLocaleString('en-gb') + 'đ',
            responsive: ['md'],
        },
        {
            title: 'Thanh toán',
            dataIndex: 'payMethod',
            key: 'payMethod',
            responsive: ['lg'],
        },
        {
            title: 'Vận chuyển',
            dataIndex: 'transport',
            key: 'transport',
            render: (text) => {
                return text === 'normal' ? 'Bình thường' : 'Hoả tốc';
            },
            responsive: ['lg'],
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            responsive: ['xl'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                if (text === 'pending') {
                    return (
                        <Tag key={record._id} icon={<ClockCircleOutlined />} color="warning">
                            Chờ xác nhận
                        </Tag>
                    );
                } else if (text === 'confirm') {
                    return (
                        <Tag key={record._id} icon={<ClockCircleOutlined />} color="processing">
                            Đã xác nhận
                        </Tag>
                    );
                } else if (text === 'cancel') {
                    return (
                        <Tag key={record._id} icon={<CloseCircleOutlined />} color="error">
                            Đã huỷ
                        </Tag>
                    );
                } else {
                    return (
                        <Tag key={record._id} icon={<CheckCircleOutlined />} color="success">
                            Thành công
                        </Tag>
                    );
                }
            },
        },
    ];
    return (
        <>
            <Modal
                key={'modalOder1'}
                visible={previewOder?.items && !isChangeStatus}
                onCancel={() => setPreviewOder({})}
                title="Chi tiết đơn hàng"
                footer={null}
                width={1200}
                centered
            >
                {previewOder?.items && (
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
                        <TableCustum size="small" data={previewOder?.items} columns={itemColumns} />
                    </>
                )}
            </Modal>
            <Modal
                key={'modalOder2'}
                title="Thay đổi trạng thái đơn hàng"
                footer={null}
                visible={isChangeStatus}
                onCancel={closeChangeStatus}
            >
                <Select
                    showArrow
                    value={previewOder?.status}
                    style={{
                        width: '100%',
                    }}
                    onChange={handleChangeStatus}
                    options={[
                        {
                            color: 'error',
                            value: 'cancel',
                            label: 'Đã huỷ',
                        },
                        {
                            color: 'warning',
                            value: 'pending',
                            label: 'Chờ xác nhận',
                        },
                        {
                            color: 'processing',
                            value: 'confirm',
                            label: 'Đã xác nhận',
                        },
                        {
                            color: 'success',
                            value: 'success',
                            label: 'Thành công',
                        },
                    ]}
                />
            </Modal>
            <TableCustum
                key="tableOder"
                data={odersList}
                columns={columns}
                event1={{ name1: 'Cập nhật', handleEvent1: handleOderStatus }}
                // event2={{ name2: 'Huỷ', handleEvent2: handleCancelOder }}
            />
        </>
    );
}
