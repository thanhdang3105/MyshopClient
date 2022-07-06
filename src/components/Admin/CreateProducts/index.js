import { Button, Form, Image, Input, InputNumber, message } from 'antd';
import React from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import productsSlice from '../../../redux/productsSlice';
import SelectCustom from './SelectCustom';
import { catalogSelector, categorySelector } from '../../../redux/selector';
import { reloadInitState } from '../../../redux/catalogSlice';
import Resizer from 'react-image-file-resizer';

export default function CreateProducts() {
    const [form] = Form.useForm();
    const [fileImg, setFileImg] = React.useState([]);
    const [imgPreview, setImagePreview] = React.useState([]);
    const [validateFile, setValidateFile] = React.useState({ validateStatus: 'warning', help: 'Chọn ít nhất 1 ảnh!' });
    const [dataSelect, setDataSelect] = React.useState({ catalog: '', category: '', collections: '' });
    const dispatch = useDispatch();
    const [isEnabled, setIsEnabled] = React.useState([]);
    const catalogs = useSelector(catalogSelector);
    const categorys = useSelector(categorySelector);

    const onFinish = (values) => {
        const fmData = new FormData();
        values.listImage = Object.values(fileImg).map((file) => {
            fmData.append('file', file);
            return file.name;
        });

        fmData.append('fields', JSON.stringify(values));
        fmData.append('action', 'create');
        message.loading({
            content: 'Thêm sản phẩm...',
            key: 'addProduct',
            duration: 10000,
        });
        axios
            .post(process.env.REACT_APP_API_URL + '/api/handleProducts', fmData)
            .then((response) => {
                if (response.status === 200) {
                    setIsEnabled([]);
                    setValidateFile({ validateStatus: 'warning', help: 'Chọn ít nhất 1 ảnh!' });
                    form.resetFields();
                    setImagePreview([]);
                    message.success({
                        content: 'Thêm thành công ❤',
                        key: 'addProduct',
                        duration: 3,
                    });
                    if (response.data.message) {
                        dispatch(reloadInitState());
                    } else {
                        dispatch(productsSlice.actions.addProducts(response.data));
                    }
                }
            })
            .catch((err) => {
                message.error({
                    content: 'Đã xảy ra lỗi',
                    key: 'addProduct',
                    duration: 3,
                });
                console.log(err);
            });
    };

    const getUrl = React.useCallback(async (files) => {
        const src = await Array.from(files).map((file) => {
            return Resizer.imageFileResizer(
                file,
                500,
                500,
                'WEBP',
                80,
                0,
                (file) => {
                    setFileImg((prev) => [...prev, file]);
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);

                        reader.onload = () => resolve(reader.result);

                        reader.onerror = (error) => reject(error);
                    }).then((res) => {
                        setImagePreview((prev) => [...prev, res]);
                    });
                },
                'file',
                250,
                250,
            );
        });
        return src;
    }, []);

    const selectedImg = (e) => {
        setFileImg([]);
        setImagePreview([]);
        getUrl(e.target.files);
        if (e.target.files.length < 1) {
            setValidateFile({ validateStatus: 'error', help: 'Chọn ít nhất 1 ảnh!' });
        } else {
            setValidateFile({});
        }
    };

    const isSelected = (value, name) => value && setIsEnabled((prev) => [...prev, name]);

    return (
        <Form form={form} layout="vertical" labelAlign="center" onFinish={onFinish}>
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
                            formatter={(value) => `đ  ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\đ\s?|(,*)/g, '')}
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
                        isSelected={isSelected}
                        name="catalog"
                        label="Danh mục"
                    />
                    <SelectCustom
                        checkData={{ dataSelect, setDataSelect }}
                        disabled={!isEnabled.includes('catalog')}
                        isSelected={isSelected}
                        data={categorys}
                        name="category"
                        label="Loại sản phẩm"
                    />
                    <SelectCustom
                        checkData={{ dataSelect, setDataSelect }}
                        disabled={!isEnabled.includes('category')}
                        data={categorys}
                        name="collections"
                        label="Collection"
                    />
                </Input.Group>
            </Form.Item>
            <Form.Item label="Mô tả" name="description">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="listImage" {...validateFile}>
                <input style={{ marginBottom: '15px' }} type="file" accept="image/*" multiple onChange={selectedImg} />
                <Image.PreviewGroup>
                    {imgPreview.length > 0 &&
                        imgPreview.map((src, index) => (
                            <Image key={index} rootClassName="imagePreviewUpload" src={src} alt={'preview' + index} />
                        ))}
                </Image.PreviewGroup>
            </Form.Item>

            <Button disabled={Object.keys(validateFile).length} htmlType="submit">
                Thêm sản phẩm
            </Button>
        </Form>
    );
}
