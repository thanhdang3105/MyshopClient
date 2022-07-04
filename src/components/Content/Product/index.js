import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productsSelector } from '../../../redux/selector';
import { Breadcrumb, Button, Divider, Layout } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import { addCartList } from '../../../redux/cartListSlice';
import { Account } from '../../Provider/AccountProvider';
import ListProducts from '../../tippy/ListProducts';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

import styles from './Product.module.scss';
import classNames from 'classnames/bind';
import Evaluate from './Evaluate';

const cx = classNames.bind(styles);

export default function Product() {
    const { slug } = useParams();
    const products = useSelector(productsSelector);
    const [data, setData] = React.useState({});
    const [productCart, setProductCart] = React.useState({});
    const [btnAttr, setBtnAttr] = React.useState({ up: { disabled: true }, down: { disabled: false } });
    const [swiperRef, setSwiper] = React.useState(null);
    const dispatch = useDispatch();

    const { currentUser, setVisibleLoginModal } = React.useContext(Account);

    React.useLayoutEffect(() => {
        const size = document
            .getElementById('size')
            .querySelector(`button.${cx('active')}`)
            ?.innerText.toLowerCase();
        const color = document.getElementById('color').querySelector(`button.${cx('active')}`)?.innerText;
        const product = products.find((product) => product.slug === slug);
        setProductCart({ ...product, color: color, size: size, user: currentUser?.uid });
        setData(product);
    }, [slug, products, currentUser]);

    const handleSwiperChange = (swiper, action) => {
        if (swiper.slides.length > 4) {
            switch (action) {
                case 'up':
                    swiper.activeIndex -= 1;
                    break;
                case 'down':
                    swiper.activeIndex += 1;
                    break;
                default:
                    break;
            }
            swiper.activeIndex === swiper.slides.length - 1 &&
                setBtnAttr({ up: { disabled: false }, down: { disabled: true } });
            swiper.activeIndex === 0 && setBtnAttr({ up: { disabled: true }, down: { disabled: false } });
            if (swiper.activeIndex !== 0 && swiper.activeIndex < swiper.slides.length - 1) {
                setBtnAttr({ up: { disabled: false }, down: { disabled: false } });
            }
        }
        swiperRef.slideTo(swiper.activeIndex);
        document.querySelector(`div.${cx('thumbs_boxImg')}.${cx('active')}`)?.classList.remove(cx('active'));
        const thumb = document.querySelector(`img[alt=swiper${swiper.activeIndex}]`).parentElement;
        const box = document.querySelector(`div.${cx('thumbs_imgList')}`);
        thumb?.classList.add(cx('active'));
        const { width, height } = thumb?.getBoundingClientRect();
        box.scrollTo(swiper.activeIndex * width, swiper.activeIndex * height);
    };

    const handleSelectColor = (e, color) => {
        document
            .getElementById('color')
            .querySelector(`button.${cx('active')}`)
            ?.classList.remove(cx('active'));
        if (e.target.type === 'button') {
            e.target.classList.add(cx('active'));
            setProductCart((prev) => ({ ...prev, color: color }));
        } else {
            e.target.parentElement.classList.add(cx('active'));
            setProductCart((prev) => ({ ...prev, color: color }));
        }
    };

    const handleSelectSize = (e, size) => {
        document
            .getElementById('size')
            .querySelector(`button.${cx('active')}`)
            ?.classList.remove(cx('active'));
        if (e.target.type === 'button') {
            e.target.classList.add(cx('active'));
            setProductCart((prev) => ({ ...prev, size: size }));
        } else {
            e.target.parentElement.classList.add(cx('active'));
            setProductCart((prev) => ({ ...prev, size: size }));
        }
    };

    const addProductCart = () => {
        if (!currentUser) {
            return setVisibleLoginModal(true);
        }
        if (productCart.color && productCart.size) {
            dispatch(addCartList(productCart));
        } else {
            alert('Vui lòng chọn size và màu của sản phẩm!');
        }
    };

    const WrapperSubtitle = ({ title, children, vertical }) => {
        return (
            <>
                <Divider />
                <div
                    style={vertical ? { flexDirection: 'column' } : { flexWrap: 'wrap' }}
                    className={cx('layout_subtitle-wrapper')}
                >
                    <h1 className={cx('wrapper_heading')}>{title}</h1>
                    <div className={cx('content')}>{children}</div>
                </div>
            </>
        );
    };

    return (
        <Layout.Content className={cx('wrapper')}>
            <div className={cx('wrapper_controlTop')}>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/">Trang chủ</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {data?.catalog?.split(',').map((item, index) => {
                            const check = index === data?.catalog?.split(',').length - 1;
                            return check ? (
                                <Link key={index} to={`/danh-muc/${item.split(' ').join('-').toLowerCase()}`}>
                                    {' '}
                                    {item}
                                </Link>
                            ) : (
                                <Link key={index} to={`/danh-muc/${item.split(' ').join('-').toLowerCase()}`}>
                                    {item} ,
                                </Link>
                            );
                        })}
                    </Breadcrumb.Item>

                    <Breadcrumb.Item>{data?.name}</Breadcrumb.Item>
                </Breadcrumb>
                {/* <div style={{ width: '100px', height: '30px', backgroundColor: 'red' }}></div> */}
            </div>
            <Layout>
                <Layout.Content className={cx('layout_product')}>
                    <div className={cx('wrapper_image')}>
                        <div className={cx('wrapper_image-control')}>
                            <div className={cx('thumbs_imgList')}>
                                {data?.listImage?.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`${cx('thumbs_boxImg')} ${index === 0 ? cx('active') : ''}`}
                                    >
                                        <img
                                            src={img}
                                            alt={'swiper' + index}
                                            onClick={() =>
                                                handleSwiperChange({
                                                    activeIndex: index,
                                                    slides: { length: data?.listImage?.length },
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                            {data?.listImage?.length > 4 && (
                                <>
                                    <Button
                                        className={cx('thumbs_navigation-up')}
                                        icon={<UpOutlined />}
                                        onClick={() => handleSwiperChange(swiperRef, 'up')}
                                        type="text"
                                        {...btnAttr.up}
                                    />
                                    <Button
                                        className={cx('thumbs_navigation-down')}
                                        icon={<DownOutlined />}
                                        onClick={() => handleSwiperChange(swiperRef, 'down')}
                                        type="text"
                                        {...btnAttr.down}
                                    />
                                </>
                            )}
                        </div>
                        <Swiper
                            style={{
                                '--swiper-navigation-color': 'var(--color-text)',
                                '--swiper-pagination-color': 'var(--color-text)',
                            }}
                            spaceBetween={10}
                            navigation={true}
                            modules={[Navigation]}
                            className={cx('swiper_imgHorizontal')}
                            onSwiper={setSwiper}
                            onSlideChange={handleSwiperChange}
                        >
                            {data?.listImage?.map((img, index) => (
                                <SwiperSlide key={index} className={cx('swiper_slide')}>
                                    <img src={img} alt={'swiper' + index} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <div className={cx('wrapper_info')}>
                        <h1 className={cx('info_heading')}>{data?.name}</h1>
                        <p className={cx('info_price')}>{data?.price?.toLocaleString('en-gb')}đ</p>
                        <div className={cx('div_list')}>
                            <h3>Màu sắc:</h3>
                            <ul id="color" className={cx('product_List')}>
                                {data?.color?.split(',').map((color, index) => (
                                    <li key={index} className={cx('product_item')}>
                                        <Button onClick={(e) => handleSelectColor(e, color)}>{color}</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={cx('div_list')}>
                            <h3>Size:</h3>
                            <ul id="size" className={cx('product_List')}>
                                {data?.size?.split(',').map((size, index) => (
                                    <li key={index} className={cx('product_item')}>
                                        <Button onClick={(e) => handleSelectSize(e, size)}>{size.toUpperCase()}</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button type="primary" onClick={addProductCart}>
                            Thêm vào giỏ hàng
                        </Button>
                        <p className={cx('product_description')}>
                            Mô tả: <br />
                            {data?.description}
                        </p>
                    </div>
                </Layout.Content>
                <Layout.Content className={cx('layout_subtitle')}>
                    <WrapperSubtitle title="Đánh giá:">{data && <Evaluate data={data} />}</WrapperSubtitle>
                    <WrapperSubtitle title="Sản phẩm đề xuất:" vertical>
                        <ListProducts
                            data={products?.filter((product, index) => {
                                const check = product?.catalog
                                    ?.split(',')
                                    .filter((item) => data?.catalog?.split(',').includes(item));
                                return check.length && product._id !== data?._id && index < 10;
                            })}
                        />
                    </WrapperSubtitle>
                </Layout.Content>
            </Layout>
        </Layout.Content>
    );
}
