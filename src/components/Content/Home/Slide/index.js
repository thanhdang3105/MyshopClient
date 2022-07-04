import React from 'react';
import styles from './Slide.module.scss';
import classNames from 'classnames/bind';
import { Navigation, Autoplay } from 'swiper';
import { InboxOutlined, RollbackOutlined, MailOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';

const cx = classNames.bind(styles);

const itemSlide = [
    {
        icon: <InboxOutlined />,
        text: 'FREE INTERNATIONAL DELIVERY TO YOU',
    },
    {
        icon: <RollbackOutlined />,
        text: '30-DAY FREE RETURN',
    },
    {
        icon: <MailOutlined />,
        text: 'GET THE LAST EXCLUSIVES AND OFFERS',
    },
];

export default function Slide() {
    return (
        <div className={cx('content_slide--title')}>
            <div className={cx('content_slide--body')}>
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop
                    lazy={true}
                    centeredSlides
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    navigation
                    preloadImages
                    breakpoints={{
                        320: {
                            slidesPerView: 0,
                            spaceBetween: 0,
                        },
                        480: {
                            slidesPerView: 1,
                            spaceBetween: 30,
                        },
                    }}
                    className={cx('slide_list')}
                >
                    {itemSlide.map((item, index) => (
                        <SwiperSlide key={index} className={cx('slide_item')}>
                            {item.icon} {item.text}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
