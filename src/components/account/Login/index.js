import { Button, Form, Input, message } from 'antd';
import React from 'react';
import { UserOutlined, LockOutlined, LockFilled } from '@ant-design/icons';

import styles from '../account.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { confirmPasswordReset, signInWithEmailAndPassword, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { Account } from '../../Provider/AccountProvider';
import axios from 'axios';

const cx = classNames.bind(styles);

export default function Login({ setRegister, setVisibleLoginModal, setTitle }) {
    const [loading, setLoading] = React.useState(false);
    const [validate, setValidate] = React.useState({});
    const [validateAccount, setValidateAccount] = React.useState({});
    const [validatePWD, setValidatePWD] = React.useState({});
    const [validateVerifiCode, setValidateVerifiCode] = React.useState({});
    const [forgotPassword, setForgotPassword] = React.useState(false);
    const [resetPassword, setResetPassword] = React.useState(false);
    const { listUser } = React.useContext(Account);

    const [form] = Form.useForm();
    const [form1] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const userCrendital = await signInWithEmailAndPassword(auth, values.username, values.password);
            if (userCrendital.user) {
                setLoading(false);
            }
            form.resetFields();
            setVisibleLoginModal(false);
        } catch (error) {
            setLoading(false);
            if (error.code === 'auth/wrong-password') {
                setValidate({ validateStatus: 'error', help: 'Sai tên đăng nhập hoặc mật khẩu!' });
            } else {
                setValidate({ validateStatus: 'error', help: 'Tài khoản không tồn tại!' });
            }
        }
    };

    const handleResetPassword = (value) => {
        setLoading(true);
        if (resetPassword) {
            if (value.password !== value.password_check) {
                setLoading(false);
                setValidatePWD({ validateStatus: 'error', help: 'Mật khẩu không khớp' });
            } else {
                verifyPasswordResetCode(auth, value.oobCode)
                    .then((email) => {
                        form.resetFields();
                        confirmPasswordReset(auth, value.oobCode, value.password)
                            .then(() => {
                                setLoading(false);
                                setResetPassword(false);
                                setForgotPassword(false);
                                setTitle('Đăng nhập');
                                message.success({
                                    content: 'Cập nhật mật khẩu thành công ❤',
                                    key: 'resetPwdOk',
                                    duration: 2,
                                });
                                form1.resetFields();
                                signInWithEmailAndPassword(auth, email, value.password);
                                setVisibleLoginModal(false);
                            })
                            .catch((err) => {
                                setLoading(false);
                                setResetPassword(false);
                                message.error({
                                    content: 'Cập nhật thất bại!',
                                    key: 'resetPwdErr',
                                    duration: 3,
                                });
                            });
                    })
                    .catch(() => {
                        setLoading(false);
                        setResetPassword(false);
                        form.resetFields();
                        message.error({
                            content: 'Đã xảy ra lỗi!',
                            key: 'resetPwdErr',
                            duration: 3,
                        });
                    });
            }
        } else {
            setValidateAccount({ hasFeedback: true, validateStatus: 'validating' });
            const account = listUser.find((user) => user.email === value.account);
            if (account) {
                setValidateAccount({});
                axios
                    .post(process.env.REACT_APP_API_URL + '/api/admin/users', {
                        action: 'resetPassword',
                        data: account.email,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                            setResetPassword(true);
                            setLoading(false);
                            message.info({
                                content: 'Vui lòng check mail.',
                                key: 'resetPwd',
                                duration: 2,
                            });
                        }
                    })
                    .catch(() => {
                        setLoading(false);
                        message.error({
                            content: 'Đã xảy ra lỗi!',
                            key: 'resetPwdErr',
                            duration: 3,
                        });
                    });
            } else {
                setLoading(false);
                setValidateAccount({
                    hasFeedback: true,
                    validateStatus: 'error',
                    help: 'Không tìm thấy tài khoản của bạn!',
                });
            }
        }
    };

    const handleBackPage = () => {
        if (resetPassword) {
            setResetPassword(false);
        } else {
            setTitle('Đăng nhập');
            form1.resetFields();
            setForgotPassword(false);
        }
    };

    return forgotPassword ? (
        <Form form={form1} layout="vertical" onFinish={handleResetPassword}>
            {resetPassword ? (
                <>
                    <Form.Item
                        {...validateVerifiCode}
                        label="Mã xác thực"
                        name="oobCode"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mã xác thực',
                            },
                        ]}
                    >
                        <Input placeholder="Nhập mã xác thực..." onChange={() => setValidateVerifiCode({})} />
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
                </>
            ) : (
                <Form.Item
                    label="Tìm tài khoản"
                    {...validateAccount}
                    name="account"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin!' }]}
                >
                    <Input type="email" placeholder="Nhập tài khoản..." onChange={() => setValidateAccount({})} />
                </Form.Item>
            )}

            <Button loading={loading} type="primary" htmlType="submit">
                {resetPassword ? 'Cập nhật' : 'Tìm'}
            </Button>
            <Button type="text" onClick={handleBackPage}>
                Trở lại
            </Button>
        </Form>
    ) : (
        <Form
            form={form}
            name="normal_login"
            layout="vertical"
            className="login-form"
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
        >
            <Form.Item
                label="Tên đăng nhập*"
                name="username"
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
                    placeholder="VD: NguyenVanA@gmail.com"
                />
            </Form.Item>
            <Form.Item
                label="Mật khẩu*"
                name="password"
                {...validate}
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng nhập mật khẩu!',
                    },
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Tối thiểu 6 kí tự bao gồm 1 chữ viết hoa"
                    onChange={() => setValidate({})}
                />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" className={`${cx('btn_submit')} login-form-button`} loading={loading}>
                    Đăng nhập
                </Button>
                Or
                <Button
                    type="dashed"
                    onClick={() => {
                        setTitle('Đăng ký');
                        setRegister(true);
                    }}
                >
                    Đăng ký ngay
                </Button>
            </Form.Item>
            <Link
                className="login-form-forgot"
                to="#"
                onClick={(e) => {
                    e.preventDefault();
                    setForgotPassword(true);
                    setTitle('Quên mật khẩu');
                }}
            >
                Quên mật khẩu!
            </Link>
        </Form>
    );
}
