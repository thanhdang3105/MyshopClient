import React from 'react';
import Login from '../Login';
import { Account } from '../../Provider/AccountProvider';
import { Button, Modal as ComponentModal } from 'antd';
import Register from '../Register';
import { FacebookFilled, GooglePlusOutlined } from '@ant-design/icons';
import { FacebookAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';

const fbProvider = new FacebookAuthProvider();
const ggProvider = new GoogleAuthProvider();

export default function Modal() {
    const { isVisibleLoginModal, setVisibleLoginModal } = React.useContext(Account);
    const [register, setRegister] = React.useState(false);
    const [title, setTitle] = React.useState('Đăng nhập');

    const handleCancel = () => {
        setVisibleLoginModal(false);
        setRegister(false);
    };

    const loginFB = async () => {
        try {
            const { _tokenResponse, user } = await signInWithPopup(auth, fbProvider);
            setVisibleLoginModal(false);
            console.log(user, _tokenResponse);
            if (_tokenResponse?.isNewUser) {
                const data = {
                    displayName: user.displayName,
                    email: user.email,
                    uid: user.uid,
                    phoneNumber: user.phoneNumber,
                    address: '',
                    birthday: '',
                    providerId: _tokenResponse.providerId,
                };
                await addDoc(collection(db, 'users'), data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const loginGG = async () => {
        try {
            const { _tokenResponse, user } = await signInWithPopup(auth, ggProvider);
            setVisibleLoginModal(false);
            if (_tokenResponse?.isNewUser) {
                const data = {
                    displayName: user.displayName,
                    email: user.email,
                    uid: user.uid,
                    phoneNumber: user.phoneNumber,
                    address: '',
                    birthday: '',
                    providerId: _tokenResponse.providerId,
                };
                await addDoc(collection(db, 'users'), data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <ComponentModal
            centered
            title={title}
            visible={isVisibleLoginModal}
            onCancel={handleCancel}
            footer={
                title === 'Đăng nhập' ? (
                    <>
                        <Button
                            style={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold' }}
                            icon={<FacebookFilled />}
                            onClick={loginFB}
                        >
                            Login with Facebook
                        </Button>
                        <Button style={{ fontWeight: 'bold' }} icon={<GooglePlusOutlined />} onClick={loginGG}>
                            Login with Google
                        </Button>
                    </>
                ) : null
            }
        >
            {register ? (
                <Register setRegister={setRegister} setTitle={setTitle} setVisibleLoginModal={setVisibleLoginModal} />
            ) : (
                <Login setRegister={setRegister} setTitle={setTitle} setVisibleLoginModal={setVisibleLoginModal} />
            )}
        </ComponentModal>
    );
}
