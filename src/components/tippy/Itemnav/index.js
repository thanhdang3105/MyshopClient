import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

import styles from './dropdown.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function Itemnav({ data }) {
    return (
        <Menu
            className={cx('header_menu')}
            theme="ligth"
            selectable={false}
            items={data?.map((catalog) => {
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
                            <Link className={cx('menu_item', 'Link_header')} to={catalog.path}>
                                {catalog.name}
                            </Link>
                        ),
                    };
                }
                return value;
            })}
        />
    );
}
