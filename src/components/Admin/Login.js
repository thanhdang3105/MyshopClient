import { PhoneFilled, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, message, Modal } from 'antd';
import {
    signInWithPhoneNumber,
    RecaptchaVerifier,
    PhoneAuthProvider,
    signInWithCredential,
    applyActionCode,
    signInWithCustomToken,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { auth } from '../../firebase/config';
import axios from 'axios';

export default function Login({ setLogin }) {
    const [verify, setVerify] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [validate, setValidate] = React.useState({});
    const [validateAccount, setValidateAccount] = React.useState({});
    const [accountCheck, setAccountCheck] = React.useState(false);
    const navigate = useNavigate();

    const handleCancel = () => {
        if (accountCheck) {
            setVerify(false);
            setAccountCheck(false);
            setLoading(false);
            setValidateAccount(false);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
        } else {
            navigate('/');
        }
    };

    const enterCode = async (value) => {
        setLoading(true);
        switch (accountCheck) {
            case 'phone':
                const credential = PhoneAuthProvider.credential(window.confirmationResult, value.code);
                signInWithCredential(auth, credential)
                    .then((result) => {
                        setLoading(false);
                        if (result.user) {
                            setLogin(true);
                            setAccountCheck(false);
                            message.success({
                                content: 'Xác thực thành công ❤',
                                key: 'verifyPhoneAdmin',
                                duration: 3,
                            });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        error.code === 'auth/invalid-verification-code'
                            ? setValidate({ validateStatus: 'error', help: 'Mã xác thực không đúng!' })
                            : console.log(error);
                    });
                break;
            case 'email':
                applyActionCode(auth, value.code)
                    .then(() => {
                        signInWithCustomToken(auth, window.token)
                            .then((user) => {
                                setLoading(false);
                                setLogin(true);
                                setAccountCheck(false);
                                message.success({
                                    content: 'Xác thực thành công ❤',
                                    key: 'verifyMailAdmin',
                                    duration: 3,
                                });
                            })
                            .catch(() => {
                                message.error({
                                    content: 'Đăng nhập thất bại!',
                                    key: 'verifyMailAdmin',
                                    duration: 3,
                                });
                            });
                    })
                    .catch(() => {
                        setLoading(false);
                        message.error({
                            content: 'Xác thực thất bại vui lòng kiểm tra lại mã!',
                            key: 'verifyMailAdmin',
                            duration: 3,
                        });
                    });

                break;
            default:
                throw new Error('Invalid action: ' + accountCheck);
        }
    };

    const handleLoginAdmin = async (value) => {
        setLoading(true);
        auth.languageCode = 'vi';
        switch (accountCheck) {
            case 'phone':
                const data = value.standard + value.account;
                window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
                axios
                    .post(process.env.REACT_APP_API_URL + '/api/admin/users', {
                        action: 'checkAdmin',
                        method: accountCheck,
                        data,
                    })
                    .then((res) => {
                        if (res.status === 200 && !res.data) {
                            signInWithPhoneNumber(auth, data, window.recaptchaVerifier)
                                .then((confirmationResult) => {
                                    // SMS sent. Prompt user to type the code from the message, then sign the
                                    // user in with confirmationResult.confirm(code)
                                    setLoading(false);
                                    setVerify(true);
                                    window.confirmationResult = confirmationResult.verificationId;
                                })
                                .catch((error) => {
                                    setLoading(false);
                                    console.log(error);
                                });
                        } else {
                            setLoading(false);
                            setValidateAccount({ validateStatus: 'error', help: res.data.message });
                        }
                    })
                    .catch((err) => {
                        setLoading(false);
                        if (err.response.data === 'auth/user-not-found') {
                            setValidateAccount({ validateStatus: 'error', help: 'Tài khoản không tồn tại!' });
                        } else {
                            message.error({
                                content: 'Đã xảy ra lỗi!',
                                key: 'checkMailAdminerr',
                                duration: 3,
                            });
                        }
                    });
                break;
            case 'email':
                axios
                    .post(process.env.REACT_APP_API_URL + '/api/admin/users', {
                        action: 'checkAdmin',
                        method: accountCheck,
                        status: 'login',
                        data: value.account,
                    })
                    .then((response) => {
                        setLoading(false);
                        if (response.status === 200 && !response.data?.message) {
                            setVerify(true);
                            window.token = response.data;
                            message.info({
                                content: 'Vui lòng check mail!',
                                key: 'checkMailAdmin',
                                duration: 5,
                            });
                        } else {
                            setValidateAccount({ validateStatus: 'error', help: response.data.message });
                        }
                    })
                    .catch((err) => {
                        setLoading(false);
                        if (err.response.data === 'auth/user-not-found') {
                            setValidateAccount({ validateStatus: 'error', help: 'Tài khoản không tồn tại!' });
                        } else {
                            message.error({
                                content: 'Đã xảy ra lỗi!',
                                key: 'checkMailAdminerr',
                                duration: 3,
                            });
                        }
                    });
                break;
            default:
                break;
        }
    };

    return (
        <Modal
            visible
            centered
            title="Xác thực tư cách Admin"
            footer={
                <Button key="back" type="primary" onClick={handleCancel}>
                    Trở lại
                </Button>
            }
            onCancel={handleCancel}
        >
            {verify ? (
                <Form onFinish={enterCode}>
                    <Form.Item
                        {...validate}
                        label="Nhập mã xác nhận"
                        name="code"
                        labelAlign="left"
                        style={{ flexDirection: 'column' }}
                        rules={[
                            {
                                required: true,
                                message: 'vui lòng nhập mã!',
                            },
                        ]}
                    >
                        <Input
                            pattern={accountCheck === 'phone' ? '[0-9]{6}' : undefined}
                            title="Vui lòng nhập đủ 6 số!"
                            autoComplete="false"
                            placeholder="Nhập mã xác thực"
                            onChange={() => setValidate({})}
                        />
                    </Form.Item>
                    <Button loading={loading} htmlType="submit" key="submit" type="primary">
                        Xác nhận
                    </Button>
                </Form>
            ) : (
                <>
                    <div id="recaptcha-container"></div>
                    {accountCheck ? (
                        <Form onFinish={handleLoginAdmin}>
                            <Input.Group compact style={{ width: '100%' }}>
                                {accountCheck === 'phone' && (
                                    <Form.Item
                                        style={{ width: '20%' }}
                                        name="standard"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập mã vùng',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="+84" pattern="\+[0-9]{2}" title="VD: +84" />
                                    </Form.Item>
                                )}

                                <Form.Item
                                    {...validateAccount}
                                    name="account"
                                    style={{ width: '80%' }}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Bạn chưa nhập dữ liệu',
                                        },
                                    ]}
                                >
                                    {accountCheck === 'phone' ? (
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            controls={false}
                                            onChange={() => setValidateAccount({})}
                                            placeholder="Nhập số điện thoại admin"
                                        />
                                    ) : (
                                        <Input
                                            type="email"
                                            style={{ width: '100%' }}
                                            onChange={() => setValidateAccount({})}
                                            placeholder="Nhập tài khoản admin"
                                        />
                                    )}
                                </Form.Item>
                            </Input.Group>
                            <Button loading={loading} htmlType="submit" type="primary">
                                Xác thực
                            </Button>
                        </Form>
                    ) : (
                        <>
                            <Button icon={<PhoneFilled />} onClick={() => setAccountCheck('phone')}>
                                Xác thực qua điện thoại
                            </Button>
                            <Button icon={<MailOutlined />} onClick={() => setAccountCheck('email')}>
                                Xác thực qua Email
                            </Button>
                        </>
                    )}
                </>
            )}
        </Modal>
    );
}
