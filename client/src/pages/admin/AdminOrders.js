import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminMenu from "../../components/AdminMenu";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select } from "antd";

const { Option } = Select;

const ORDER_STATUS = [
  "Not Process",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();

  const getOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-orders");
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      await axios.put(`/api/v1/auth/order-status/${orderId}`, {
        status: newStatus,
      });

      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
      console.error(error);
    }
  };

  return (
    <Layout title="All Orders Data">
      <div className="row dashboard">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h1 className="text-center">All Orders</h1>
          {orders.length === 0 ? (
            <p>No orders available</p>
          ) : (
            orders.map((order, index) => {
              const { _id, status, buyer, createdAt, payment, products } =
                order;

              return (
                <div className="border shadow mb-4" key={_id}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Status</th>
                        <th>Buyer</th>
                        <th>Date</th>
                        <th>Payment</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{index + 1}</td>
                        <td>
                          <Select
                            variant="outlined"
                            value={status}
                            onChange={(value) => handleChangeStatus(_id, value)}
                          >
                            {ORDER_STATUS.map((s) => (
                              <Option key={s} value={s}>
                                {s}
                              </Option>
                            ))}
                          </Select>
                        </td>
                        <td>{buyer?.name}</td>
                        <td>{moment(createdAt).fromNow()}</td>
                        <td>{payment?.success ? "Success" : "Failed"}</td>
                        <td>{products?.length}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="container">
                    {products?.map((p) => (
                      <div className="row mb-2 p-3 card flex-row" key={p._id}>
                        <div className="col-md-4">
                          <img
                            src={`/api/v1/product/product-photo/${p._id}`}
                            className="card-img-top"
                            alt={p.name}
                            width="100px"
                            height="100px"
                          />
                        </div>
                        <div className="col-md-8">
                          <p>{p.name}</p>
                          <p>{p.description.substring(0, 30)}</p>
                          <p>Price: {p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;
