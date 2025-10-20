import React, { useState, useEffect, useMemo } from "react";
import Layout from "./../components/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Merge cart items by _id and check for data consistency.
  // If same _id but different details, treat as separate items.
  // Each conflicting item gets a unique conflictKey to ensure stable keys in React.
  // Using GenAI to help write this merge cart logic.
  const mergedCart = useMemo(() => {
    const merged = [];

    const areDetailsSame = (a, b) =>
      a.name === b.name &&
      a.price === b.price &&
      a.description === b.description;

    for (const item of cart) {
      if (!item || !item._id) {
        console.warn("Invalid cart item detected:", item);
        continue;
      }

      const existingIndex = merged.findIndex((m) => m._id === item._id);

      if (existingIndex > -1) {
        const existing = merged[existingIndex];

        if (areDetailsSame(existing, item)) {
          // Merge quantities if product details match
          existing.userQuantity += 1;
        } else {
          // Handle conflict by adding as a separate entry
          console.error("Data mismatch for same product ID detected:", {
            existing,
            incoming: item,
          });

          // If the existing item doesn't already have a conflictKey, assign one now
          if (!existing.conflictKey) {
            existing.conflictKey = `${existing._id}-${Math.random()
              .toString(36)
              .substring(2, 9)}-0`;
          }

          // Add the new conflicting item with its own unique conflictKey
          merged.push({
            ...item,
            userQuantity: 1,
            conflictKey: `${item._id}-${Math.random()
              .toString(36)
              .substring(2, 9)}-${merged.length}`,
          });
        }
      } else {
        // First time seeing this item
        merged.push({ ...item, userQuantity: 1 });
      }
    }

    return merged;
  }, [cart]);

  // Total price calculation
  const totalPrice = useMemo(() => {
    try {
      let total = 0;
      for (const item of mergedCart) {
        const priceNum = Number(item.price) || 0;
        const qtyNum = Number(item.userQuantity);
        total += priceNum * qtyNum;
      }

      return total.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    } catch (error) {
      console.error("Error calculating total price:", error);
      return "$0.00";
    }
  }, [mergedCart]);

  // Total units (after merge)
  const totalUnits = useMemo(
    () =>
      mergedCart.reduce((sum, item) => sum + Number(item.userQuantity || 0), 0),
    [mergedCart]
  );

  // Remove one item at a time
  const removeCartItem = (pid) => {
    try {
      const index = cart.findLastIndex((item) => item._id === pid);

      if (index > -1) {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);

        setCart(updatedCart);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // The code below is modified to fix one of the error/warning that appeared during cart management integration tests.
  // The cause of error/warning was that the token fetching was being triggered even when the cart was empty or user was not authenticated.
  // Fetch Braintree client token only when authenticated and cart has items
  useEffect(() => {
    if (!auth?.token || mergedCart.length === 0) return;

    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/product/braintree/token");
        if (mounted) setClientToken(data?.clientToken || "");
      } catch (error) {
        console.log("Error fetching payment token:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [auth?.token, mergedCart.length]);

  // Handle payments
  const handlePayment = async () => {
    try {
      if (!instance) return;
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();

      const useV2 =
        String(process.env.REACT_APP_PAYMENT_API_VERSION).toLowerCase() ===
        "v2";

      let payloadCart;
      if (useV2) {
        // V2: grouped line items with quantity
        payloadCart = mergedCart.map((i) => ({
          _id: i._id,
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.userQuantity || 1),
        }));
      } else {
        // V1: flat list with one entry per unit
        payloadCart = mergedCart.flatMap((i) => {
          const qty = Number(i.userQuantity || 1);
          return Array.from({ length: qty }, () => ({
            _id: i._id,
            name: i.name,
            price: Number(i.price),
          }));
        });
      }

      const paymentUrl = useV2
        ? "/api/v1/product/braintree/payment-v2"
        : "/api/v1/product/braintree/payment";

      await axios.post(paymentUrl, { nonce, cart: payloadCart });
      setLoading(false);
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment Completed Successfully ");
    } catch (error) {
      console.log("Payment failed:", error);
      setLoading(false);
      toast.error("Payment failed. Please try again or check your details.");
    }
  };

  return (
    <Layout>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Hello Guest"
                : `Hello ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {mergedCart.length
                  ? (() => {
                      const loginMessage = auth?.token
                        ? ""
                        : "Please login to checkout!";
                      return `You Have ${totalUnits} total items ${loginMessage}`;
                    })()
                  : "Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>

        <div className="container">
          <div className="row">
            {/* Cart Items */}
            <div className="col-md-7 p-0 m-0">
              {mergedCart.map((p, index) => (
                <div
                  className="row card flex-row"
                  key={p.conflictKey || `${p._id}-${index}`}
                >
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      width="100%"
                      height={"130px"}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.name}</p>
                    <p>
                      {p.description?.substring(0, 30) ||
                        "No description available"}
                    </p>
                    <p>Price: {p.price}</p>
                    <p>Quantity: {p.userQuantity}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total: {totalPrice}</h4>

              {/* Address Section */}
              <div className="mb-3">
                {auth?.token ? (
                  <>
                    {auth?.user?.address && (
                      <>
                        <h4>Current Address</h4>
                        <h5>{auth.user.address}</h5>
                      </>
                    )}
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/login", { state: "/cart" })}
                  >
                    Please Login to checkout
                  </button>
                )}
              </div>

              {/* Payment Section */}
              <div className="mt-2">
                {!clientToken || !auth?.token || !mergedCart.length ? (
                  ""
                ) : (
                  <>
                    <DropIn
                      options={{
                        authorization: clientToken,
                        paypal: {
                          flow: "vault",
                        },
                      }}
                      onInstance={(instance) => setInstance(instance)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handlePayment}
                      disabled={loading || !instance || !auth?.user?.address}
                    >
                      {loading ? "Processing ...." : "Make Payment"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
