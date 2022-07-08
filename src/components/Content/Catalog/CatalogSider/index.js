import { Layout, Menu } from 'antd';
import React from 'react';
import styles from './CatalogSider.module.scss';
import classNames from 'classnames/bind';
import { Link, useParams, useSearchParams } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function CatalogSider({ data }) {
    const { catalog, category } = useParams();
    const [searchParams] = useSearchParams();
    const [keyMenu, setKeyMenu] = React.useState('');
    const [menu, setMenu] = React.useState([]);

    React.useEffect(() => {
        if (data && data.length) {
            setMenu(
                data?.map((cata, Index) => ({
                    key: cata.name.toLowerCase().split(' ').join('-'),
                    type: 'group',
                    label: (
                        <Link className="text text_bold" to={cata.path}>
                            {cata.name}
                        </Link>
                    ),
                    children: cata?.category?.map((cate, index) => {
                        return {
                            key:
                                cata.name.toLowerCase().split(' ').join('-') +
                                '/' +
                                cate.name.toLowerCase().split(' ').join('-'),
                            label: <Link to={cata.path + cate.path}>{cate.name}</Link>,
                        };
                    }),
                })),
            );
        } else if (data && !data.length && data.category) {
            setMenu(
                data?.category?.map((cate, Index) => ({
                    key: cate.name.toLowerCase().split(' ').join('-'),
                    type: 'group',
                    label: (
                        <Link className="text text_bold" to={data.path + cate.path}>
                            {cate.name}
                        </Link>
                    ),
                    children: cate.children.map((collection, index) => {
                        return {
                            key:
                                cate.name.toLowerCase().split(' ').join('-') +
                                collection.name.toLowerCase().split(' ').join('-'),
                            label: <Link to={data.path + cate.path + collection.path}>{collection.name}</Link>,
                        };
                    }),
                })),
            );
        } else if (data && !data.length && !data.category) {
            const path = '/danh-muc/' + catalog + data.path;
            setMenu([
                {
                    key: data?.name.toLowerCase().split(' ').join('-'),
                    type: 'group',
                    label: (
                        <Link className="text text_bold" to={path}>
                            {data?.name}
                        </Link>
                    ),
                    children: data?.children.map((collection, index) => {
                        return {
                            key: collection.name.toLowerCase().split(' ').join('-'),
                            label: <Link to={path + collection.path}>{collection.name}</Link>,
                        };
                    }),
                },
            ]);
        }
    }, [data, catalog]);

    React.useEffect(() => {
        if (catalog) {
            setKeyMenu(catalog);
        }
        if (category) {
            setKeyMenu(catalog + '/' + category);
        }
        if (searchParams) {
            setKeyMenu(searchParams.get('collections'));
        }
    }, [catalog, category, searchParams]);

    return (
        <Layout.Sider className={cx('wrapperSider')}>
            <div className={cx('listCategory')}>
                <h1 className={cx('listTitle')}>Danh mục sản phẩm</h1>
                <Menu className={cx('wrapperCategory')} theme="ligth" selectedKeys={keyMenu} items={menu} />
            </div>
        </Layout.Sider>
    );
}
