import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const fetchUser = async (): Promise<User> => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No token found");

  // try {
  //   const { data } = await axios.get("http://127.0.0.1:7001/api/v1/users/me", {
  //     headers: { Authorization: `Bearer ${token}` },
  // https://ridesmashbiz.com
  //   });
  
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.setItem("user", JSON.stringify(data));
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      throw new Error("Unauthorized");
    }
    throw error;
  }
};

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  const { data: user, error, isFetching } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!token || error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      // Redirect only if not already on an auth-related route
      if (!["/sign-in", "/sign-up"].includes(location.pathname)) {
        navigate("/sign-up");
      }
    }
  }, [token, error, navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/sign-in");
  };

  return { user, isFetching, handleLogout };
};
