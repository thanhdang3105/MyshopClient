import { Button, Form, Input, InputNumber, message, Modal } from 'antd';
import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reloadInitState } from '../../../redux/catalogSlice';
import productsSlice from '../../../redux/productsSlice';
import { catalogSelector, categorySelector, productEditSelector } from '../../../redux/selector';
import SelectCustom from '../CreateProducts/SelectCustom';

export default function EditProduct({ edit: { isEdit, setIsEdit } }) {
    const [form] = Form.useForm();
    const [dataSelect, setDataSelect] = React.useState({ catalog: '', category: '', collections: '' });
    const [fileImg, setFileImg] = React.useState([]);
    const catalogs = useSelector(catalogSelector);
    const categorys = useSelector(categorySelector);
    const dataEdit = useSelector(productEditSelector);
    const dispatch = useDispatch();

    React.useLayoutEffect(() => {
        form.setFieldsValue({
            name: dataEdit.name,
            price: dataEdit.price,
            size: dataEdit.size,
            color: dataEdit.color,
            catalog: dataEdit.catalog?.split(','),
            category: dataEdit.category?.split(','),
            collections: dataEdit.collections?.split(','),
            description: dataEdit.description,
            listImage: dataEdit.listImage,
        });
        setDataSelect((prev) => ({ ...prev, category: dataEdit.category?.split(',') }));
    }, [dataEdit, form]);

    const handleFinish = (values) => {
        const fmData = new FormData();
        values.newImage = Object.values(fileImg).map((file) => {
            fmData.append('file', file);
            return file.name;
        });
        values._id = dataEdit._id;
        if (!Array.isArray(values.listImage) && values.listImage) {
            values.listImage = values.listImage.split(',');
        }
        if (!values.listImage) {
            values.listImage = [];
        }
        fmData.append('fields', JSON.stringify(values));
        fmData.append('action', 'update');
        if (values.listImage.length || values.newImage.length) {
            axios
                .post('/api/handleProducts', fmData)
                .then((response) => {
                    if (response.status === 200) {
                        setIsEdit(false);
                        form.resetFields();
                        if (response.data.message) {
                            dispatch(reloadInitState());
                        } else {
                            dispatch(productsSlice.actions.updateProducts(response.data.data));
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            message.error({
                content: 'Mỗi sản phẩm cần có ít nhất 1 ảnh!',
                key: 'CancelEdit',
                duration: 2,
            });
        }
    };

    const selectedImg = (e) => {
        setFileImg(e.target.files);
    };

    const handleCancel = () => {
        setIsEdit(false);
        form.resetFields();
        setFileImg([]);
    };

    return (
        <Modal visible={isEdit} footer={null} onCancel={handleCancel} width={window.innerWidth > 768 ? '70vw' : '90vw'}>
            <Form form={form} layout="vertical" labelAlign="center" onFinish={handleFinish}>
                <Form.Item>
                    <Input.Group compact>
                        <Form.Item
                            label="Tên sản phẩm"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên sản phẩm!',
                                },
                            ]}
                            className="inlineBlock"
                        >
                            <Input type="text" placeholder="Nhập tên sản phẩm" />
                        </Form.Item>
                        <Form.Item
                            label="Giá sản phẩm"
                            name="price"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá sản phẩm!',
                                },
                            ]}
                            className="inlineBlock"
                        >
                            <InputNumber
                                controls={false}
                                formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\\đ\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
                <Form.Item>
                    <Form.Item
                        label="Size"
                        name="size"
                        rules={[{ required: true, message: 'Vui lòng nhập các size của sản phẩm!' }]}
                        className="inlineBlock"
                    >
                        <Input style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Màu sắc"
                        name="color"
                        rules={[{ required: true, message: 'Vui lòng nhập các màu của sản phẩm!' }]}
                        className="inlineBlock"
                    >
                        <Input />
                    </Form.Item>
                </Form.Item>
                <Form.Item>
                    <Input.Group compact>
                        <SelectCustom
                            data={catalogs}
                            checkData={{ dataSelect, setDataSelect }}
                            name="catalog"
                            label="Danh mục"
                        />
                        <SelectCustom
                            checkData={{ dataSelect, setDataSelect }}
                            data={categorys}
                            name="category"
                            label="Loại sản phẩm"
                        />
                        <SelectCustom
                            checkData={{ dataSelect, setDataSelect }}
                            data={categorys}
                            name="collections"
                            label="Collection"
                        />
                    </Input.Group>
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item label="Danh sách ảnh" name="listImage">
                    <Input type="text" />
                </Form.Item>
                <Form.Item name="newImage">
                    <input type="file" accept="image/*" value={fileImg} multiple onChange={selectedImg} />
                </Form.Item>
                <Button htmlType="submit">Cập nhật</Button>
            </Form>
        </Modal>
    );
}
