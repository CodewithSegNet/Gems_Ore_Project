import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

// import { UserProvider } from "./context/Users/UserContext";


import App from './App.jsx'
import { GenderProvider } from './contexts/genderContext.jsx'

const queryClient = new QueryClient();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
         <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
    <GenderProvider>
    <App />
    </GenderProvider>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
