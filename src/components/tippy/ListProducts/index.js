import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import style from './ListProducts.module.scss';
import classNames from 'classnames/bind';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Account } from '../../Provider/AccountProvider';

const cx = classNames.bind(style);

export default function ListProducts({ data, catalog = '' }) {
    const navigate = useNavigate();
    const { handleErrorImg } = React.useContext(Account);
    const handlePreviewImg = (e, src) => {
        const parent = e.target.offsetParent;
        const img = parent.querySelector('.img_content');
        if (src) {
            return (img.src = require(`../../../asset/img/${src}`));
        }
        img.src = e.target.src;
    };
    return (
        <Swiper
            modules={[Navigation]}
            spaceBetween={30}
            slidesPerView={4}
            centerInsufficientSlides={data?.length < 4 && true}
            navigation
            preloadImages
            breakpoints={{
                320: {
                    slidesPerView: 1,
                    spaceBetween: 50,
                },
                480: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                // when window width is >= 1024px
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                // when window width is >= 1280px
                1280: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                },
            }}
            className={cx('booth_list')}
        >
            {data?.map((product) => {
                const listImage = product?.listImage?.slice(0, 4);
                return (
                    <SwiperSlide key={'products-' + product._id} className={cx('booth_item')}>
                        <Link to={`/san-pham/${product.slug}`} className={cx('item_img')}>
                            <img
                                className={cx('img_content')}
                                src={require(`../../../asset/img/${product.listImage[0]}`)}
                                alt="item-1"
                                loading="lazy"
                                onError={handleErrorImg}
                            />
                        </Link>
                        <div className={cx('item_content')}>
                            <div className={cx('item_content-title')}>
                                <span className={cx('title_desc')}>{product.collections}</span>
                                <Link className={cx('title_link')} to={`/san-pham/${product.slug}`}>
                                    {product.name}
                                </Link>
                            </div>
                            <p className={cx('item_content-price')}>{Number(product.price).toLocaleString('en-gb')}đ</p>
                            <div className={cx('preview_box')}>
                                <div className={cx('listImg_preview')}>
                                    {listImage.length &&
                                        listImage.map((img, index) => (
                                            <img
                                                key={index}
                                                className={cx('img_preview')}
                                                src={require(`../../../asset/img/${img}`)}
                                                alt={'preview-img' + (index + 2)}
                                                onMouseOut={(e) => handlePreviewImg(e, product.listImage[0])}
                                                onMouseEnter={handlePreviewImg}
                                                onError={handleErrorImg}
                                                loading="lazy"
                                            />
                                        ))}
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                );
            })}
            {data && data[10] && catalog && (
                <SwiperSlide className={cx('btn_more')}>
                    <div
                        className={cx('more_title')}
                        onClick={() => navigate('/danh-muc/' + catalog.split(' ').join('-').toLowerCase())}
                    >
                        Xem thêm
                        <ArrowRightOutlined className={cx('more_icon')} />
                    </div>
                </SwiperSlide>
            )}
        </Swiper>
    );
}
