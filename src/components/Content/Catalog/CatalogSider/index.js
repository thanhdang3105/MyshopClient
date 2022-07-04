import { Layout, Menu } from 'antd';
import React from 'react';
import styles from './CatalogSider.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function CatalogSider({ data }) {
    return (
        <Layout.Sider className={cx('wrapperSider')}>
            <div className={cx('listCategory')}>
                <h1 className={cx('listTitle')}>Danh mục sản phẩm</h1>
                <Menu
                    className={cx('wrapperCategory')}
                    theme="ligth"
                    items={
                        data?.length
                            ? data?.map((cata, Index) => ({
                                  key: Index + 1,
                                  type: 'group',
                                  label: (
                                      <Link className="text text_bold" to={cata.path}>
                                          {cata.name}
                                      </Link>
                                  ),
                                  children: cata?.category?.map((cate, index) => {
                                      return {
                                          key: `${Index + 1}-${index + 1}`,
                                          label: <Link to={cata.path + cate.path}>{cate.name}</Link>,
                                      };
                                  }),
                              }))
                            : data?.category?.map((cate, Index) => ({
                                  key: Index + 1,
                                  type: 'group',
                                  label: (
                                      <Link className="text text_bold" to={data.path + cate.path}>
                                          {cate.name}
                                      </Link>
                                  ),
                                  children: cate.children.map((collection, index) => {
                                      return {
                                          key: `${Index + 1}-${index + 1}`,
                                          label: (
                                              <Link to={data.path + cate.path + collection.path}>
                                                  {collection.name}
                                              </Link>
                                          ),
                                      };
                                  }),
                              }))
                    }
                />
            </div>
        </Layout.Sider>
    );
}
