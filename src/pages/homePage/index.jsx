import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../components/navbar";
import Home from "../../components/home";
import Footer from "../../components/footer";

const HomePage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Gems Ore | Premium Jewelry Store Nigeria - Gold, Diamond Rings, Earrings & Necklaces</title>
        <meta name="description" content="Shop premium handcrafted jewelry at Gems Ore Nigeria. Discover exquisite gold rings, diamond earrings, elegant necklaces, bracelets & anklets. Free delivery in Abuja. Buy luxury jewelry online." />
        <meta name="keywords" content="jewelry store Nigeria, buy gold rings online Lagos, diamond earrings Abuja, handcrafted necklaces Nigeria, luxury bracelets, anklets, wedding rings Nigeria, engagement rings, affordable jewelry Nigeria, Gems Ore, online jewelry shop, premium jewelry, gold jewelry, silver jewelry, custom jewelry Nigeria" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.gemsore.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Gems Ore | Premium Jewelry Store Nigeria" />
        <meta property="og:description" content="Discover exquisite handcrafted jewelry — gold rings, diamond earrings, elegant necklaces & more. Shop luxury jewelry online at Gems Ore Nigeria." />
        <meta property="og:url" content="https://www.gemsore.com/" />
        <meta property="og:site_name" content="Gems Ore" />
        <meta property="og:locale" content="en_NG" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gems Ore | Premium Jewelry Store Nigeria" />
        <meta name="twitter:description" content="Shop extraordinary jewelry crafted for life's most precious moments. Gold, diamond & handcrafted pieces." />
      </Helmet>

      <Navbar />
      <Home />
      <Footer />

    </HelmetProvider>
  );
};

export default HomePage;