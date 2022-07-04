import React from 'react';
import { Button, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Column from 'antd/lib/table/Column';
import style from './TableCustom.module.scss';
import className from 'classnames/bind';

const cx = className.bind(style);

export default function TableCustum({ event1, event2, data, columns, style = {}, ...prop }) {
    return (
        <Table dataSource={data} style={style} {...prop}>
            {columns.map((dataCol, index) => (
                <Column key={index} {...dataCol} />
            ))}
            {(event1 || event2) && (
                <Column
                    title="Hành động"
                    key={'action' + prop.key}
                    render={(_, record) => (
                        <Space size="middle">
                            {event1 && (
                                <Button
                                    icon={event1.icon || <EditOutlined />}
                                    loading={record?.loading}
                                    type="dashed"
                                    onClick={() => event1?.handleEvent1(record.id || record._id)}
                                >
                                    <span className={cx('text_btn')}>{event1?.name1}</span>
                                </Button>
                            )}
                            {event2 &&
                                (event2.query ? (
                                    record[Object.keys(event2.query)[0]] === Object.values(event2.query)[0] && (
                                        <Button
                                            icon={event2.icon || <DeleteOutlined />}
                                            type="primary"
                                            danger
                                            onClick={() => event2?.handleEvent2(record.id || record._id)}
                                        >
                                            <span className={cx('text_btn')}>{event2?.name2}</span>
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        icon={event2.icon || <DeleteOutlined />}
                                        type="primary"
                                        danger
                                        onClick={() => event2?.handleEvent2(record.id || record._id)}
                                    >
                                        <span className={cx('text_btn')}>{event2?.name2}</span>
                                    </Button>
                                ))}
                        </Space>
                    )}
                />
            )}
        </Table>
    );
}
