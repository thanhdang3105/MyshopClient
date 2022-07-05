import React from 'react';
import style from './Loading.module.scss';
import className from 'classnames/bind';
import { useSelector } from 'react-redux';
import { Progress } from 'antd';
import { HeartTwoTone } from '@ant-design/icons';

const cx = className.bind(style);

export default function Loading() {
    const loadingState = useSelector(({ products }) => products.loading);
    return (
        <div className={cx('wrapper')}>
            <div className={cx('loading_content')}>
                <div className={cx('loading_content-text')}>
                    <h1>
                        Chào mừng bạn đã đến vớI My Shop <HeartTwoTone />
                    </h1>
                    <p>
                        Vui lòng chờ trong giây lát để trải nghiệm của bạn được hoàn thiện hơn.
                        <br />
                        Xin cảm ơn
                    </p>
                </div>
                <div
                    className={cx('loading_icon')}
                    style={{ width: loadingState + '%', paddingRight: loadingState > 90 && '30px' }}
                >
                    <img src={`${process.env.PUBLIC_URL}/img/goku.png`} alt="Loading..." />
                </div>
                <Progress
                    strokeColor={{
                        from: '#0066d3',
                        to: '#01ac66',
                    }}
                    percent={loadingState}
                    status="active"
                />
            </div>
            <div className={cx('wrapper_shadow')}></div>
        </div>
    );
}
