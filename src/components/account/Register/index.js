import React from 'react';
import { UserOutlined, LockOutlined, LockFilled, HomeOutlined, PhoneOutlined } from '@ant-design/icons';
import { Form, Input, Button, Cascader, InputNumber } from 'antd';
import { auth } from '../../../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDocument } from '../../../hooks/useFireStore';
import { Account } from '../../Provider/AccountProvider';

export default function Register({ setRegister, setVisibleLoginModal, setTitle }) {
    const [loading, setLoading] = React.useState(false);
    const [validatePWD, setValidatePWD] = React.useState({});
    const [validateEmail, setValidateEmail] = React.useState({});

    const { dataProvinces } = React.useContext(Account);

    const [form] = Form.useForm();

    const handleFinish = async (value) => {
        const { username, password, password_check, email, address, address_provinces, phoneNumber, birthday } = value;
        setLoading(true);
        if (password !== password_check) {
            setLoading(false);
            setValidatePWD({ validateStatus: 'error', help: 'Mật khẩu không khớp' });
        } else {
            try {
                const userCrendital = await createUserWithEmailAndPassword(auth, email, password);
                const data = {
                    uid: userCrendital.user.uid,
                    name: username,
                    email,
                    address: address + ',' + address_provinces?.join(','),
                    phoneNumber,
                    birthday: birthday,
                };
                form.resetFields();
                setTitle('Đăng nhập');
                addDocument('users', data);
                setLoading(false);
                setVisibleLoginModal(false);
                setRegister(false);
            } catch {
                setLoading(false);
                setValidateEmail({ validateStatus: 'error', help: 'Tài khoản đã tồn tại!' });
            }
        }
    };

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
                label="Họ và Tên"
                name="username"
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
            <Form.Item
                {...validateEmail}
                label="Tên đăng nhập*"
                name="email"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng nhập tên đăng nhập!',
                    },
                ]}
            >
                <Input
                    type="email"
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="VD: NguyenVanA@gmai.com"
                    onChange={() => setValidateEmail({})}
                />
            </Form.Item>
            <Form.Item
                label="Mật khẩu*"
                name="password"
                rules={[
                    {
                        message: 'Tối thiểu 6 kí tự bao gồm ít nhất 1 chữ viết hoa và 1 số!',
                        pattern: '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}',
                    },
                    {
                        required: true,
                        message: 'Vui lòng nhập mật khẩu',
                    },
                ]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Tối thiểu 6 kí tự bao gồm ít nhất 1 chữ viết hoa và 1 số"
                />
            </Form.Item>
            <Form.Item
                label="Nhập lại mật khẩu*"
                name="password_check"
                dependencies={['password']}
                {...validatePWD}
                rules={[
                    {
                        message: 'Tối thiểu 6 kí tự bao gồm ít nhất 1 chữ viết hoa và 1 số!',
                        pattern: '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}',
                    },
                    {
                        required: true,
                        message: 'Vui lòng nhập mật khẩu',
                    },
                ]}
            >
                <Input
                    prefix={<LockFilled className="site-form-item-icon" />}
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    onChange={() => setValidatePWD({})}
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
                    <Input type="date" />
                </Form.Item>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Đăng ký
                </Button>
            </Form.Item>
            <Button
                type="dashed"
                onClick={() => {
                    setTitle('Đăng nhập');
                    setRegister(false);
                }}
            >
                Trở về
            </Button>
        </Form>
    );
}
