import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId="493910047901-febc082scanlgjm838apfhq93qupj50q.apps.googleusercontent.com">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;