import React from 'react';
import styles from './Content.module.scss';
import classNames from 'classnames/bind';
import Slide from './Slide';
import Banner from './Banner';
import CatalogBooth from './CatalogBooth';
import { Layout } from 'antd';

const cx = classNames.bind(styles);

const bannerTop = [
    {
        id: 'banner-1',
        url: 'http://mauweb.monamedia.net/bitis/wp-content/uploads/2018/03/slideshow_1.jpg',
        path: '/banner-1',
    },
    {
        id: 'banner-2',
        url: 'http://mauweb.monamedia.net/bitis/wp-content/uploads/2018/03/slideshow_2.jpg',
        path: '/banner-2',
    },
];

const bannerMid = [
    {
        id: 'banner-3',
        url: 'http://mauweb.monamedia.net/bitis/wp-content/uploads/2018/03/slideshow_3.jpg',
        path: '/banner-3',
    },
];
const bannerMidBot = [
    {
        id: 'banner-4',
        url: 'http://mauweb.monamedia.net/bitis/wp-content/uploads/2018/03/slideshow_5.jpg',
        path: '/banner-4',
    },
];
const bannerBot = [
    {
        id: 'banner-5',
        url: 'http://mauweb.monamedia.net/bitis/wp-content/uploads/2018/03/P3_1_Image-1.jpg',
        path: '/banner-5',
    },
];

export default function Home() {
    return (
        <Layout.Content>
            <div className={cx('wrapper_content')}>
                <Slide />
                <Banner data={bannerTop} />
                <CatalogBooth
                    key="men"
                    catalog="Nam"
                    desc="Boasting the biggest heel air bag yet, bringing you even closer to the feeling of walking on air."
                />
                <Banner data={bannerMid} />
                <CatalogBooth
                    key="women"
                    catalog="Nữ"
                    desc="Our ground-breaking running innovation seven years in the making undergoes new evolution."
                />
                <Banner data={bannerMidBot} />
                <CatalogBooth
                    key="boys"
                    catalog="Bé trai"
                    desc="The Air Max styles kids love—from the ’87 original, Air Max 1, to the new larger-than-life Air Max 270."
                />
                <Banner data={bannerBot} />
                <CatalogBooth
                    key="girls"
                    catalog="Bé gái"
                    desc="Retro, new or personally customised, get the Air Max that’s right for you."
                />
            </div>
        </Layout.Content>
    );
}
