import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import ProductPage from "./pages/productPage";
import ProductDetailPage from "./pages/productDetailPage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./contexts/cartContext";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <GoogleOAuthProvider clientId="493910047901-febc082scanlgjm838apfhq93qupj50q.apps.googleusercontent.com">
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </CartProvider>
    </GoogleOAuthProvider>
  );
}

export default App;