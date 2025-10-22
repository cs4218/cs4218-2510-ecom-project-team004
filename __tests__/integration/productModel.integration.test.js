import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../../models/productModel.js';
import Category from '../../models/categoryModel.js';

// NOTE: The test setup was written with the help of an LLM

let mongoServer;
let testCategory;
let testProduct;
let testProduct2;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 30000);

afterAll(async () => {
  // Clean up and close connections
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  // Seed fresh test data before each test
  testCategory = await Category.create({
    name: 'Test Electronics Integration',
    slug: 'test-electronics-integration',
  });

  testProduct = await Product.create({
    name: 'Test Product Integration',
    slug: 'test-product-integration',
    description: 'Test description for integration testing',
    price: 100,
    category: testCategory._id,
    quantity: 10,
    shipping: true,
  });

  testProduct2 = await Product.create({
    name: 'Test Product 2 Integration',
    slug: 'test-product-2-integration',
    description: 'Another test product for integration testing',
    price: 200,
    category: testCategory._id,
    quantity: 5,
    shipping: false,
  });
});

afterEach(async () => {
  // Clean up after each test
  await Product.deleteMany({});
  await Category.deleteMany({});
});

describe('Product Model Database Integration Tests', () => {

  // Basic CRUD Operations

  // NOTE: The test below was written with the help of an LLM
  test('should persist product in database', async () => {
    const product = new Product({
      name: 'Test Product Save',
      slug: 'test-product-save',
      description: 'A great product',
      price: 100,
      category: testCategory._id,
      quantity: 10,
      shipping: true,
    });

    const saved = await product.save();
    // Integration: Verify the product was actually saved to database
    const found = await Product.findById(saved._id);
    expect(found).not.toBeNull();
    expect(found.name).toBe('Test Product Save');
  });

  // NOTE: The test below was written with the help of an LLM
  test('should retrieve all products from database', async () => {
    const products = await Product.find({});
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe('Test Product Integration');
    expect(products[1].name).toBe('Test Product 2 Integration');
  });

  // Database Constraints

  // NOTE: The test below was written with the help of an LLM
  test('should enforce unique slug constraint at database level', async () => {
    const product1 = new Product({
      name: 'First Product',
      slug: 'duplicate-slug',
      description: 'First',
      price: 100,
      category: testCategory._id,
      quantity: 5,
      shipping: true,
    });

    const product2 = new Product({
      name: 'Second Product',
      slug: 'duplicate-slug', // same slug
      description: 'Second',
      price: 150,
      category: testCategory._id,
      quantity: 3,
      shipping: false,
    });

    await product1.save();
    await expect(product2.save()).rejects.toThrow(/duplicate key error/);
  });

  // Database Relationships

  // NOTE: The test below was written with the help of an LLM
  test('should maintain category reference integrity', async () => {
    const productWithCategory = await Product.findById(testProduct._id)
      .populate('category')
      .exec();

    expect(productWithCategory.category).toBeDefined();
    expect(productWithCategory.category._id.toString()).toBe(testCategory._id.toString());
    expect(productWithCategory.category.name).toBe('Test Electronics Integration');
  });

  // NOTE: The test below was written with the help of an LLM
  test('should find products by category reference', async () => {
    const products = await Product.find({ category: testCategory._id });
    expect(products).toHaveLength(2);
    products.forEach(product => {
      expect(product.category.toString()).toBe(testCategory._id.toString());
    });
  });

  // Database Queries and Filtering

  // NOTE: The test below was written with the help of an LLM
  test('should filter products by price range', async () => {
    const expensiveProducts = await Product.find({ price: { $gte: 150 } });
    expect(expensiveProducts).toHaveLength(1);
    expect(expensiveProducts[0].name).toBe('Test Product 2 Integration');

    const affordableProducts = await Product.find({ price: { $lte: 150 } });
    expect(affordableProducts).toHaveLength(1);
    expect(affordableProducts[0].name).toBe('Test Product Integration');
  });

  // NOTE: The test below was written with the help of an LLM
  test('should find product by slug', async () => {
    const foundProduct = await Product.findOne({ slug: 'test-product-integration' });
    expect(foundProduct).not.toBeNull();
    expect(foundProduct.name).toBe('Test Product Integration');
    expect(foundProduct.price).toBe(100);
  });

  // Update Operations

  // NOTE: The test below was written with the help of an LLM
  test('should update product and persist changes', async () => {
    const updatedName = 'Updated Product Name';
    const updatedPrice = 150;

    const updated = await Product.findByIdAndUpdate(
      testProduct._id,
      { name: updatedName, price: updatedPrice },
      { new: true, runValidators: true }
    );

    expect(updated.name).toBe(updatedName);
    expect(updated.price).toBe(updatedPrice);

    // Verify update persisted to database
    const found = await Product.findById(testProduct._id);
    expect(found.name).toBe(updatedName);
    expect(found.price).toBe(updatedPrice);
  });

  // NOTE: The test below was written with the help of an LLM
  test('should enforce unique constraint during update', async () => {
    // Try to update testProduct2 to have same slug as testProduct
    await expect(
      Product.findByIdAndUpdate(
        testProduct2._id,
        { slug: testProduct.slug }, // Duplicate slug
        { new: true }
      )
    ).rejects.toThrow(/duplicate key error/);
  });

  // Delete Operations

  // NOTE: The test below was written with the help of an LLM
  test('should delete product from database', async () => {
    await Product.findByIdAndDelete(testProduct._id);
    const found = await Product.findById(testProduct._id);
    expect(found).toBeNull();

    // Verify other product still exists
    const remainingProducts = await Product.find({});
    expect(remainingProducts).toHaveLength(1);
    expect(remainingProducts[0]._id.toString()).toBe(testProduct2._id.toString());
  });

  // Database-level Validations

  // NOTE: The test below was written with the help of an LLM
  test('should reject documents missing required fields', async () => {
    const product = new Product({
      slug: 'missing-fields',
      price: 100,
      quantity: 5,
      category: testCategory._id,
      // Missing: name, description (required fields)
    });

    await expect(product.save()).rejects.toThrow();
  });

  // NOTE: The test below was written with the help of an LLM
  test('should enforce minimum values at database level', async () => {
    const negativePriceProduct = new Product({
      name: 'Negative Price',
      slug: 'negative-price',
      description: 'Test',
      price: -10,
      category: testCategory._id,
      quantity: 5,
      shipping: false,
    });

    await expect(negativePriceProduct.save()).rejects.toThrow();

    const negativeQuantityProduct = new Product({
      name: 'Negative Quantity',
      slug: 'negative-quantity',
      description: 'Test',
      price: 50,
      category: testCategory._id,
      quantity: -3,
      shipping: false,
    });

    await expect(negativeQuantityProduct.save()).rejects.toThrow();
  });

  // Complex Database Operations

  // NOTE: The test below was written with the help of an LLM
  test('should handle bulk operations', async () => {
    const newProducts = [
      {
        name: 'Bulk Product 1',
        slug: 'bulk-product-1',
        description: 'First bulk product',
        price: 50,
        category: testCategory._id,
        quantity: 10,
        shipping: true,
      },
      {
        name: 'Bulk Product 2',
        slug: 'bulk-product-2',
        description: 'Second bulk product',
        price: 75,
        category: testCategory._id,
        quantity: 15,
        shipping: false,
      }
    ];

    const createdProducts = await Product.create(newProducts);
    expect(createdProducts).toHaveLength(2);

    const allProducts = await Product.find({});
    expect(allProducts).toHaveLength(4); // 2 original + 2 new
  });
});