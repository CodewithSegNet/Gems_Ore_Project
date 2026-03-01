import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import ProductPage from "./pages/productPage";
import LoginPage from "./pages/loginPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./contexts/cartContext";

function App() {
  return (
    <GoogleOAuthProvider clientId="493910047901-febc082scanlgjm838apfhq93qupj50q.apps.googleusercontent.com">
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </CartProvider>
    </GoogleOAuthProvider>
  );
}

export default App;