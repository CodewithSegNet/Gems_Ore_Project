import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import PrivacyPolicy from "../components/PrivacyPolicy";

const PrivacyPolicyPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Privacy Policy | Gems Ore Nigeria</title>
        <meta name="description" content="Read the privacy policy for Gems Ore Nigeria." />
      </Helmet>
      <Navbar dark={false} />
      <PrivacyPolicy />
      <Footer />
    </HelmetProvider>
  );
};

export default PrivacyPolicyPage;
