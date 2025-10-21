import express from "express";
import categoryModel from "../models/categoryModel.js";
const router = express.Router();

router.post("/reset", async (req, res) => {
  try {
    await categoryModel.deleteMany({});
    await categoryModel.insertMany([
      { name: "Clothing", slug: "clothing" },
      { name: "Electronics", slug: "electronics" },
      { name: "Toys", slug: "toys" },
    ]);
    res.status(200).send({ success: true });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});

export default router;
