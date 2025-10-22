// The code below is modified to show the correct date format and quantity (total) in the orders list.
// The previous implementation didn't show the date correctly and had issues calculating the total quantity of products in an order which has duplicated items. (Milestone 1: Unit Test).
// The changes below is helped with GenAI suggestions.
import React, { useState, useEffect } from "react";
import UserMenu from "../../components/UserMenu";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();

  // Use V2 endpoints when the flag is set
  const useV2 =
    String(process.env.REACT_APP_ORDERS_API_VERSION).toLowerCase() === "v2";

  const getOrders = async () => {
    try {
      const url = useV2 ? "/api/v1/auth/orders-v2" : "/api/v1/auth/orders";
      const { data } = await axios.get(url);
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const renderOrder = (o, i) => {
    // Detect line-item shape even if fetched from /orders
    const isLineItems =
      Array.isArray(o?.products) &&
      o.products.some((x) => x && typeof x === "object" && "product" in x);

    if (isLineItems) {
      const lines = Array.isArray(o.products) ? o.products : [];

      // Group by product id to merge duplicates
      const grouped = new Map();
      for (const l of lines) {
        const prod = l?.product || {};
        const pid =
          prod?._id || (typeof l?.product === "string" ? l.product : null);
        if (!pid) continue;

        const key = String(pid);
        const qty = Number(l?.quantity ?? 1);
        const name = prod?.name || l?.name || "Item";
        const desc = prod?.description || "";
        const price = l?.price ?? prod?.price ?? "-";

        if (!grouped.has(key)) {
          grouped.set(key, { pid, name, desc, price, quantity: qty });
        } else {
          grouped.get(key).quantity += qty;
        }
      }

      const groupedLines = Array.from(grouped.values());
      const totalQty = groupedLines.reduce(
        (s, g) => s + (Number(g.quantity) || 0),
        0
      );

      return (
        <div className="border shadow" key={o._id}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Status</th>
                <th scope="col">Buyer</th>
                <th scope="col">Date/Time</th>
                <th scope="col">Payment</th>
                <th scope="col">Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{i + 1}</td>
                <td>{o?.status}</td>
                <td>{o?.buyer?.name}</td>
                <td>
                  {o?.createdAt || o?.createAt
                    ? moment(o.createdAt || o.createAt).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )
                    : "-"}
                </td>
                <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                <td>{totalQty}</td>
              </tr>
            </tbody>
          </table>
          <div className="container">
            {groupedLines.map((g, idx) => (
              <div
                className="row mb-2 p-3 card flex-row"
                key={`${g.pid}-${idx}`}
              >
                <div className="col-md-4">
                  <img
                    src={`/api/v1/product/product-photo/${g.pid}`}
                    className="card-img-top"
                    alt={g.name}
                    width="100px"
                    height="100px"
                  />
                </div>
                <div className="col-md-8">
                  <p>{g.name}</p>
                  <p>{(g.desc || "").substring(0, 30)}</p>
                  <p>Price : {g.price}</p>
                  <p>Quantity: {g.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // V1 shape (array of product docs or ObjectIds)
    const productList = Array.isArray(o?.products) ? o.products : [];
    const totalQty = productList.length;

    return (
      <div className="border shadow" key={o._id}>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Status</th>
              <th scope="col">Buyer</th>
              <th scope="col">Date/Time</th>
              <th scope="col">Payment</th>
              <th scope="col">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{i + 1}</td>
              <td>{o?.status}</td>
              <td>{o?.buyer?.name}</td>
              <td>
                {o?.createdAt || o?.createAt
                  ? moment(o.createdAt || o.createAt).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )
                  : "-"}
              </td>
              <td>{o?.payment?.success ? "Success" : "Failed"}</td>
              <td>{totalQty}</td>
            </tr>
          </tbody>
        </table>
        <div className="container">
          {productList.map((p, idx) => {
            const pid = p?._id || p;
            const name = p?.name || "Item";
            const desc = (p?.description || "").substring(0, 30);
            const price = p?.price ?? "-";
            return (
              <div className="row mb-2 p-3 card flex-row" key={`${pid}-${idx}`}>
                <div className="col-md-4">
                  <img
                    src={`/api/v1/product/product-photo/${pid}`}
                    className="card-img-top"
                    alt={name}
                    width="100px"
                    height="100px"
                  />
                </div>
                <div className="col-md-8">
                  <p>{name}</p>
                  <p>{desc}</p>
                  <p>Price : {price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout title={"Your Orders"}>
      <div className="container-flui p-3 m-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center">All Orders</h1>
            {orders?.map((o, i) => renderOrder(o, i))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
