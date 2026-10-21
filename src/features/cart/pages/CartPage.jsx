import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import Cart from "../components/Cart";

const CartPage = () => {
  return (
    <>
      <Navbar dark={false} />
      <Cart />
      <Footer />
    </>
  );
};

export default CartPage;
