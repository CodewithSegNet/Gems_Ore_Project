import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
import storefrontApi from "../services/api";

const FavoritesContext = createContext();

const LOCAL_FAVS_KEY = "guest_favorite_ids";

// Helper to read guest favorites from localStorage
const getGuestFavs = () => {
  try {
    const raw = localStorage.getItem(LOCAL_FAVS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};
const saveGuestFavs = (ids) => {
  localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify([...ids]));
};

export const FavoritesProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch favorite IDs on login (or load from localStorage for guests)
  const fetchFavoriteIds = useCallback(async () => {
    if (!isAuthenticated) {
      // Load guest favorites from localStorage
      setFavoriteIds(getGuestFavs());
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
    setLoading(true);
    try {
      if (isAuthenticated) {
        const data = await storefrontApi.favorites.getAll();
        setFavoriteItems(data || []);
        setFavoriteIds(new Set((data || []).map((f) => f.product_id)));
      } else {
        // Guest mode: fetch product details for each stored favorite ID
        const guestIds = [...getGuestFavs()];
        if (guestIds.length === 0) {
          setFavoriteItems([]);
          return;
        }
        const items = await Promise.all(
          guestIds.map(async (pid) => {
            try {
              const p = await storefrontApi.products.getById(pid);
              return {
                id: pid,
                product_id: pid,
                product: {
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image || p.images?.[0]?.image_url || "",
                  video_url: p.video_url || null,
                  images: p.images,
                },
              };
            } catch {
              return null;
            }
          })
        );
        setFavoriteItems(items.filter(Boolean));
      }
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
    // Guest mode: toggle in localStorage only
    if (!isAuthenticated) {
      const isFav = favoriteIds.has(productId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(productId);
        else next.add(productId);
        saveGuestFavs(next);
        return next;
      });
      // Also optimistically update favoriteItems for the wishlist panel
      if (isFav) {
        setFavoriteItems((prev) => prev.filter((f) => f.product_id !== productId));
      }
      return true;
    }

    const isFav = favoriteIds.has(productId);
    // Optimistic update for IDs
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(productId);
      else next.add(productId);
      return next;
    });

    // Also optimistically update favoriteItems when removing
    if (isFav) {
      setFavoriteItems((prev) => prev.filter((f) => f.product_id !== productId));
    }

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
      // Re-fetch items to revert the list
      if (isFav) {
        fetchFavorites();
      }
      return false;
    }
  };

  const isFavorited = (productId) => favoriteIds.has(productId);

  const clearAllFavorites = async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setFavoriteItems([]);
      saveGuestFavs(new Set());
      return;
    }
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
