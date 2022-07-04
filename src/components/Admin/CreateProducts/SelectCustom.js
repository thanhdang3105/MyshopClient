import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Select, Space } from 'antd';
import React from 'react';

export default function SelectCustom({ disabled = false, data, checkData, isSelected, ...prop }) {
    const [valueInput, setValueInput] = React.useState('');
    const [itemsOption, setItemsOption] = React.useState(data);
    React.useLayoutEffect(() => {
        switch (prop.name) {
            case 'catalog':
                let arrCatalog = [];
                data.map((item) => {
                    arrCatalog.push(item);
                    return item;
                });
                setItemsOption(arrCatalog);
                break;
            case 'category':
                let arrCategory = [];
                data.length &&
                    data.map((category) => {
                        arrCategory.push(category);
                        return category;
                    });
                setItemsOption(arrCategory);
                break;
            case 'collections':
                let arrCollection = [];
                data.length &&
                    data.map((category) => {
                        if (checkData.dataSelect.category?.includes(category.name)) {
                            category.children.map((item) => {
                                arrCollection.push(item);
                                return item;
                            });
                        }
                        return category;
                    });
                setItemsOption(arrCollection);
                break;
            default:
                throw new Error('Unknown property ' + prop.name);
        }
    }, [data, prop.name, checkData]);

    const handleSelect = (value) => {
        if (isSelected) {
            isSelected(value[0], prop.name);
        }
        checkData.setDataSelect((prev) => ({ ...prev, [prop.name]: value }));
    };

    return (
        <Form.Item
            {...prop}
            rules={[{ required: true, message: `Vui lòng chọn ${prop.label} của sản phẩm!` }]}
            className="inlineBlock w-33"
        >
            <Select
                mode="multiple"
                disabled={disabled}
                onChange={handleSelect}
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        <Divider
                            style={{
                                margin: '8px 0',
                            }}
                        />
                        <Space
                            align="center"
                            style={{
                                padding: '0 8px 4px',
                            }}
                        >
                            <Button
                                type="text"
                                size="small"
                                onClick={() => {
                                    setValueInput('');
                                    !itemsOption.includes(valueInput) &&
                                        !(valueInput === '') &&
                                        setItemsOption((prev) => [...prev, { name: valueInput }]);
                                }}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                <PlusOutlined />
                            </Button>
                            <Input
                                value={valueInput}
                                placeholder="Please enter item"
                                onChange={(e) => setValueInput(e.target.value)}
                            />
                        </Space>
                    </>
                )}
            >
                {itemsOption.length &&
                    itemsOption.map((item, index) => (
                        <Select.Option key={index} value={item.name}>
                            {item.name}
                        </Select.Option>
                    ))}
            </Select>
        </Form.Item>
    );
}
