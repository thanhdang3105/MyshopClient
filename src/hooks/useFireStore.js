import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFireStore = (_collection, _condition) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        let collectionRef = collection(db, _collection);
        if (_condition && _condition.compareValue && _condition.compareValue.length) {
            collectionRef = query(
                collectionRef,
                where(_condition.fieldName, _condition.operator, _condition.compareValue),
            );
        }

        return onSnapshot(collectionRef, (snapshot) => {
            setData(snapshot.docs);
        });
    }, [_collection, _condition]);

    return data;
};

export const addDocument = async (_collection, data) => {
    const collectionRef = collection(db, _collection);
    const querySnapshot = await getDocs(query(collectionRef, where('uid', '==', data.uid)));
    if (!querySnapshot.docs.length) {
        const newData = {
            uid: data.uid,
            name: data.name || '',
            email: data.email,
            address: data.address || '',
            phoneNumber: data.phoneNumber || '',
            birthday: data.birthday || '',
        };
        await addDoc(collectionRef, newData);
    }
};

export const deleteAccount = (id, _collection) => {
    deleteDoc(doc(collection(db, _collection), id));
};

export const updateDocument = (id, _collection, newDoc) => {
    const user = doc(collection(db, _collection), id);
    return updateDoc(user, newDoc);
};
