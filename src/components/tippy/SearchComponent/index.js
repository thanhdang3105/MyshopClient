import { Menu, Popover, Spin } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import style from './Search.module.scss';
import className from 'classnames/bind';

const cx = className.bind(style);

export default function SearchComponent({ children, data, search, visible, className }) {
    const [state, setState] = React.useState([]);
    React.useLayoutEffect(() => {
        setState(data);
    }, [data]);
    const menu = (
        <Menu
            className={cx('wrapper_menu')}
            mode="vertical"
            theme="light"
            selectable={false}
            items={state?.map((item, index) => {
                if (index < 10) {
                    return {
                        style: {
                            height: 'fit-content',
                            width: '100%',
                        },
                        key: item._id,
                        label: (
                            <div key={item._id} className={cx('item_list')}>
                                <Link to={`/san-pham/${item.slug}`} className={cx('item_imgBox')}>
                                    <img className={cx('img')} src={item.listImage[0].url} alt={item.name} />
                                </Link>
                                <div className={cx('item_info')}>
                                    <Link to={`/san-pham/${item.slug}`} className={cx('item_name')}>
                                        {item.name}
                                    </Link>
                                    <p className={cx('item_price')}>{Number(item.price).toLocaleString('en-gb')}đ</p>
                                </div>
                            </div>
                        ),
                    };
                }
                return '';
            })}
        />
    );

    const handleVisibleChange = (visible) => {
        if (!search) {
            console.log(search);
            setState([]);
        }
    };

    return (
        <Popover
            placement={'topLeft'}
            {...visible}
            onVisibleChange={handleVisibleChange}
            content={
                state.length ? (
                    <div className={cx('wrapper')}>
                        {menu}
                        <Link style={{ textAlign: 'center' }} to="/danh-muc/search" type="text" size="small">
                            Xem tất cả
                        </Link>
                    </div>
                ) : (
                    <Spin style={{ width: '30vw' }} />
                )
            }
            title="Tìm kiếm"
            width="200px"
            trigger={window.innerWidth < 820 ? 'click' : 'focus'}
        >
            <div className={`${className} ${cx('div_search')}`}>{children}</div>
        </Popover>
    );
}
