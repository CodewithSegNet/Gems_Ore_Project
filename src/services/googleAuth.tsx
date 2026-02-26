import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/Users/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setUser } = useUser();

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  // Reset message when switching between Sign Up and Sign In
  useEffect(() => {
    setMessage(null);
  }, [location.pathname]);

  // Function to set axios default headers
  const setAxiosDefaults = (token: string) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("✓ Axios defaults set with token");
  };

  // Function to redirect user based on user type
  const redirectUser = (userData: any) => {
    const userType = userData.user_type || "user";
    
    console.log(`Redirecting user type: ${userType}`);
    
    if (userType === "superadmin") {
      navigate("/super-admin-dashboard", { replace: true });
    } else if (userType === "admin") {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // Function to complete user setup 
  const completeUserSetup = (userData: any) => {
    console.log("=== COMPLETE USER SETUP DEBUG ===");
    console.log("User data received:", userData);
    
    const userType = userData.user_type || "user";
    console.log(`User type: ${userType}`);
    
    // Store complete user data
    setUser(userData);
    
    // IMPORTANT: Store the main access token (not temp_access_token)
    localStorage.setItem("access_token", userData.access_token);
    localStorage.setItem(`user_${userType}`, JSON.stringify(userData));
    localStorage.setItem("current_user_type", userType);
    
    console.log("✓ Stored access_token:", userData.access_token?.substring(0, 20) + "...");
    console.log("✓ Stored user data and type");
    
    // Set axios defaults immediately
    setAxiosDefaults(userData.access_token);
    
    // Store flag to indicate phone number modal should be shown
    if (!userData.phone_number || userData.phone_number === null || userData.phone_number === '') {
      console.log("Phone number missing - setting modal flag");
      localStorage.setItem("show_phone_modal", "true");
      localStorage.setItem("phone_modal_user_data", JSON.stringify(userData));
    }
    
    // Store type-specific tokens
    if (userType === "superadmin") {
      localStorage.setItem("superadmin_token", userData.access_token);
    } else if (userType === "admin") {
      localStorage.setItem("admin_token", userData.access_token);
    } else {
      localStorage.setItem("user_token", userData.access_token);
    }
    
    // Invalidate queries and redirect
    queryClient.invalidateQueries({ queryKey: ["user"] });
    console.log("=== COMPLETE USER SETUP DEBUG END ===");
    
    setTimeout(() => {
      redirectUser(userData);
    }, 300);
  };

  // Handle successful phone number update
  const handlePhoneNumberSuccess = async (phoneNumber: string) => {
    try {
      if (pendingUserData) {
        console.log("Updating user data with phone number:", phoneNumber);
        
        // Update the user data with the new phone number
        const updatedUserData = {
          ...pendingUserData,
          phone_number: phoneNumber
        };
        
        setPendingUserData(null);
        
        setMessage({ text: "Profile completed successfully!", type: "success" });
        
        // Complete the user setup
        completeUserSetup(updatedUserData);
      }
    } catch (error: any) {
      console.error("Error completing profile:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to complete profile.",
        type: "error",
      });
    }
  };

  // Handle skipping phone number (optional)
  const handleSkipPhoneNumber = () => {
    if (pendingUserData) {
      setPendingUserData(null);
      
      setMessage({ text: "You can add your phone number later in settings.", type: "success" });
      
      // Complete setup without phone number
      completeUserSetup(pendingUserData);
    }
  };

  // Main Google login handler
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      console.log("=== GOOGLE LOGIN DEBUG START ===");
      console.log("Google credential response received");
      
      // Clear ALL previous tokens and user data
      const tokensToRemove = [
        "access_token",
        "temp_access_token", 
        "user_token",
        "admin_token",
        "superadmin_token",
        "user",
        "user_user",
        "user_admin", 
        "user_superadmin",
        "show_phone_modal",
        "phone_modal_user_data",
        "current_user_type"
      ];
      
      tokensToRemove.forEach(token => {
        localStorage.removeItem(token);
      });
      
      console.log("✓ Cleared all previous tokens and user data");

      // Make API call to backend
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google`, {
        id_token: credentialResponse.credential,
      });

      console.log("✓ Google login API response received");
      console.log("Response data:", response.data);

      // Prepare user data
      const userData = {
        ...response.data.data.user,
        access_token: response.data.access_token,
        user_type: response.data.data.user.user_type || "user"
      };

      console.log("✓ Prepared user data:");
      console.log("- User ID:", userData.id);
      console.log("- Email:", userData.email);
      console.log("- User type:", userData.user_type);
      console.log("- Has phone:", !!userData.phone_number);
      console.log("- Token length:", userData.access_token?.length);

      setMessage({ text: response.data.message, type: "success" });

      // Complete setup and redirect to dashboard
      // The dashboard will handle showing the phone modal if needed
      completeUserSetup(userData);
      
      console.log("=== GOOGLE LOGIN DEBUG END ===");

    } catch (error: any) {
      console.error("=== GOOGLE LOGIN ERROR ===");
      console.error("Error details:", error);
      console.error("Error response:", error.response?.data);
      console.error("=== GOOGLE LOGIN ERROR END ===");
      
      setMessage({
        text: error.response?.data?.message || "Google login failed. Please try again.",
        type: "error",
      });
    }
  };

  // Additional function to update user/token info manually if needed
  const updateUserAndToken = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = {
        ...response.data.data,
        access_token: token,
        user_type: response.data.data.user_type || "user"
      };

      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setMessage({ text: "User info updated successfully", type: "success" });
    } catch (error: any) {
      console.error("Error updating user info:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to update user info.",
        type: "error",
      });
    }
  };

  return { 
    handleGoogleLoginSuccess, 
    updateUserAndToken, 
    message,
    pendingUserData,
    handlePhoneNumberSuccess,
    handleSkipPhoneNumber
  };
};