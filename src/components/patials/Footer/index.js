import React from 'react';
import styles from './Footer.module.scss';
import classNames from 'classnames/bind';
import { Col, Divider, Row, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { FacebookFilled, InstagramFilled, TwitterSquareFilled, YoutubeFilled } from '@ant-design/icons';

const cx = classNames.bind(styles);

export default function Footer() {
    return (
        <div className={cx('wrapper')}>
            <Row className={cx('footer_row')}>
                <Col className={cx('footer_col')}>
                    <div className={cx('footer_info')} style={{ fontWeight: 'bold' }}>
                        <Link className={cx('info_item')} to="/">
                            Find a store
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Sign up for Email
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Become a member
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Site feedback
                        </Link>
                    </div>
                    <div className={cx('footer_info')}>
                        <h3 className={cx('info_title')}>Get help</h3>
                        <Link className={cx('info_item')} to="/">
                            Find a store
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Sign up for Email
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Become a member
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Site feedback
                        </Link>
                    </div>
                    <div className={cx('footer_info')}>
                        <h3 className={cx('info_title')}>About brand</h3>
                        <Link className={cx('info_item')} to="/">
                            Find a store
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Sign up for Email
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Become a member
                        </Link>
                        <Link className={cx('info_item')} to="/">
                            Site feedback
                        </Link>
                    </div>
                </Col>
                <Col className={cx('footer_col')}>
                    <div className={cx('footer_social')}>
                        <Tooltip title="Follow Facebook">
                            <a className={cx('social_link')} href="#top">
                                <FacebookFilled />
                            </a>
                        </Tooltip>
                        <Tooltip title="Follow Instagram">
                            <a className={cx('social_link')} href="#top">
                                <InstagramFilled />
                            </a>
                        </Tooltip>
                        <Tooltip title="Follow Twitter">
                            <a className={cx('social_link')} href="#top">
                                <TwitterSquareFilled />
                            </a>
                        </Tooltip>
                        <Tooltip title="Follow Youtube">
                            <a className={cx('social_link')} href="#top">
                                <YoutubeFilled />
                            </a>
                        </Tooltip>
                    </div>
                    <div className={cx('footer_apiGGMap')}>Api map Google</div>
                </Col>
            </Row>
            <Divider style={{ borderColor: 'var(--color-link)' }} />
            <Row
                className={cx('footer_row')}
                style={{ color: 'var(--color-link)', justifyContent: 'center', fontSize: '16px', lineHeight: '32px' }}
            >
                © All rights reserved. Thiết kế website Thanh Đặng
            </Row>
        </div>
    );
}
