import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import ShippingPolicy from "../components/ShippingPolicy";

const ShippingPolicyPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Shipping Policy | Gems Ore Nigeria</title>
        <meta name="description" content="Read Gems Ore Nigeria's shipping policy — delivery times, insured transit, and order processing." />
      </Helmet>
      <Navbar dark={false} />
      <ShippingPolicy />
      <Footer />
    </HelmetProvider>
  );
};

export default ShippingPolicyPage;
