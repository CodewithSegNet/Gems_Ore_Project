import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
import storefrontApi from "../services/api";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch favorite IDs on login
  const fetchFavoriteIds = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setFavoriteItems([]);
      return;
    }
    try {
      const ids = await storefrontApi.favorites.getIds();
      setFavoriteIds(new Set(ids || []));
    } catch (e) {
      console.error("Failed to fetch favorite IDs:", e);
    }
  }, [isAuthenticated]);

  // Fetch full favorites with product details
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await storefrontApi.favorites.getAll();
      setFavoriteItems(data || []);
      setFavoriteIds(new Set((data || []).map((f) => f.product_id)));
    } catch (e) {
      console.error("Failed to fetch favorites:", e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavoriteIds();
  }, [fetchFavoriteIds]);

  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) return false;

    const isFav = favoriteIds.has(productId);
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (isFav) {
        await storefrontApi.favorites.remove(productId);
      } else {
        await storefrontApi.favorites.add(productId);
      }
      return true;
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(productId);
        else next.delete(productId);
        return next;
      });
      return false;
    }
  };

  const isFavorited = (productId) => favoriteIds.has(productId);

  const clearAllFavorites = async () => {
    if (!isAuthenticated) return;
    const currentIds = [...favoriteIds];
    const currentItems = [...favoriteItems];
    // Optimistic clear
    setFavoriteIds(new Set());
    setFavoriteItems([]);
    try {
      await Promise.all(currentIds.map((id) => storefrontApi.favorites.remove(id)));
    } catch (e) {
      console.error("Failed to clear all favorites:", e);
      // Revert on error
      setFavoriteIds(new Set(currentIds));
      setFavoriteItems(currentItems);
    }
  };

  const favoritesCount = favoriteIds.size;

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteItems,
        favoritesCount,
        loading,
        isFavorited,
        toggleFavorite,
        clearAllFavorites,
        fetchFavorites,
        fetchFavoriteIds,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
};

export default FavoritesContext;
