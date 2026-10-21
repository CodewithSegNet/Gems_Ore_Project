import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import ProductList from "../components/ProductList";

const ProductListPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Shop All Jewelry | Gems Ore Nigeria</title>
        <meta name="description" content="Browse our full collection of premium jewelry — watches, rings, necklaces, earrings & bracelets. Shop online at Gems Ore Nigeria." />
      </Helmet>

      <Navbar dark={false} />
      <ProductList />
      <Footer />
    </HelmetProvider>
  );
};

export default ProductListPage;
