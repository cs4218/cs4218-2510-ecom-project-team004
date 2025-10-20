// The code below is modified to add the ability to store snapshots of product details at the time of purchase and also to fix the quantity (total) discrepancy issue.
// The changes below is helped with GenAI suggestions.
import mongoose from "mongoose";

const orderItemV2Schema = new mongoose.Schema(
  {
    product: { type: mongoose.ObjectId, ref: "Products", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    // Snapshots to preserve historical accuracy (recommended)
    price: { type: Number, min: 0 },
    name: String,
  },
  { _id: false }
);

const orderV2Schema = new mongoose.Schema(
  {
    products: [orderItemV2Schema],
    payment: {},
    buyer: { type: mongoose.ObjectId, ref: "users", required: true },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true }
);

// Use a distinct collection name to avoid touching old data
export default mongoose.model("OrderV2", orderV2Schema, "orders_v2");
