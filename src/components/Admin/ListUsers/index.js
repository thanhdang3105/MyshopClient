import React from 'react';
import axios from 'axios';
import EditUser from './EditUser';
import TableCustum from '../../patials/TableCustom';
import { Account } from '../../Provider/AccountProvider';
import { message } from 'antd';
import { deleteAccount } from '../../../hooks/useFireStore';
import { auth } from '../../../firebase/config';
const columns = [
    {
        title: 'Họ tên',
        dataIndex: 'name',
        key: 'name',
        responsive: ['md'],
    },
    {
        title: 'Ngày sinh',
        dataIndex: 'birthday',
        key: 'birthday',
        responsive: ['lg'],
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        responsive: ['lg'],
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        responsive: ['lg'],
    },
];

export default function ListUsers() {
    const [userEdit, setUserEdit] = React.useState(false);
    const { listUser } = React.useContext(Account);

    const handleUserEdit = (id) => {
        const user = listUser.find((user) => user.id === id);
        const arrAddress = user.address.split(',');
        const address = arrAddress.slice(0, arrAddress.length - 2);
        const address_provinces = arrAddress.slice(arrAddress.length - 2, arrAddress.length);
        axios
            .post('/api/admin/users', { action: 'checkAdmin', method: 'email', data: user.email })
            .then((res) => {
                if (res.status === 200 && !res.data) {
                    setUserEdit({
                        ...user,
                        birthday: user.birthday.split('/').reverse().join('-'),
                        address,
                        address_provinces,
                        admin: true,
                    });
                } else {
                    setUserEdit({
                        ...user,
                        birthday: user.birthday.split('/').reverse().join('-'),
                        address,
                        address_provinces,
                        admin: false,
                    });
                }
            })
            .catch((err) => console.error(err));
    };

    const handleRemoveUser = (id) => {
        const user = listUser.find((user) => user.id === id);
        axios
            .post(process.env.REACT_APP_API_URL + '/api/admin/users', { action: 'deleteUser', uid: user.uid })
            .then((response) => {
                if (response.status === 200) {
                    deleteAccount(id, 'users');
                    message.success({
                        content: 'Đã xoá tài khoản: ' + user.email,
                        key: 'deleteUser',
                        duration: 3,
                    });
                }
            });
    };

    return (
        <>
            {userEdit && <EditUser setUserEdit={setUserEdit} data={userEdit} />}
            {auth.currentUser && (
                <TableCustum
                    data={listUser.filter((user) => user.uid !== auth.currentUser.uid)}
                    columns={columns}
                    event1={{ name1: 'Edit', handleEvent1: handleUserEdit }}
                    event2={{ name2: 'Delete', handleEvent2: handleRemoveUser }}
                />
            )}
        </>
    );
}
