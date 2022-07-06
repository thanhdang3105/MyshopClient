import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Select, Space } from 'antd';
import React from 'react';

export default function SelectCustom({ disabled = false, data, checkData, isSelected, ...prop }) {
    const [optionDisabled, setOptionDisabled] = React.useState(false);
    const [itemsOption, setItemsOption] = React.useState([]);
    const [form2] = Form.useForm();
    const selectRef = React.useRef();

    React.useLayoutEffect(() => {
        switch (prop.name) {
            case 'catalog':
                let arrCatalog = [];
                data.map((item) => {
                    arrCatalog.push(item);
                    return item;
                });

                setItemsOption((prev) => [...prev.filter((item) => item.key), ...arrCatalog]);
                break;
            case 'category':
                let arrCategory = [];
                data.length &&
                    data.map((category) => {
                        arrCategory.push(category);
                        return category;
                    });
                setItemsOption((prev) => [...prev.filter((item) => item.key), ...arrCategory]);
                break;
            case 'collections':
                let arrCollection = itemsOption.length ? itemsOption.filter((item) => item.key) : [];
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

    const handleAddOption = (value) => {
        if (value.addOption !== '' && !itemsOption.find((item) => item.name === value.addOption)) {
            setItemsOption((prev) => [{ key: value.addOption, name: value.addOption }, ...prev]);
            setOptionDisabled(false);
            form2.resetFields();
        } else {
            form2.resetFields();
        }
    };

    return (
        <Form.Item
            {...prop}
            rules={[{ required: true, message: `Vui lòng chọn ${prop.label} của sản phẩm!` }]}
            className="inlineBlock w-33"
        >
            <Select
                ref={selectRef}
                mode="multiple"
                disabled={disabled}
                onChange={handleSelect}
                onDropdownVisibleChange={(visible) => {
                    if (!visible) {
                        setOptionDisabled(false);
                    }
                }}
                dropdownRender={(menu) => (
                    <Form form={form2} onFinish={handleAddOption}>
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
                            <Button type="text" size="small" htmlType="submit" style={{ whiteSpace: 'nowrap' }}>
                                <PlusOutlined />
                            </Button>
                            <Form.Item name="addOption" style={{ margin: 0 }}>
                                <Input
                                    placeholder="Please enter item"
                                    onFocus={() => {
                                        setOptionDisabled(true);
                                    }}
                                    onBlur={() => {
                                        setOptionDisabled(false);
                                    }}
                                    onInput={(e) => {
                                        if (e.target.value === '' && e.code !== 'Backspace') {
                                            return setOptionDisabled(false);
                                        }
                                        setOptionDisabled(true);
                                    }}
                                />
                            </Form.Item>
                        </Space>
                    </Form>
                )}
            >
                {itemsOption.length &&
                    itemsOption.map((item, index) => (
                        <Select.Option disabled={optionDisabled} key={item.key || index} value={item.name}>
                            {item.name}
                        </Select.Option>
                    ))}
            </Select>
        </Form.Item>
    );
}
