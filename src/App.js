import './App.scss';
import { Layout } from 'antd';
import Header from './components/patials/Header';
import Footer from './components/patials/Footer';
import Modal from './components/account/Modal';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './components/Content/Home';
import Catalog from './components/Content/Catalog';
import Product from './components/Content/Product';
import AccountCentral from './components/account/Central';
import CartList from './components/Content/CartList';
import React from 'react';
import Payment from './components/Content/Payment';
import { useSelector } from 'react-redux';
import Loading from './components/Loading';

function App() {
    const loadingState = useSelector(({ products }) => products.loading);
    const location = useLocation();
    React.useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);
    return (
        <>
            {loadingState !== false && <Loading />}
            <Layout className="App">
                <Header />
                <Routes>
                    <Route path="/thanh-toan" element={<Payment />} />
                    <Route path="/gio-hang" element={<CartList />} />
                    <Route path="/account/:page" element={<AccountCentral />} />
                    <Route path="/san-pham/:slug" element={<Product />} />
                    <Route path="/danh-muc/:catalog" element={<Catalog />}>
                        <Route path=":category" element={<Catalog />} />
                    </Route>
                    <Route path="/*" element={<Home />} />
                </Routes>
                <Modal />
                <Layout.Footer className="App_footer">
                    <Footer />
                </Layout.Footer>
            </Layout>
        </>
    );
}

export default App;
