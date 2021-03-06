import { Button, Form, Image, Input, InputNumber, message } from 'antd';
import React from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import productsSlice from '../../../redux/productsSlice';
import SelectCustom from './SelectCustom';
import { catalogSelector, categorySelector } from '../../../redux/selector';
import { reloadInitState } from '../../../redux/catalogSlice';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../../firebase/config';

export default function CreateProducts() {
    const [form] = Form.useForm();
    const [fileImg, setFileImg] = React.useState([]);
    const [imgPreview, setImagePreview] = React.useState([]);
    const [validateFile, setValidateFile] = React.useState({ validateStatus: 'warning', help: 'Chọn ít nhất 1 ảnh!' });
    const [dataSelect, setDataSelect] = React.useState({ catalog: [], category: [], collections: [] });
    const dispatch = useDispatch();
    const [isEnabled, setIsEnabled] = React.useState([]);
    const catalogs = useSelector(catalogSelector);
    const categorys = useSelector(categorySelector);

    React.useEffect(() => {
        dataSelect.category.length &&
            isEnabled.includes('catalog') &&
            setIsEnabled((prev) => (!prev.includes('category') ? [...prev, 'category'] : prev));
    }, [dataSelect.catalog, isEnabled]);

    const uploadImage = React.useCallback(async (file) => {
        const metadata = {
            contentType: 'image/jpeg',
        };
        const imgRef = uploadBytesResumable(ref(storage, file.name), file, metadata);
        await imgRef.on(
            'state_changed',
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                message.loading({
                    content: 'Upload ' + file.name + ' ' + progress + '%',
                    key: 'addProduct',
                    duration: 10000,
                });
                switch (snapshot.state) {
                    case 'paused':
                        message.warn({
                            content: 'Paused ' + file.name + ' ' + progress + '%',
                            key: 'addProduct',
                            duration: 10000,
                        });
                        break;
                    case 'running':
                        message.loading({
                            content: 'Upload ' + file.name + ' ' + progress + '%',
                            key: 'addProduct',
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
                            key: 'addProduct',
                            duration: 2,
                        });
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        message.error({
                            content: 'Lỗi tải ảnh!',
                            key: 'addProduct',
                            duration: 2,
                        });
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        message.error({
                            content: 'Lỗi không xác định!',
                            key: 'addProduct',
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

    const onFinish = async (values) => {
        // Promise.all(
        //     Object.values(fileImg).map(async (file) => {
        //         const imgRef = await uploadBytes(ref(storage, file.name), file);
        //         return { name: file.name, url: await getDownloadURL(imgRef.ref) };
        //     }),
        // ).then(([...result]) => {
        //     values.listImage = result;
        // });

        setValidateFile({ validateStatus: 'validating' });
        const listImg = [];
        for (const file of Object.values(fileImg)) {
            const imgRef = await uploadImage(file);
            listImg.push({ name: file.name, url: await getDownloadURL(imgRef.ref) });
        }
        values.listImage = listImg;
        values.createdAt = Date.now();
        axios
            .post(process.env.REACT_APP_API_URL + '/api/handleProducts', { action: 'create', data: values })
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
                setValidateFile({});
                console.log(err);
            });
    };

    const getUrl = React.useCallback(async (files) => {
        const src = await Array.from(files).map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);

                reader.onload = () => resolve(reader.result);

                reader.onerror = (error) => reject(error);
            }).then((res) => {
                setImagePreview((prev) => [...prev, res]);
            });
        });
        return src;
    }, []);

    const selectedImg = (e) => {
        setFileImg(e.target.files);
        setImagePreview([]);
        getUrl(e.target.files);
        if (e.target.files.length < 1) {
            setValidateFile({ validateStatus: 'error', help: 'Chọn ít nhất 1 ảnh!' });
        } else {
            setValidateFile({});
        }
    };

    const isSelected = (value, name) => {
        if (value) {
            setIsEnabled((prev) => (!prev.includes(name) ? [...prev, name] : prev));
        } else {
            setIsEnabled((prev) => {
                if (name === 'catalog') {
                    return [];
                }
                form.resetFields(['collections']);
                return prev.filter((item) => item !== name);
            });
        }
    };

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
                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
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
