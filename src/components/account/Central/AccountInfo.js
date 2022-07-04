import { HomeOutlined, LockFilled, LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Cascader, Form, Input, InputNumber, message, Alert, Modal } from 'antd';
import React from 'react';
import { Account } from '../../Provider/AccountProvider';
import style from '../account.module.scss';
import className from 'classnames/bind';
import axios from 'axios';
import { applyActionCode, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { updateDocument } from '../../../hooks/useFireStore';

const cx = className.bind(style);

export default function AccountInfo() {
    const { currentUser, dataProvinces } = React.useContext(Account);
    const [loading, setLoading] = React.useState(false);
    const [isUpdatePwd, setIsUpdatePwd] = React.useState(false);
    const [isUpdateInfo, setIsUpdateInfo] = React.useState(false);
    const [isVerifyEmail, setIsVerifyEmail] = React.useState(false);
    const [emailVerify, setEmailVerify] = React.useState(false);
    const [validatePWD, setValidatePWD] = React.useState({});
    const [validatePWD_old, setValidatePWD_old] = React.useState({});
    const [form] = Form.useForm();
    const [form1] = Form.useForm();

    React.useLayoutEffect(() => {
        setEmailVerify(auth?.currentUser?.emailVerified);
        const arrAddress = currentUser?.address.split(',');
        const address = arrAddress?.slice(0, arrAddress.length - 2);
        const address_provinces = arrAddress?.slice(arrAddress.length - 2, arrAddress.length);
        form.setFieldsValue({
            name: currentUser?.name,
            address,
            address_provinces,
            phoneNumber: currentUser?.phoneNumber,
            birthday: currentUser?.birthday,
        });
    }, [currentUser, form]);

    const handleFinish = (value) => {
        setIsUpdateInfo(true);
        const newAddress = Array.isArray(value.address)
            ? value.address.concat(value.address_provinces).join(',')
            : value.address.split(',').concat(value.address_provinces).join(',');
        const payload = {
            ...currentUser,
            name: value.name,
            birthday: value.birthday,
            phoneNumber: value.phoneNumber,
            address: newAddress,
        };
        updateDocument(payload.id, 'users', {
            uid: payload.uid,
            name: payload.name,
            email: currentUser.email,
            birthday: payload.birthday,
            address: payload.address,
            phoneNumber: payload.phoneNumber,
        })
            .then(() => {
                setIsUpdateInfo(false);
                message.success({
                    content: 'Cập nhật thành công ❤',
                    key: 'updateInfo',
                    duration: 2,
                });
            })
            .catch(() => {
                setIsUpdateInfo(false);
                message.error({
                    content: 'Cập nhật thất bại!',
                    key: 'updateInfoErr',
                    duration: 2,
                });
            });
    };

    const changePassword = (value) => {
        if (value.password !== value.password_check) {
            setValidatePWD({ validateStatus: 'error', help: 'Mật khẩu không khớp' });
        } else if (value.password_old === value.password) {
            setValidatePWD_old({ validateStatus: 'error', help: 'Mật khẩu mới không được trùng với mật khẩu cũ!' });
        } else {
            setIsUpdatePwd(true);
            signInWithEmailAndPassword(auth, currentUser.email, value.password_old)
                .then((UserCrendital) => {
                    if (UserCrendital.user) {
                        axios
                            .post(process.env.REACT_APP_API_URL + '/api/admin/users', {
                                action: 'updatePwd',
                                uid: UserCrendital.user.uid,
                                newPassword: value.password,
                            })
                            .then((res) => {
                                if (res.status === 200) {
                                    setIsUpdatePwd(false);
                                    form1.resetFields();
                                    message.success({
                                        content: 'Cập nhật mật khẩu thành công ❤',
                                        key: 'updatePwd',
                                        duration: 3,
                                    });
                                }
                            })
                            .catch(() => {
                                setIsUpdatePwd(false);
                                message.error({
                                    content: 'Cập nhật mật khẩu không thành công!',
                                    key: 'updatePwdErr',
                                    duration: 3,
                                });
                            });
                    }
                })
                .catch(() => {
                    setIsUpdatePwd(false);
                    setValidatePWD_old({ validateStatus: 'error', help: 'Mật khẩu không đúng!' });
                });
        }
    };

    const handleEmailVerification = () => {
        // action: verifyEmail
        setLoading(true);
        axios
            .post(process.env.REACT_APP_API_URL + '/api/admin/users', {
                action: 'verifyEmail',
                data: currentUser.email,
            })
            .then((response) => {
                if (response.status === 200) {
                    setLoading(false);
                    setIsVerifyEmail(true);
                    message.info({
                        content: 'Vui lòng check mail.',
                        key: 'verifyEmail',
                        duration: 3,
                    });
                }
            })
            .catch(() => {
                setLoading(false);
                message.error({
                    content: 'Đã xảy ra lỗi!',
                    key: 'verifyEmailerr',
                    duration: 3,
                });
            });
    };

    const handleVerify = (value) => {
        setLoading(true);
        applyActionCode(auth, value.obbCode)
            .then(() => {
                setLoading(false);
                auth.currentUser.emailVerified = true;
                setEmailVerify(true);
                message.success({
                    content: 'Xác thực thành công',
                    key: 'verifyEmailOk',
                    duration: 3,
                });
                setIsVerifyEmail(false);
            })
            .catch(() => setLoading(false));
    };

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return (
        <>
            {!emailVerify && (
                <Alert
                    message={
                        <>
                            Tài khoản của bạn chưa được xác thực!
                            <Button
                                loading={loading}
                                type="link"
                                style={{ cursor: 'pointer' }}
                                size="small"
                                onClick={handleEmailVerification}
                            >
                                Xác thực ngay
                            </Button>
                        </>
                    }
                    type="warning"
                    style={{ margin: '4px 5px 0' }}
                    showIcon
                />
            )}
            <Modal
                title="Xác thực tài khoản"
                visible={isVerifyEmail}
                footer={null}
                onCancel={() => setIsVerifyEmail(false)}
            >
                <Form layout="vertical" onFinish={handleVerify}>
                    <Form.Item
                        name="obbCode"
                        rules={[{ required: true, message: 'Vui lòng nhập mã xác thực của bạn!' }]}
                    >
                        <Input placeholder="Mã xác thực..." />
                    </Form.Item>
                    <Button loading={loading} htmlType="submit" type="primary">
                        Xác thực
                    </Button>
                </Form>
            </Modal>
            <div className={cx('wrapper')}>
                <Form form={form} layout="vertical" className={cx('wrapper_form-info')} onFinish={handleFinish}>
                    <Form.Item label="Tài khoản">
                        <Input type="text" disabled value={currentUser?.email} />
                    </Form.Item>
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
                                <Cascader
                                    options={dataProvinces}
                                    showSearch={{ filter }}
                                    placeholder="Chọn quận huyện"
                                />
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
                        <Button type="primary" loading={isUpdateInfo} htmlType="submit">
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
                {!currentUser.providerId && (
                    <Form form={form1} onFinish={changePassword}>
                        <h1>Đổi mật khẩu</h1>
                        <Form.Item
                            {...validatePWD_old}
                            label="Mật khẩu cũ"
                            name="password_old"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu',
                                },
                            ]}
                        >
                            <Input.Password
                                pattern={`(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}`}
                                title="Tối thiểu 6 kí tự bao gồm ít nhất 1 chữ viết hoa và 1 số!"
                                placeholder="Nhập mật khẩu cũ"
                                onChange={() => setValidatePWD_old({})}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Mật khẩu mới"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu',
                                },
                            ]}
                        >
                            <Input
                                pattern={`(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}`}
                                title="Tối thiểu 6 kí tự bao gồm ít nhất 1 chữ viết hoa và 1 số!"
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Tối thiểu 6 kí tự bao gồm ít nhất 1 chữ viết hoa và 1 số"
                            />
                        </Form.Item>
                        <Form.Item
                            {...validatePWD}
                            label="Nhập lại mật khẩu*"
                            name="password_check"
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu',
                                },
                            ]}
                        >
                            <Input
                                pattern={`(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}`}
                                title="Tối thiểu 6 kí tự bao gồm ít nhất 1 chữ viết hoa và 1 số!"
                                prefix={<LockFilled className="site-form-item-icon" />}
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                onChange={() => setValidatePWD({})}
                            />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={isUpdatePwd}>
                            Đổi mật khẩu
                        </Button>
                    </Form>
                )}
            </div>
        </>
    );
}
