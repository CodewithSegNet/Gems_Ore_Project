import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import RefundPolicy from "../components/RefundPolicy";

const RefundPolicyPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Refund & Return Policy | Gems Ore Nigeria</title>
        <meta name="description" content="Read Gems Ore Nigeria's refund, return, and exchange policy." />
      </Helmet>
      <Navbar dark={false} />
      <RefundPolicy />
      <Footer />
    </HelmetProvider>
  );
};

export default RefundPolicyPage;
