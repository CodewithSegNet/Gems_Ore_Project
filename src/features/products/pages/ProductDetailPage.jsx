import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import ProductDetail from "../components/ProductDetail";

const ProductDetailPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Product Details | Gems Ore Nigeria</title>
        <meta name="description" content="Discover premium handcrafted jewelry at Gems Ore Nigeria. Exquisite gold rings, diamond earrings, and luxury pieces." />
      </Helmet>

      <Navbar dark={false} />
      <ProductDetail />
      <Footer />
    </HelmetProvider>
  );
};

export default ProductDetailPage;
