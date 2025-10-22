import React, { useState, useContext, createContext, useEffect } from "react";
import PropTypes from "prop-types";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const existingCartItem = localStorage.getItem("cart");

    if (existingCartItem) {
      try {
        const parsedCart = JSON.parse(existingCartItem);

        // Validate before setting to state
        const sanitizedCart = validateCartData(parsedCart);

        setCart(sanitizedCart);

        // If data was changed, update localStorage
        if (sanitizedCart.length !== parsedCart.length) {
          localStorage.setItem("cart", JSON.stringify(sanitizedCart));
          console.warn("Local storage cart was sanitized and updated.");
        }
      } catch (error) {
        console.error("Invalid cart JSON, resetting cart to empty", error);
        setCart([]);
        localStorage.setItem("cart", JSON.stringify([]));
      }
    }
  }, []);

  const contextValue = React.useMemo(() => [cart, setCart], [cart]);

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

function validateCartData(rawData) {
  if (!Array.isArray(rawData)) {
    console.warn("Cart data is not an array. Resetting to empty.");
    return [];
  }

  return rawData.filter((item) => {
    if (
      item &&
      typeof item._id === "string" &&
      typeof item.name === "string" &&
      typeof item.price === "number" &&
      typeof item.quantity === "number"
    ) {
      return true;
    }
    console.warn("Invalid cart item removed:", item);
    return false;
  });
}

// Custom hook
const useCart = () => useContext(CartContext);
CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { useCart, CartProvider };
