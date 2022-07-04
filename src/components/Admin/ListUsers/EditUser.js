import { HomeOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Cascader, Checkbox, Form, Input, InputNumber, Modal } from 'antd';
import axios from 'axios';
import React from 'react';
import { updateDocument } from '../../../hooks/useFireStore';
import { Account } from '../../Provider/AccountProvider';

export default function EditUser({ setUserEdit, data }) {
    const { dataProvinces } = React.useContext(Account);
    const [isAdmin, setIsAdmin] = React.useState(data.admin);
    const [form] = Form.useForm();

    React.useLayoutEffect(() => {
        form.setFieldsValue({
            name: data?.name,
            address: data?.address,
            address_provinces: data?.address_provinces,
            phoneNumber: data?.phoneNumber,
            birthday: data?.birthday,
        });
    }, [data, form]);

    const handleFinish = (value) => {
        const newAddress = Array.isArray(value.address)
            ? value.address.concat(value.address_provinces).join(',')
            : value.address.split(',').concat(value.address_provinces).join(',');
        axios
            .post(process.env.REACT_APP_API_URL + '/api/admin/users', {
                action: 'setAdmin',
                data: isAdmin,
                uid: data.uid,
            })
            .catch((err) => console.log(err));
        console.log(value);
        updateDocument(data.id, 'users', {
            uid: data.uid,
            name: value.name,
            email: data.email,
            birthday: value.birthday,
            address: newAddress,
            phoneNumber: value.phoneNumber,
        });
        form.resetFields();
        setUserEdit(false);
    };
    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return (
        <Modal visible footer={null} onCancel={() => setUserEdit(false)}>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    label="Họ và Tên"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập họ và tên!',
                        },
                    ]}
                >
                    <Input
                        type="text"
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder="Nhập họ và tên"
                    />
                </Form.Item>
                <Form.Item label="Địa chỉ">
                    <Input.Group>
                        <Form.Item name="address" style={{ marginBottom: '5px' }}>
                            <Input
                                prefix={<HomeOutlined className="site-form-item-icon" />}
                                type="text"
                                placeholder="Nhập Số nhà, tên đường"
                            />
                        </Form.Item>
                        <Form.Item
                            name="address_provinces"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn địa chỉ!',
                                },
                            ]}
                            style={{ marginBottom: '0' }}
                        >
                            <Cascader options={dataProvinces} showSearch={{ filter }} placeholder="Chọn quận huyện" />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
                <Form.Item>
                    <Form.Item
                        label="Số điện thoại"
                        name="phoneNumber"
                        style={{
                            display: 'inline-block',
                            margin: '0',
                        }}
                    >
                        <InputNumber
                            prefix={<PhoneOutlined className="site-form-item-icon" />}
                            controls={false}
                            placeholder="Nhập số điện thoại"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Ngày sinh"
                        name="birthday"
                        style={{
                            display: 'inline-block',
                            margin: '0 8px',
                        }}
                    >
                        <Input type="date" placeholder="Nhập Ngày sinh" />
                    </Form.Item>
                </Form.Item>
                <Form.Item>
                    <Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)}>
                        Admin
                    </Checkbox>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
