// The code below is modified to fix the cart context to properly handle cart data migration between guest and authenticated users.
// The previous implementation didn't handle the cart context correctly when transition between guest and authenticated user, leading to incorrect cart data persistence (Milestone 1: Unit Tests).
// The changes below is helped with GenAI suggestions.
import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "./auth";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [auth] = useAuth();

  const storageKey = useMemo(
    () => (auth?.user?._id ? `cart:${auth.user._id}` : "cart:guest"),
    [auth?.user?._id]
  );

  const prevKeyRef = useRef(storageKey);

  useEffect(() => {
    const guestKey = "cart:guest";
    const raw = localStorage.getItem(storageKey);
    const legacyRaw = localStorage.getItem("cart"); // legacy global key
    const guestRaw = localStorage.getItem(guestKey);

    try {
      let parsed = raw ? JSON.parse(raw) : null;

      // Migrate legacy "cart" only if target key is empty and we are on guest
      if (!parsed && legacyRaw && storageKey === guestKey) {
        parsed = JSON.parse(legacyRaw);
        localStorage.removeItem("cart");
      }

      let sanitized = validateCartData(parsed || []);

      // If switching from guest -> user, merge guest items into user cart
      const wasGuest = prevKeyRef.current === guestKey;
      const nowUser = storageKey !== guestKey;
      if (wasGuest && nowUser) {
        const guest = validateCartData(guestRaw ? JSON.parse(guestRaw) : []);
        if (guest.length > 0) {
          const user = sanitized;
          sanitized = [...user, ...guest]; // CartPage will handle merging/conflicts
          localStorage.setItem(guestKey, JSON.stringify([])); // clear guest after merge
        }
      }

      setCart(sanitized);
    } catch (e) {
      console.error("Invalid cart JSON, resetting cart to empty", e);
      setCart([]);
      localStorage.setItem(storageKey, JSON.stringify([]));
    }

    prevKeyRef.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  const contextValue = useMemo(() => [cart, setCart], [cart]);

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

function isValidCartItem(item) {
  return (
    item &&
    typeof item._id === "string" &&
    typeof item.name === "string" &&
    (typeof item.price === "number" || typeof item.price === "string")
  );
}

function validateCartData(rawData) {
  if (!Array.isArray(rawData)) {
    console.warn("Cart data is not an array. Resetting to empty.");
    return [];
  }

  const result = [];
  for (const item of rawData) {
    if (isValidCartItem(item)) {
      const priceNum =
        typeof item.price === "number" ? item.price : Number(item.price);
      if (Number.isNaN(priceNum)) {
        console.warn("Invalid price in cart item removed:", item);
        continue;
      }
      const qty =
        typeof item.quantity === "number" && item.quantity > 0
          ? item.quantity
          : 1; // default to 1 if missing/invalid
      result.push({ ...item, price: priceNum, quantity: qty });
    } else {
      console.warn("Invalid cart item removed:", item);
    }
  }
  return result;
}

const useCart = () => useContext(CartContext);
CartProvider.propTypes = { children: PropTypes.node.isRequired };

export { useCart, CartProvider };
