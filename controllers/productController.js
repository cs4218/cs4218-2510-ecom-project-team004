import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

import mongoose from 'mongoose'; // ADDED2

dotenv.config();

// Braintree Gateway Configuration
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// Read photo safely
export const safeReadPhoto = (photo) => {
  if (!photo?.path) return null;
  try {
    return {
      data: fs.readFileSync(photo.path),
      contentType: photo.type,
    };
  } catch (err) {
    console.error("Failed to read photo:", err);
    return null;
  }
};

// Create product controller
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is required" });
      case !description:
        return res.status(400).send({ error: "Description is required" });
      case !price:
        return res.status(400).send({ error: "Price is required" });
      case !category:
        return res.status(400).send({ error: "Category is required" });
      case !quantity:
        return res.status(400).send({ error: "Quantity is required" });
      case photo && photo.size > 1000000:
        return res
          .status(400)
          .send({ error: "Photo is required and should be less then 1MB" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      const safePhoto = safeReadPhoto(photo);
      if (safePhoto) products.photo = safePhoto;
    }

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product created successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12) // Hardcoded
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      countTotal: products.length, // FIXED: counTotal --> countTotal
      message: "All Products",  // FIXED: ALlProducts --> AllProducts
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products", // FIXED: Erorr --> Error
      error: error.message,
    });
  }
};
// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    // FIXED: Added  
    // NOTE: Had help from an LLM
    // Check if product exists
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product", // FIXED: Eror while getitng single product --> Error while getting single product 
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    // ADDED2 
    // NOTE: Had help from an LLM
    // Validate ObjectId format
    const { pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await productModel.findById(req.params.pid).select("photo");


    // FIXED: Added  
    // NOTE: Had help from an LLM
    // Check if product exists
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // FIXED: Added "product.photo &&"
    if (product.photo && product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }

    // ADDED
    // NOTE: Had help from an LLM
    // Handle case where photo doesn't exist or has no data
    return res.status(404).send({
      success: false,
      message: "Photo not found for this product",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo", // FIXED: Erorr --> Error
      error,
    });
  }
};

// Delete product controller
export const deleteProductController = async (req, res) => {
  try {
    const deletedProduct = await productModel
      .findByIdAndDelete(req.params.pid)
      .select("-photo");

    if (!deletedProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

// Update product controller
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is required" });
      case !description:
        return res.status(400).send({ error: "Description is required" });
      case !price:
        return res.status(400).send({ error: "Price is required" });
      case !category:
        return res.status(400).send({ error: "Category is required" });
      case !quantity:
        return res.status(400).send({ error: "Quantity is required" });
      case photo && photo.size > 1000000:
        return res
          .status(400)
          .send({ error: "Photo is required and should be less then 1MB" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    if (!products) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (photo) {
      const safePhoto = safeReadPhoto(photo);
      if (safePhoto) products.photo = safePhoto;
    }

    await products.save();
    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    // const { checked, radio} = req.body; // FIXED: Added default values  NOTE: Had help from an LLM
    const body = req.body || {};
    const checked = Array.isArray(body.checked) ? body.checked : [];
    const radio = Array.isArray(body.radio) ? body.radio : [];

    let args = {};
    if (Array.isArray(checked) && checked.length > 0) args.category = { $in: checked }; // FIXED: checked --> { $in: checked } AND added "Array.isArray(checked) &&"   NOTE: Had help from an LLM
    // if (radio.length >= 2) args.price = { $gte: radio[0], $lte: radio[1] }; // FIXED: Added "radio.length >= 2"

    // FIXED: Added radio validation
    // NOTE: Had help from an LLM
    if (Array.isArray(radio) && radio.length >= 2) {
      const [minPrice, maxPrice] = radio;
      if (
        typeof minPrice === 'number' &&
        typeof maxPrice === 'number' &&
        !isNaN(minPrice) &&
        !isNaN(maxPrice) &&
        isFinite(minPrice) &&
        isFinite(maxPrice) &&
        minPrice >= 0 &&
        maxPrice >= minPrice
      ) {
        args.price = { $gte: minPrice, $lte: maxPrice };
      }
    }
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products", // FIXED: While Filtering Products --> while filtering products
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.estimatedDocumentCount(); // FIXED: removed ".find({})"
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    // const page = req.params.page ? req.params.page : 1;

    // FIXED: Consistent default handling using parseInt()
    // NOTE: Had help from an LLM
    //const page = parseInt(req.params.page) || 1;
    // ADDED2
    const rawPage = req.params.page;
    const page = parseInt(rawPage, 10);


    // FIXED: Validate page number (reject negative/zero)
    // NOTE: Had help from an LLM
    if (!rawPage || isNaN(page) || page < 1) { // ADDED2: !rawPage || isNaN(page)
      return res.status(400).send({
        success: false,
        message: "Invalid page number",
      });
    }

    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    // FIXED: Get total count for pagination UI    NOTE: Had help from an LLM
    const total = await productModel.countDocuments({});

    res.status(200).send({
      success: true,
      products,
      currentPage: page,                      // Current page number - ADDED
      totalPages: Math.ceil(total / perPage), // Total pages available - ADDED
      totalProducts: total,                   // Total product count - ADDED
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error,
    });
  }
};

// search product ---------------------------------------------- Think this has no bugs??
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in search product API", // FIXED: Error In Search Product API --> Error in search product API
      error,
    });
  }
};

// similar products ----------------------------------------------- Think this has no bugs?
export const realtedProductController = async (req, res) => {  // TYPO CAUSING BUG??? - Maybe leave for integration testing...
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ // For all these, I believe 500 error is better for server side?... But this just a design choice, not bug?
      success: false,
      message: "Error while getting related product",
      error, // And for all these, not safe to send the error object, just the message instead?... But this just a design choice, not bug?
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    // FIXED: Added category validation
    // NOTE: Had help from an LLM
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // FIXED: Pass only the _id
    // const products = await productModel.find({ category }).populate("category");
    const products = await productModel.find({ category: category._id }).populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error while getting products", // FIXED: Error While Getting products --> Error while getting products
    });
  }
};

// Payment Gateway API
// Generate Token
export const braintreeTokenController = async (req, res) => {
  try {
    const response = await new Promise((resolve, reject) => {
      gateway.clientToken.generate({}, (err, resp) => {
        if (err) reject(new Error(err));
        else resolve(resp);
      });
    });

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Failed to generate token" });
  }
};

// Process Payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;

    // Validate cart existence and non-empty
    if (!cart || cart.length === 0)
      return res.status(400).send({ error: "Cart cannot be empty" });

    // Validate nonce
    if (!nonce || typeof nonce !== "string" || nonce.trim() === "") {
      return res.status(400).send({ error: "Payment nonce required" });
    }

    // Validate each price in the cart
    for (const item of cart) {
      const price = Number(item.price);

      // Must be a valid number and non-negative
      if (isNaN(price) || price < 0) {
        return res.status(400).send({ error: "Invalid price in cart" });
      }
    }

    // Calculate total amount
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    // Round to 2 decimal places to avoid floating point issues
    const roundedTotal = Math.round((total + Number.EPSILON) * 100) / 100;
    // Convert to string with 2 decimal places (Braintree requirement)
    const amountAsString = roundedTotal.toFixed(2);

    // Call Braintree API to process payment
    gateway.transaction.sale(
      {
        amount: amountAsString,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async (error, result) => {
        if (error) {
          return res.status(500).send({ error: error.message });
        }

        if (!result.success) {
          return res.status(500).send({
            error: "Transaction failed",
            details: result,
          });
        }

        try {
          await new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();

          return res.json({ ok: true });
        } catch (dbError) {
          console.error("Database error while saving order:", dbError);
          return res.status(500).send({ error: "Failed to save order" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
