import React from 'react';
import styles from './Banner.module.scss';
import classNames from 'classnames/bind';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Account } from '../../../Provider/AccountProvider';

const cx = classNames.bind(styles);

export default function Banner({ data }) {
    const { handleErrorImg } = React.useContext(Account);
    function CustomArrow(props) {
        const { className, style, onClick, Icon, transform } = props;
        return (
            <Icon
                className={`${className} ${cx('iconControlBanner')}`}
                style={{
                    ...style,
                    fontSize: '30px',
                    lineHeight: '30px',
                    ...transform,
                    zIndex: '1',
                    color: 'var(--color-link)',
                }}
                onClick={onClick}
            />
        );
    }
    return (
        <Slider
            infinite
            speed={800}
            dots
            dotsClass={cx('dot_banner')}
            slidesToShow={1}
            slidesToScroll={1}
            touchMove={false}
            autoplay={true}
            autoplaySpeed={5000}
            className={cx('wrapper_banner')}
            nextArrow={<CustomArrow Icon={RightOutlined} transform={{ transform: 'translateX(-200%)' }} />}
            prevArrow={<CustomArrow Icon={LeftOutlined} transform={{ transform: 'translateX(200%)' }} />}
        >
            {data.map((img) => (
                <Link key={img.id} to={img.path}>
                    <img
                        key={img.id}
                        className={cx('img')}
                        src={img.url}
                        alt={img.id}
                        loading="lazy"
                        onError={handleErrorImg}
                    />
                </Link>
            ))}
        </Slider>
    );
}
