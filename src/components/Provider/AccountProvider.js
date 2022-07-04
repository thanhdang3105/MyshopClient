import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import React from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../../firebase/config';
import { useFireStore } from '../../hooks/useFireStore';
import cartListSlice from '../../redux/cartListSlice';
import { reloadInitState } from '../../redux/catalogSlice';

export const Account = React.createContext();

export default function AccountProvider({ children }) {
    const [isVisibleLoginModal, setVisibleLoginModal] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState();
    const dispatch = useDispatch();
    const [dataProvinces, setDataProvinces] = React.useState([]);
    const [odersList, setOdersList] = React.useState([]);
    const users = useFireStore('users');
    const [listUser, setListUser] = React.useState([]);

    React.useLayoutEffect(() => {
        const data = users.map((doc, index) => ({
            key: index + 1,
            name: doc.data().name || doc.data().displayName,
            email: doc.data().email,
            address: doc.data().address,
            phoneNumber: doc.data().phoneNumber,
            birthday: doc.data().birthday,
            providerId: doc.data().providerId,
            uid: doc.data().uid,
            id: doc.id,
        }));
        setListUser(data);
    }, [users]);

    React.useLayoutEffect(() => {
        dispatch(reloadInitState());
        fetch('https://provinces.open-api.vn/api/?depth=2')
            .then((response) => response.json())
            .then((data) => {
                const address = data.map((items) => {
                    return {
                        label: items.name,
                        value: items.name,
                        children: items.districts.map((item) => {
                            return {
                                label: item.name,
                                value: item.name,
                            };
                        }),
                    };
                });
                setDataProvinces(address);
            })
            .catch((Error) => console.log(Error));
    }, [dispatch]);

    React.useLayoutEffect(() => {
        if (currentUser) {
            Promise.all([
                axios.get(process.env.REACT_APP_API_URL + `/api/cartList/${currentUser.uid}`),
                axios.post(process.env.REACT_APP_API_URL + `/api/OdersList`, {
                    action: 'getByUserId',
                    userId: currentUser.uid,
                }),
            ])
                .then(([cartListResult, odersResult]) => {
                    cartListResult && dispatch(cartListSlice.actions.setInitCarts(cartListResult.data));
                    odersResult && setOdersList(odersResult.data);
                })
                .catch((err) => console.error(err));
        }
    }, [currentUser?.uid, dispatch]);

    React.useLayoutEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user && user.providerData[0].providerId !== 'phone') {
                const uid = user.uid;
                const userData = listUser.find((user) => user.uid === uid);
                setCurrentUser(userData);
            } else {
                dispatch(cartListSlice.actions.setInitCarts([]));
                setCurrentUser('');
            }
        });
    }, [listUser, dispatch]);

    const handleErrorImg = React.useCallback((e) => {
        e.target.src = process.env.PUBLIC_URL + '/img/empty.svg';
    }, []);

    return (
        <Account.Provider
            value={{
                currentUser,
                dataProvinces,
                isVisibleLoginModal,
                setVisibleLoginModal,
                odersList,
                setOdersList,
                listUser,
                handleErrorImg,
            }}
        >
            {children}
        </Account.Provider>
    );
}
