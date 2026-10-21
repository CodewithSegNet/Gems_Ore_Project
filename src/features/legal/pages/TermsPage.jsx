import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import Terms from "../components/Terms";

const TermsPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Terms & Conditions | Gems Ore Nigeria</title>
        <meta name="description" content="Read the terms and conditions for Gems Ore Nigeria." />
      </Helmet>
      <Navbar dark={false} />
      <Terms />
      <Footer />
    </HelmetProvider>
  );
};

export default TermsPage;
