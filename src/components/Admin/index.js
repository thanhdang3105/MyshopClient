import Login from './Login';
import ListUsers from './ListUsers';
import React from 'react';
import './Admin.scss';
import {
    ShopOutlined,
    TeamOutlined,
    UploadOutlined,
    InboxOutlined,
    MenuOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import CreateProducts from './CreateProducts';
import { useNavigate } from 'react-router-dom';
import ListProducts from './ListProducts';
import ListOders from './ListOders';
import axios from 'axios';
import { auth } from '../../firebase/config';
const { Content, Footer, Sider } = Layout;
const items = [
    {
        label: 'Danh sách tài khoản',
        icon: <TeamOutlined />,
    },
    {
        label: 'Đăng sản phẩm',
        icon: <UploadOutlined />,
    },
    {
        label: 'Quản lý đơn hàng',
        icon: <InboxOutlined />,
    },
    {
        label: 'Quản lý cửa hàng',
        icon: <ShopOutlined />,
    },
    {
        label: (
            <Button type="primary" danger>
                Đăng xuất
            </Button>
        ),
        icon: <LogoutOutlined />,
    },
].map((item, index) => ({
    key: String(index + 1),
    icon: item.icon,
    label: item.label,
}));

export default function Admin() {
    const [login, setLogin] = React.useState(false);
    const [selectedKey, setSelectedKey] = React.useState('1');
    const [odersList, setOdersList] = React.useState([]);
    const [content, setContent] = React.useState();
    const [collapsed, setCollapsed] = React.useState(false);

    const navigate = useNavigate();
    const siderRef = React.useRef();

    React.useEffect(() => {
        axios
            .post(process.env.REACT_APP_API_URL + '/api/OdersList', { action: 'getAll' })
            .then((result) => setOdersList(result.data));
    }, []);

    React.useEffect(() => {
        if (window.innerWidth < 992 && window.innerWidth >= 600) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
        switch (selectedKey) {
            case '1':
                siderRef.current?.classList.remove('sider_show');
                return setContent(<ListUsers />);
            case '2':
                siderRef.current?.classList.remove('sider_show');
                return setContent(<CreateProducts />);
            case '3':
                siderRef.current?.classList.remove('sider_show');
                return setContent(<ListOders data={{ odersList, setOdersList }} />);
            case '4':
                siderRef.current?.classList.remove('sider_show');
                return setContent(<ListProducts />);
            case '5':
                auth.signOut();
                break;
            default:
                throw new Error('Invalid items: ' + selectedKey);
        }
    }, [selectedKey, odersList]);

    const handleToggleMenuMobile = () => {
        siderRef.current.classList.toggle('sider_show');
    };

    return !login ? (
        <Login setLogin={setLogin} />
    ) : (
        <Layout hasSider>
            <Sider ref={siderRef} className="sider" collapsible collapsed={collapsed} trigger={null}>
                <a
                    onClick={() => {
                        auth.signOut();
                        navigate('/');
                    }}
                    className="logo"
                >
                    <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="logo" />
                </a>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[selectedKey]}
                    onClick={(e) => setSelectedKey(e.key)}
                    items={items}
                />
            </Sider>
            <Button className="toggleMenuMobile" icon={<MenuOutlined />} onClick={handleToggleMenuMobile} />
            <Layout className="site-layout" style={collapsed ? { marginLeft: '80px' } : {}}>
                <Content className="wrapper">{content}</Content>
                <Footer style={{ textAlign: 'center' }}>©2022 Created by Thanh Đặng</Footer>
            </Layout>
        </Layout>
    );
}
