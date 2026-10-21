import { toast } from "sonner";

export const showAddToCartToast = (product, quantity = 1) => {
  const name = product?.name || "Item";
  const qtyText = quantity > 1 ? `${quantity}x ` : "";
  toast.success(`Added ${qtyText}${name} to your bag`, {
    description: product?.price
      ? typeof product.price === "number"
        ? `₦${product.price.toLocaleString()}`
        : `${product.price}`
      : undefined,
  });
};

export const showWishlistToast = (product, isAdded) => {
  const name = product?.name || "Item";
  if (isAdded) {
    toast.success(`Added ${name} to your wishlist`);
  } else {
    toast.info(`Removed ${name} from your wishlist`);
  }
};

export default {
  showAddToCartToast,
  showWishlistToast,
};
