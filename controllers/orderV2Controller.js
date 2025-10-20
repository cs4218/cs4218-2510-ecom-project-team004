// This controller is added to manage correct order retrieval for users, especially to fix the quantity (total) discrepancy issue.
// The changes below is helped with GenAI suggestions.
import OrderV2 from "../models/orderV2Model.js";

function summarize(o) {
  const lines = Array.isArray(o?.products) ? o.products : [];
  const totalUnits = lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
  const totalAmount = lines.reduce(
    (s, l) =>
      s + Number(l.price ?? l.product?.price ?? 0) * Number(l.quantity || 0),
    0
  );
  return { ...o, products: lines, summary: { totalUnits, totalAmount } };
}

async function fetchV2(query) {
  const docs = await OrderV2.find(query)
    .populate("buyer", "name email")
    .populate("products.product")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(summarize);
}

export const getOrdersV2Controller = async (req, res) => {
  try {
    const data = await fetchV2({ buyer: req.user._id });
    res.json(data);
  } catch (e) {
    console.error("getOrdersV2Controller error:", e);
    res.status(500).send({ error: "Failed to fetch orders" });
  }
};
