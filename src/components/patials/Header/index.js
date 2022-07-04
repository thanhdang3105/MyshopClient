import React from 'react';
import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import { Menu, Button, Layout, Badge, Dropdown } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FacebookFilled,
    GithubOutlined,
    ShoppingCartOutlined,
    DownOutlined,
    MenuOutlined,
    CloseOutlined,
    UpOutlined,
} from '@ant-design/icons';
import Itemnav from '../../tippy/Itemnav';
import Search from 'antd/lib/input/Search';

import { Account } from '../../Provider/AccountProvider';
import CartList from '../../tippy/Cartlist';
import { useDispatch, useSelector } from 'react-redux';
import { catalogSelector, productsSearch } from '../../../redux/selector';
import { auth } from '../../../firebase/config';
import { signOut } from 'firebase/auth';
import productsSlice from '../../../redux/productsSlice';
import SearchComponent from '../../tippy/SearchComponent';

const cx = classNames.bind(styles);

export default function Header() {
    const [searchValue, setSearchValue] = React.useState('');
    const [isVisibleSearchValue, setIsVisibleSearchValue] = React.useState({});
    const [isLoadingSearch, setIsLoadingSearch] = React.useState(false);
    const [showMenuMoblie, setShowMenuMoblie] = React.useState(false);
    const [countItemCart, setCountItemCart] = React.useState(0);
    const [keyMenu, setKeyMenu] = React.useState('');
    const dispatch = useDispatch();

    const catalogs = useSelector(catalogSelector);
    const searchProducts = useSelector(productsSearch);

    const { currentUser, setVisibleLoginModal } = React.useContext(Account);

    const navigate = useNavigate();
    const location = useLocation();
    const headerRef = React.useRef();
    const timerRef = React.useRef();
    const searchRef = React.useRef();

    React.useEffect(() => {
        document.onscroll = (e) => {
            const header = headerRef.current;
            const wrapperScroll = e.target.scrollingElement.scrollTop;
            if (wrapperScroll > header.offsetTop + header.offsetHeight) {
                header.classList.add(cx('fixed_top'));
            } else {
                header.classList.remove(cx('fixed_top'));
            }
        };
    }, []);

    React.useLayoutEffect(() => {
        setSearchValue('');
        searchRef.current.blur();
        setKeyMenu('');
        setShowMenuMoblie(false);
        document.getElementById('root').classList.remove('noScroll');
        document.getElementById('root').style.height = 'unset';
        if (location.pathname.includes('danh-muc') || location.pathname.includes('san-pham')) {
            setKeyMenu('san-pham');
        }
        location.pathname.includes('BST') && setKeyMenu('BST');
        location.pathname.includes('lien-he') && setKeyMenu('lien-he');
    }, [location]);

    React.useEffect(() => {
        !searchValue && setIsVisibleSearchValue({ visible: false });
    }, [searchValue]);

    React.useLayoutEffect(() => {
        setIsLoadingSearch(false);
    }, [searchProducts]);

    const handleChangeSearch = (e) => {
        setIsLoadingSearch(true);
        setIsVisibleSearchValue({ visible: true });
        if (e.target.value) {
            timerRef.current = setTimeout(() => {
                setIsVisibleSearchValue({});
                dispatch(productsSlice.actions.setSearchProduct(e.target.value));
                setIsLoadingSearch(false);
            }, 1000);
        } else {
            dispatch(productsSlice.actions.setSearchProduct(e.target.value));
        }
        setSearchValue(e.target.value);
    };

    const handleSearch = (value) => {
        if (value) {
            clearInterval(timerRef.current);
            dispatch(productsSlice.actions.setSearchProduct(value));
            navigate('/danh-muc/search', { replace: true });
            setSearchValue('');
            searchRef.current.blur();
        }
    };

    const handleEnterSearch = (e) => {
        if (e.target.value) {
            dispatch(productsSlice.actions.setSearchProduct(e.target.value));
            navigate('/danh-muc/search', { replace: true });
            setSearchValue('');
            searchRef.current.blur();
        }
    };

    const handleVisibleLoginModal = () => {
        setVisibleLoginModal(true);
    };

    const handleLogout = () => {
        signOut(auth);
    };

    const menuAccountItems = [
        {
            key: '1',
            label: <Link to="/account/info">Thông tin tài khoản</Link>,
        },
        {
            key: '2',
            label: <Link to="/account/orders">Đơn hàng</Link>,
        },
        {
            key: '3',
            label: (
                <Button style={{ width: '100%' }} type="primary" danger onClick={handleLogout}>
                    Đăng xuất
                </Button>
            ),
        },
    ];

    const menuNav = [
        {
            key: 'san-pham',
            label: (
                <Dropdown overlay={<Itemnav data={catalogs} />}>
                    <Link className={`text text_bold ${cx('Link_header')}`} to="/danh-muc/all">
                        Sản phẩm <DownOutlined />
                    </Link>
                </Dropdown>
            ),
        },
        {
            key: 'BST',
            label: (
                <Link className="text text_bold" to="/BST">
                    Bộ Sưu tập
                </Link>
            ),
        },
        {
            key: 'lien-he',
            label: (
                <Link className="text text_bold" to="/lien-he">
                    Liên hệ
                </Link>
            ),
        },
    ];
    const menuNavMobile = [
        {
            key: 'san-pham',
            label: (
                <Link className={`text text_bold ${cx('Link_header')}`} to="/danh-muc/all">
                    Sản phẩm
                </Link>
            ),
            children: catalogs?.map((catalog) => {
                let value = {};
                if (catalog.category.length) {
                    value = {
                        key: 'header-' + catalog._id,
                        label: (
                            <Link className={`text text_bold ${cx('menu_item', 'Link_header')}`} to={catalog.path}>
                                {catalog.name}
                            </Link>
                        ),
                        children: catalog.category.map((category) => ({
                            key: catalog._id + category._id,
                            label: (
                                <Link
                                    className={`text text_bold ${cx('Link_header')}`}
                                    to={catalog.path + category.path}
                                >
                                    {category.name}
                                </Link>
                            ),
                            children: category.children.map((collection) => ({
                                key: catalog._id + '/' + category._id + '/' + collection.name,
                                label: (
                                    <Link
                                        to={catalog.path + category.path + collection.path}
                                        className={cx('Link_header')}
                                    >
                                        {collection.name}
                                    </Link>
                                ),
                            })),
                        })),
                    };
                } else {
                    value = {
                        key: 'header-' + catalog._id,
                        label: (
                            <Link className={`text text_bold ${cx('menu_item', 'Link_header')}`} to={catalog.path}>
                                {catalog.name}
                            </Link>
                        ),
                    };
                }
                return value;
            }),
        },
        {
            key: 'BST',
            label: (
                <Link className="text text_bold" to="/BST">
                    Bộ Sưu tập
                </Link>
            ),
        },
        {
            key: 'lien-he',
            label: (
                <Link className="text text_bold" to="/lien-he">
                    Liên hệ
                </Link>
            ),
        },
    ];

    return (
        <>
            <Layout.Header id="top" className={cx('App_topbar')}>
                <div className={cx('topbar_links')}>
                    <Button type="text" className={cx('topbar_btn')} icon={<FacebookFilled />}>
                        <a href="https://www.facebook.com/danghuuthanh20" target="_blank" rel="noopener noreferrer">
                            FaceBook
                        </a>
                    </Button>
                    <Button type="text" className={cx('topbar_btn')} icon={<GithubOutlined />}>
                        <a href="https://github.com/thanhdang3105" target="_blank" rel="noopener noreferrer">
                            GitHub
                        </a>
                    </Button>
                </div>
                <div className={cx('topbar_central')}>
                    {currentUser ? (
                        <Dropdown overlay={<Menu theme="light" items={menuAccountItems} />}>
                            <Button type="text" className={cx('topbar_btn')}>
                                {currentUser.name || 'Tài khoản'}
                            </Button>
                        </Dropdown>
                    ) : (
                        <Button className={cx('topbar_btn')} type="text" onClick={handleVisibleLoginModal}>
                            Đăng nhập
                        </Button>
                    )}

                    <Button className={cx('topbar_btn')} type="text">
                        <Link to="/tro-giup">Trợ giúp</Link>
                    </Button>
                </div>
            </Layout.Header>
            <div className={cx('header_mobile', `${showMenuMoblie ? 'show_menu' : ''}`)}>
                <Button
                    type="text"
                    style={{ float: 'right' }}
                    icon={<CloseOutlined />}
                    onClick={() => {
                        setShowMenuMoblie(!showMenuMoblie);
                        document.getElementById('root').classList.remove('noScroll');
                        document.getElementById('root').style.height = 'unset';
                    }}
                />
                <Menu
                    className={cx('header_menu')}
                    selectedKeys={keyMenu}
                    mode="inline"
                    onClick={() => setShowMenuMoblie(!showMenuMoblie)}
                    items={menuNavMobile}
                />
                <SearchComponent data={searchProducts} search={searchValue} visible={isVisibleSearchValue}>
                    <Search
                        ref={searchRef}
                        placeholder="Search..."
                        allowClear
                        loading={isLoadingSearch}
                        value={searchValue}
                        onChange={handleChangeSearch}
                        onSearch={handleSearch}
                        onKeyDown={() => clearInterval(timerRef.current)}
                        onPressEnter={handleEnterSearch}
                    />
                </SearchComponent>
            </div>
            <Layout.Header className={cx('App_header')}>
                <div ref={headerRef} className={cx('header_main')}>
                    <Button
                        icon={<UpOutlined />}
                        className={cx('btn-scrollTop')}
                        onClick={() => {
                            document.getElementById('top').scrollIntoView(true);
                        }}
                    />

                    <div className={cx('button_toggleMenuMobile')}>
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => {
                                setShowMenuMoblie(!showMenuMoblie);
                                document.getElementById('root').classList.add('noScroll');
                                document.getElementById('root').style.height = '80vh';
                            }}
                        />
                    </div>
                    <div className={cx('header_main-logo')}>
                        <Link to="/">
                            <img
                                className={cx('logo')}
                                src={`${process.env.PUBLIC_URL}/img/logo.png`}
                                alt="logo_header"
                            />
                        </Link>
                    </div>
                    <Menu className={cx('header_menu')} selectedKeys={keyMenu} mode="horizontal" items={menuNav} />
                    <div className={cx('header_search')}>
                        <SearchComponent
                            className={cx('header_searchBox')}
                            data={searchProducts}
                            search={searchValue}
                            visible={isVisibleSearchValue}
                        >
                            <Search
                                ref={searchRef}
                                placeholder="Search..."
                                allowClear
                                loading={isLoadingSearch}
                                value={searchValue}
                                onChange={handleChangeSearch}
                                onSearch={handleSearch}
                                onKeyDown={() => clearInterval(timerRef.current)}
                                onPressEnter={handleEnterSearch}
                            />
                        </SearchComponent>
                        <CartList setCountItemCart={setCountItemCart}>
                            <Button
                                type="text"
                                icon={
                                    <Badge count={countItemCart} size="small" showZero title="">
                                        <ShoppingCartOutlined style={{ fontSize: '25px', lineHeight: '25px' }} />
                                    </Badge>
                                }
                            />
                        </CartList>
                    </div>
                </div>
            </Layout.Header>
        </>
    );
}
