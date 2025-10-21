// This file is added to handle order-related routes in the application.
import express from "express";
import { getOrdersV2Controller } from "../controllers/orderV2Controller.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";
const router = express.Router();

// User orders
router.get("/orders-v2", requireSignIn, getOrdersV2Controller);

export default router;
