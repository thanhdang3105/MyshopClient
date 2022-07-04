import { Button, Form, message, Rate } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React from 'react';
import styles from './Product.module.scss';
import classNames from 'classnames/bind';
import { collection, addDoc, getDocs, where, query, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Account } from '../../Provider/AccountProvider';
import { useFireStore } from '../../../hooks/useFireStore';

const cx = classNames.bind(styles);
export default function Evaluate({ data }) {
    const [reviewList, setReviewList] = React.useState();
    const [starRate, setStarRate] = React.useState(0);
    const [comment, setComment] = React.useState('');
    const { currentUser } = React.useContext(Account);
    const [form] = Form.useForm();

    const conditions = React.useMemo(() => {
        return { fieldName: 'product', operator: '==', compareValue: data.name };
    }, [data]);
    const evaluate = useFireStore('Evaluate', conditions);

    React.useEffect(() => {
        evaluate.map((doc) => {
            setReviewList(doc.data());
            return doc;
        });
    }, [evaluate]);

    const submitEvaluate = async (value) => {
        value.rate = starRate;
        value.comment = comment;
        if (starRate === 0) {
            return message.info({
                content: 'Bạn chưa đánh giá sao!',
                key: 'addReviewErr',
                duration: 2,
            });
        }
        if (!currentUser) {
            return message.warning({
                content: 'Vui lòng đăng nhập trước khi để lại góp ý. Cảm ơn bạn.',
                key: 'alertLogin',
                duration: 5,
            });
        }
        const collectionRef = collection(db, 'Evaluate');
        const querySnapshot = await getDocs(query(collectionRef, where('product', '==', data.name)));
        if (!querySnapshot.docs.length) {
            const newData = {
                product: data.name,
                rateTotal: starRate / 1,
                count: 1,
                comment: [
                    {
                        user: currentUser.name,
                        email: currentUser.email,
                        comment,
                        starRate,
                    },
                ],
            };
            addDoc(collectionRef, newData)
                .then(() => {
                    setStarRate(0);
                    setComment('');
                    form.resetFields();
                    message.success({
                        content: 'Cảm ơn bạn đã góp ý cho chúng tôi ❤',
                        key: 'addReview',
                        duration: 2,
                    });
                })
                .catch(() => {
                    message.error({
                        content: 'Đã xảy ra lỗi mong bạn thông cảm!',
                        key: 'addReviewErr',
                        duration: 2,
                    });
                });
        } else {
            querySnapshot.docs.map((doc) => {
                const newDoc = {
                    ...doc.data(),
                    count: doc.data().count + 1,
                    rateTotal: doc.data().rateTotal + starRate,
                    comment: [
                        ...doc.data().comment,
                        {
                            user: currentUser.name,
                            email: currentUser.email,
                            comment,
                            starRate,
                        },
                    ],
                };
                return updateDoc(doc.ref, newDoc)
                    .then(() => {
                        setStarRate(0);
                        setComment('');
                        form.resetFields();
                        message.success({
                            content: 'Cảm ơn bạn đã góp ý cho chúng tôi ❤',
                            key: 'addReview',
                            duration: 2,
                        });
                    })
                    .catch(() => {
                        message.error({
                            content: 'Đã xảy ra lỗi mong bạn thông cảm!',
                            key: 'addReviewErr',
                            duration: 2,
                        });
                    });
            });
        }
    };
    return (
        <>
            <div className={cx('div_evaluate')}>
                <h1>
                    Đánh giá:{' '}
                    <Rate
                        allowHalf
                        value={reviewList?.rateTotal / reviewList?.count}
                        disabled
                        style={{ lineHeight: '12px' }}
                    />
                    {reviewList?.count || 0} lần đánh giá
                </h1>
                <ul className={cx('list_review')}>
                    {!reviewList
                        ? 'chưa có đánh giá nào'
                        : reviewList.comment.map((item, index) => (
                              <li key={index} className={cx('item_review')}>
                                  <div className={cx('heading_comment')}>
                                      <div className={cx('user_info')}>
                                          <h4>{item.user}</h4>
                                          <span>{item.email}</span>
                                      </div>
                                      <Rate disabled allowHalf className={cx('rate_review')} value={item.starRate} />
                                  </div>
                                  <p className={cx('item_content')}>{item.comment}</p>
                              </li>
                          ))}
                </ul>
            </div>
            <div className={cx('form_evaluate')}>
                <h1>Hãy đánh giá cho sản phẩm "{data?.name?.toUpperCase()}"</h1>
                <div className={cx('rate_box')}>
                    <h2>Đánh giá của bạn</h2>
                    <Rate allowHalf value={starRate} onChange={setStarRate} onClick={(e) => e.preventDefault()} />
                </div>
                <Form form={form} layout="vertical" onFinish={submitEvaluate}>
                    <Form.Item
                        rules={[{ required: true, message: 'Vui lòng nhập đánh giá của bạn!' }]}
                        name="comment"
                        label="Nhận xét của bạn:"
                    >
                        <TextArea
                            value={comment}
                            rows={5}
                            onChange={(e) => setComment(e.target.value)}
                            columns={10}
                            className={cx('text-area')}
                        />
                    </Form.Item>
                    <Button htmlType="submit">Gửi</Button>
                </Form>
            </div>
        </>
    );
}
