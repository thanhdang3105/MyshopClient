import { Button, Form, Input, InputNumber, message, Modal, Select } from 'antd';
import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reloadInitState } from '../../../redux/catalogSlice';
import productsSlice from '../../../redux/productsSlice';
import { catalogSelector, categorySelector, productEditSelector } from '../../../redux/selector';
import SelectCustom from '../CreateProducts/SelectCustom';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../../firebase/config';

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
            listImage: dataEdit.listImage?.map((img) => img.name || img),
        });
        setDataSelect((prev) => ({ ...prev, category: dataEdit.category?.split(',') }));
    }, [dataEdit, form]);

    const uploadImage = React.useCallback(async (file) => {
        const metadata = {
            contentType: 'image/jpeg',
        };
        const imgRef = uploadBytesResumable(ref(storage, file.name), file, metadata);
        await imgRef.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                message.loading({
                    content: 'Upload ' + file.name + ' ' + progress + '%',
                    key: 'editProduct',
                    duration: 10000,
                });
                switch (snapshot.state) {
                    case 'paused':
                        message.warn({
                            content: 'Paused ' + file.name + ' ' + progress + '%',
                            key: 'editProduct',
                            duration: 10000,
                        });
                        break;
                    case 'running':
                        message.loading({
                            content: 'Upload ' + file.name + ' ' + progress + '%',
                            key: 'editProduct',
                            duration: 10000,
                        });
                        break;
                    default:
                        throw new Error(`Invalid action: ` + snapshot.state);
                }
            },
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        message.error({
                            content: 'Không thể truy cập kho lưu trữ!',
                            key: 'editProduct',
                            duration: 2,
                        });
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        message.error({
                            content: 'Lỗi tải ảnh!',
                            key: 'editProduct',
                            duration: 2,
                        });
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        message.error({
                            content: 'Lỗi không xác định!',
                            key: 'editProduct',
                            duration: 2,
                        });
                        break;
                    default:
                        throw new Error(`Invalid action: ` + error.code);
                }
            },
        );
        return imgRef;
    }, []);

    const handleFinish = async (values) => {
        const listImg = [];
        for (const file of Object.values(fileImg)) {
            const imgRef = await uploadImage(file);
            listImg.push({ name: file.name, url: await getDownloadURL(imgRef.ref) });
        }

        values.newImage = listImg;
        values._id = dataEdit._id;
        values.listImage = values.listImage?.map((img) => dataEdit.listImage.find((item) => item.name === img));
        if (values.listImage.length || values.newImage.length) {
            axios
                .post(process.env.REACT_APP_API_URL + '/api/handleProducts', { action: 'update', data: values })
                .then((response) => {
                    if (response.status === 200) {
                        message.success({
                            content: 'Cập nhật thành công',
                            key: 'editProduct',
                            duration: 2,
                        });
                        setIsEdit(false);
                        setFileImg([]);
                        form.resetFields();
                        if (response.data.message) {
                            dispatch(reloadInitState());
                        } else {
                            dispatch(productsSlice.actions.updateProducts(response.data));
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            message.error({
                content: 'Mỗi sản phẩm cần có ít nhất 1 ảnh!',
                key: 'editProduct',
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
                    <Select mode="multiple">
                        {dataEdit.listImage?.map((img) => (
                            <Select.Option key={img.name || img} value={img.name || img}>
                                {img.name || img}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="newImage">
                    <input type="file" accept="image/*" value={fileImg} multiple onChange={selectedImg} />
                </Form.Item>
                <Button htmlType="submit">Cập nhật</Button>
            </Form>
        </Modal>
    );
}
