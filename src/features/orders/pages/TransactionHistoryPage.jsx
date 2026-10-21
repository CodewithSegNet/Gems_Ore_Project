import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import TransactionHistory from "../components/TransactionHistory";

const TransactionHistoryPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Order History | Gems Ore Nigeria</title>
        <meta name="description" content="View your order and transaction history at Gems Ore Nigeria." />
      </Helmet>

      <Navbar dark={false} />
      <TransactionHistory />
      <Footer />
    </HelmetProvider>
  );
};

export default TransactionHistoryPage;
