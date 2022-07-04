import React from 'react';
import styles from './CatalogBooth.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { productsSelector, catalogSelector } from '../../../../redux/selector';
import ListProducts from '../../../tippy/ListProducts';

const cx = classNames.bind(styles);

export default function CatalogBooth({ catalog, desc }) {
    const [listItem, setListItem] = React.useState({});
    const products = useSelector(productsSelector);
    const catalogs = useSelector(catalogSelector);

    React.useLayoutEffect(() => {
        const productsFiltered = products.filter((product) =>
            product.catalog.toLowerCase().split(',').includes(catalog.toLowerCase()),
        );
        productsFiltered.sort((a, b) => {
            const item1 = new Date(a.createdAt).getTime();
            const item2 = new Date(b.createdAt).getTime();
            return item2 - item1;
        });
        productsFiltered.length = 11;
        let catalogFinded = catalogs.find((item) => item.name.toLowerCase() === catalog.toLowerCase());
        setListItem((prev) => ({ ...prev, productsFiltered, catalogFinded }));
    }, [catalog, products, catalogs]);

    return (
        <div className={`${cx('booth_wrapper')} booth`}>
            <div className={cx('booth_heading')}>
                <h1 className={cx('heading_title')}>Gian hàng của {catalog}</h1>
                <p className={cx('heading_desc')}>{desc}</p>
                <ul className={cx('catalog_list')}>
                    {listItem.catalogFinded &&
                        listItem.catalogFinded.category.map((title, index) => (
                            <li key={listItem.catalogFinded._id + index}>
                                <Link className={cx('catalog_item')} to={listItem.catalogFinded.path + title.path}>
                                    {title.name.toLowerCase()}
                                </Link>
                            </li>
                        ))}
                </ul>
            </div>
            <ListProducts data={listItem.productsFiltered} catalog={catalog} />
        </div>
    );
}
