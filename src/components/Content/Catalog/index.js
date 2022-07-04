import { Breadcrumb, Card, Empty, Layout, Pagination, Select, Spin } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { catalogSelector, productsSearch, productsSelector } from '../../../redux/selector';
import styles from './Catalog.module.scss';
import classNames from 'classnames/bind';
import CatalogSider from './CatalogSider';
import Meta from 'antd/lib/card/Meta';
import { Account } from '../../Provider/AccountProvider';

const { Option } = Select;

const cx = classNames.bind(styles);

export default function Catalog() {
    const [loading, setLoading] = React.useState(<Spin style={{ width: '100%' }} size="large" />);
    const [data, setData] = React.useState({});
    const [pagination, setPagination] = React.useState({ total: 20, current: 1, pageView: 20 });
    const [selectSort, setSelectSort] = React.useState('new');
    const { catalog, category } = useParams();
    const [searchParams] = useSearchParams();
    const { handleErrorImg } = React.useContext(Account);
    const navigate = useNavigate();

    const products = useSelector(productsSelector);
    const searchProducts = useSelector(productsSearch);
    const catalogs = useSelector(catalogSelector);

    React.useLayoutEffect(() => {
        let productsFilter = products.filter((product) => {
            const arr = product.catalog
                .toLowerCase()
                .split(',')
                .map((cata) => cata.split(' ').join('-'));
            return arr.includes(catalog.toLowerCase());
        });
        let catalogsFilter = catalogs.find(
            (cata) => cata.name.split(' ').join('-').toLowerCase() === catalog.toLowerCase(),
        );
        if (catalog === 'all') {
            productsFilter = products;
            catalogsFilter = catalogs;
        }
        if (catalog === 'search') {
            !searchProducts.length && navigate('/danh-muc/all');
            productsFilter = searchProducts;
            catalogsFilter = catalogs;
        }
        if (category) {
            productsFilter = productsFilter?.filter(
                (product) => product.category.split(' ').join('-').toLowerCase() === category.toLowerCase(),
            );
        }
        if (searchParams.keys().next().value) {
            const key = searchParams.keys().next().value;
            productsFilter = productsFilter?.filter((product) =>
                product[key]?.split(' ').join('-').toLowerCase().includes(searchParams.get(key)),
            );
        }
        !productsFilter.length &&
            setLoading(
                <img src={`${process.env.PUBLIC_URL}/img/empty.svg`} style={{ width: '100%' }} alt="emptyImg" />,
            );
        setPagination((prev) => ({ ...prev, total: productsFilter.length }));
        const initDataSort = productsFilter.slice(0, 20);
        setData({ initData: productsFilter, productsFilter: initDataSort, catalogsFilter });
        setSelectSort('new');
    }, [products, catalog, catalogs, category, searchParams, searchProducts, navigate]);

    const handleSetPages = (page) => {
        window.scrollTo(0, 0);
        setPagination((prev) => ({ ...prev, current: page }));
        setData((prev) => {
            const data = prev.initData.slice(
                (page - 1) * pagination.pageView,
                (page - 1) * pagination.pageView + pagination.pageView,
            );
            return { ...prev, productsFilter: data };
        });
    };

    const previewImg = (e, src) => {
        const parent = e.target.offsetParent;
        const img = parent.querySelector(`.img`);
        if (src) {
            return (img.src = src);
        }
        img.src = e.target.src;
    };

    const handleChangeFilterSelect = (value) => {
        const initData = [...data.initData];
        let initDataSort;
        setPagination((prev) => ({ ...prev, current: 1 }));
        switch (value) {
            case 'new':
                setSelectSort('new');
                initDataSort = initData.sort((a, b) => {
                    const item1 = new Date(a.createdAt).getTime();
                    const item2 = new Date(b.createdAt).getTime();
                    return item2 - item1;
                });
                break;
            case 'hot':
                setSelectSort('hot');
                initDataSort = initData.sort((a, b) => b.sell - a.sell);
                break;
            case 'asc':
                setSelectSort('asc');
                initDataSort = initData.sort((a, b) => a.price - b.price);
                break;
            case 'desc':
                setSelectSort('desc');
                initDataSort = initData.sort((a, b) => b.price - a.price);
                break;
            default:
                throw new Error(`Invalid value: ${value}`);
        }
        const dataSort = initDataSort.slice(0, 20);
        setData((prev) => ({ ...prev, initData: initDataSort, productsFilter: dataSort }));
    };

    return !products.length ? (
        <Empty />
    ) : (
        <Layout.Content className={cx('wrapper')}>
            <div className={cx('wrapper_controlTop')}>
                <Breadcrumb
                    style={{
                        margin: '16px 0',
                    }}
                >
                    <Breadcrumb.Item>
                        <Link to="/">Trang chủ</Link>
                    </Breadcrumb.Item>
                    {category && data?.catalogsFilter?.path ? (
                        <>
                            <Breadcrumb.Item>
                                <Link to={data?.catalogsFilter?.path} style={{ textTransform: 'capitalize' }}>
                                    {catalog}
                                </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item style={{ textTransform: 'capitalize' }}>{category}</Breadcrumb.Item>
                        </>
                    ) : (
                        <Breadcrumb.Item style={{ textTransform: 'capitalize' }}>
                            {catalog === 'all' ? 'Tất cả sản phẩm' : catalog}
                        </Breadcrumb.Item>
                    )}
                </Breadcrumb>
                <div className={cx('wrapper_controlTop-filter')}>
                    <div className={cx('controlTop_countItem')}>
                        {pagination.current * pagination.pageView >= pagination.total
                            ? pagination.total
                            : pagination.current * pagination.pageView}
                        /<span className={cx('controlTop_countItem-text')}>{pagination.total}</span> Sản phẩm
                    </div>
                    <Select
                        value={selectSort}
                        placeholder="Lọc"
                        className={cx('controlTop_select')}
                        onChange={handleChangeFilterSelect}
                    >
                        <Option value="new">Mới nhất</Option>
                        <Option value="hot">Bán chạy nhất</Option>
                        <Option value="asc">Giá tăng dần</Option>
                        <Option value="desc">Giá giảm dần</Option>
                    </Select>
                </div>
            </div>
            <Layout
                className="site-layout-background"
                style={{
                    padding: '24px 0',
                    backgroundColor: 'white',
                }}
            >
                <CatalogSider data={data.catalogsFilter} />
                {!data?.productsFilter?.length ? (
                    loading
                ) : (
                    <Layout.Content className={cx('wrapper_contentCatalog')}>
                        {data?.productsFilter.map((product) => {
                            const listImage = product.listImage.slice(0, 4);
                            return (
                                <div key={product._id} className={cx('card_box')}>
                                    <Card
                                        hoverable
                                        className={cx('card_box-item')}
                                        bordered={false}
                                        bodyStyle={
                                            window.innerWidth < 480
                                                ? { padding: '0', minHeight: '120px', flex: '0' }
                                                : { padding: '12px 24px 12px', minHeight: '160px', flex: '0' }
                                        }
                                        cover={
                                            <Link to={`/san-pham/${product.slug}`} className={cx('img_content')}>
                                                <img
                                                    alt="products1"
                                                    // không css vào classname này của thẻ này
                                                    className={cx('img')}
                                                    src={product.listImage[0].url}
                                                    loading="lazy"
                                                    onError={handleErrorImg}
                                                />
                                            </Link>
                                        }
                                    >
                                        <Meta
                                            className={cx('card_meta')}
                                            title={
                                                <div className={cx('div_title')}>
                                                    <span>{product.collections}</span>
                                                    <Link to={`/san-pham/${product.slug}`}>{product.name}</Link>
                                                </div>
                                            }
                                            description={
                                                <p className={cx('products_price')}>
                                                    {product.price.toLocaleString('en-gb')}đ
                                                </p>
                                            }
                                        />
                                        <ul className={cx('list_preview')}>
                                            {listImage?.map((img, index) => {
                                                return (
                                                    <li className={cx('item_preview')} key={product._id + '-' + index}>
                                                        <img
                                                            className={cx('img_preview')}
                                                            alt={`preview ${product._id}-` + index}
                                                            src={img.url}
                                                            onMouseOut={(e) => previewImg(e, product.listImage[0].url)}
                                                            onMouseEnter={previewImg}
                                                            onError={handleErrorImg}
                                                            loading="lazy"
                                                        />
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </Card>
                                </div>
                            );
                        })}
                    </Layout.Content>
                )}
            </Layout>
            {/* <Pagination size="small" total={pagination.total} /> */}
            <Pagination
                pageSize={20}
                style={{ float: 'right', paddingBottom: '20px' }}
                simple
                current={pagination.current}
                total={pagination.total}
                onChange={handleSetPages}
            />
        </Layout.Content>
    );
}
