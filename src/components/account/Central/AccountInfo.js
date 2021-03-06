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
                    content: 'C???p nh???t th??nh c??ng ???',
                    key: 'updateInfo',
                    duration: 2,
                });
            })
            .catch(() => {
                setIsUpdateInfo(false);
                message.error({
                    content: 'C???p nh???t th???t b???i!',
                    key: 'updateInfoErr',
                    duration: 2,
                });
            });
    };

    const changePassword = (value) => {
        if (value.password !== value.password_check) {
            setValidatePWD({ validateStatus: 'error', help: 'M???t kh???u kh??ng kh???p' });
        } else if (value.password_old === value.password) {
            setValidatePWD_old({ validateStatus: 'error', help: 'M???t kh???u m???i kh??ng ???????c tr??ng v???i m???t kh???u c??!' });
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
                                        content: 'C???p nh???t m???t kh???u th??nh c??ng ???',
                                        key: 'updatePwd',
                                        duration: 3,
                                    });
                                }
                            })
                            .catch(() => {
                                setIsUpdatePwd(false);
                                message.error({
                                    content: 'C???p nh???t m???t kh???u kh??ng th??nh c??ng!',
                                    key: 'updatePwdErr',
                                    duration: 3,
                                });
                            });
                    }
                })
                .catch(() => {
                    setIsUpdatePwd(false);
                    setValidatePWD_old({ validateStatus: 'error', help: 'M???t kh???u kh??ng ????ng!' });
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
                        content: 'Vui l??ng check mail.',
                        key: 'verifyEmail',
                        duration: 3,
                    });
                }
            })
            .catch(() => {
                setLoading(false);
                message.error({
                    content: '???? x???y ra l???i!',
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
                    content: 'X??c th???c th??nh c??ng',
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
                            T??i kho???n c???a b???n ch??a ???????c x??c th???c!
                            <Button
                                loading={loading}
                                type="link"
                                style={{ cursor: 'pointer' }}
                                size="small"
                                onClick={handleEmailVerification}
                            >
                                X??c th???c ngay
                            </Button>
                        </>
                    }
                    type="warning"
                    style={{ margin: '4px 5px 0' }}
                    showIcon
                />
            )}
            <Modal
                title="X??c th???c t??i kho???n"
                visible={isVerifyEmail}
                closable={false}
                footer={
                    <Button type="primary" danger onClick={() => setIsVerifyEmail(false)}>
                        ????ng
                    </Button>
                }
            >
                <Form layout="vertical" onFinish={handleVerify}>
                    <Form.Item
                        name="obbCode"
                        rules={[{ required: true, message: 'Vui l??ng nh???p m?? x??c th???c c???a b???n!' }]}
                    >
                        <Input placeholder="M?? x??c th???c..." />
                    </Form.Item>
                    <Button loading={loading} htmlType="submit" type="primary">
                        X??c th???c
                    </Button>
                </Form>
            </Modal>
            <div className={cx('wrapper')}>
                <Form form={form} layout="vertical" className={cx('wrapper_form-info')} onFinish={handleFinish}>
                    <Form.Item label="T??i kho???n">
                        <Input type="text" disabled value={currentUser?.email} />
                    </Form.Item>
                    <Form.Item
                        label="H??? v?? T??n"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Vui l??ng nh???p h??? v?? t??n!',
                            },
                        ]}
                    >
                        <Input
                            type="text"
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Nh???p h??? v?? t??n"
                        />
                    </Form.Item>
                    <Form.Item label="?????a ch???">
                        <Input.Group>
                            <Form.Item name="address" style={{ marginBottom: '5px' }}>
                                <Input
                                    prefix={<HomeOutlined className="site-form-item-icon" />}
                                    type="text"
                                    placeholder="Nh???p S??? nh??, t??n ???????ng"
                                />
                            </Form.Item>
                            <Form.Item
                                name="address_provinces"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui l??ng ch???n ?????a ch???!',
                                    },
                                ]}
                                style={{ marginBottom: '0' }}
                            >
                                <Cascader
                                    options={dataProvinces}
                                    showSearch={{ filter }}
                                    placeholder="Ch???n qu???n huy???n"
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>
                    <Form.Item>
                        <Form.Item
                            label="S??? ??i???n tho???i"
                            name="phoneNumber"
                            style={{
                                display: 'inline-block',
                                margin: '0',
                            }}
                        >
                            <InputNumber
                                prefix={<PhoneOutlined className="site-form-item-icon" />}
                                controls={false}
                                placeholder="Nh???p s??? ??i???n tho???i"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Ng??y sinh"
                            name="birthday"
                            style={{
                                display: 'inline-block',
                                margin: '0 8px',
                            }}
                        >
                            <Input type="date" placeholder="Nh???p Ng??y sinh" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" loading={isUpdateInfo} htmlType="submit">
                            C???p nh???t
                        </Button>
                    </Form.Item>
                </Form>
                {!currentUser.providerId && (
                    <Form form={form1} onFinish={changePassword}>
                        <h1>?????i m???t kh???u</h1>
                        <Form.Item
                            {...validatePWD_old}
                            label="M???t kh???u c??"
                            name="password_old"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui l??ng nh???p m???t kh???u',
                                },
                            ]}
                        >
                            <Input.Password
                                pattern={`(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}`}
                                title="T???i thi???u 6 k?? t??? bao g???m ??t nh???t 1 ch??? vi???t hoa v?? 1 s???!"
                                placeholder="Nh???p m???t kh???u c??"
                                onChange={() => setValidatePWD_old({})}
                            />
                        </Form.Item>
                        <Form.Item
                            label="M???t kh???u m???i"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui l??ng nh???p m???t kh???u',
                                },
                            ]}
                        >
                            <Input
                                pattern={`(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}`}
                                title="T???i thi???u 6 k?? t??? bao g???m ??t nh???t 1 ch??? vi???t hoa v?? 1 s???!"
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="T???i thi???u 6 k?? t??? bao g???m ??t nh???t 1 ch??? vi???t hoa v?? 1 s???"
                            />
                        </Form.Item>
                        <Form.Item
                            {...validatePWD}
                            label="Nh???p l???i m???t kh???u*"
                            name="password_check"
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui l??ng nh???p m???t kh???u',
                                },
                            ]}
                        >
                            <Input
                                pattern={`(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}`}
                                title="T???i thi???u 6 k?? t??? bao g???m ??t nh???t 1 ch??? vi???t hoa v?? 1 s???!"
                                prefix={<LockFilled className="site-form-item-icon" />}
                                type="password"
                                placeholder="Nh???p l???i m???t kh???u"
                                onChange={() => setValidatePWD({})}
                            />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={isUpdatePwd}>
                            ?????i m???t kh???u
                        </Button>
                    </Form>
                )}
            </div>
        </>
    );
}
