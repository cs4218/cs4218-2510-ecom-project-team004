import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import productRoutes from '../../routes/productRoutes.js';
import Product from '../../models/productModel.js';
import Category from '../../models/categoryModel.js';
import User from '../../models/userModel.js';

// NOTE: The test setup was written with the help of an LLM

let mongoServer;
let testAdmin, testUser, testCategory, testProduct, testProduct2;

const app = express();
app.use(express.json());
app.use('/api', productRoutes);

// Helper function to extract products from any response structure
function getProductsFromResponse(body) {
  if (Array.isArray(body)) {
    return body;
  } else if (body.products && Array.isArray(body.products)) {
    return body.products;
  } else if (body.data && Array.isArray(body.data)) {
    return body.data;
  } else if (body.success !== undefined && Array.isArray(body.products)) {
    return body.products;
  } else {
    return [];
  }
}

// Helper to check success flag flexibly
function getSuccessFromResponse(body) {
  if (body.success !== undefined) {
    return body.success;
  }
  return true;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  // Clean up any existing data
  await Product.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});

  // Create test users with all required fields
  testAdmin = await User.create({
    name: 'Test Admin',
    email: 'testadmin@example.com',
    password: 'password123',
    role: 1,
    answer: 'test security answer',
    address: '123 Test Street', 
    phone: '1234567890'
  });

  testUser = await User.create({
    name: 'Test User', 
    email: 'testuser@example.com',
    password: 'password123',
    role: 0,
    answer: 'test security answer',
    address: '456 User Avenue',
    phone: '0987654321'
  });

  // Create test category
  testCategory = await Category.create({
    name: 'Test Electronics',
    slug: 'test-electronics',
    description: 'Test category for integration testing'
  });

  // Create test products
  testProduct = await Product.create({
    name: 'Test Product One',
    slug: 'test-product-one',
    description: 'First test product for integration testing',
    price: 100,
    category: testCategory._id,
    quantity: 10,
    shipping: true,
  });

  testProduct2 = await Product.create({
    name: 'Test Product Two',
    slug: 'test-product-two', 
    description: 'Second test product for integration testing',
    price: 200,
    category: testCategory._id,
    quantity: 5,
    shipping: false,
  });
});

afterEach(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});
});

describe('Product Routes Integration Tests', () => {
  describe('GET /api/get-product - Get All Products', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return all products with correct structure', async () => {
      const response = await request(app)
        .get('/api/get-product')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products).toHaveLength(2);

      // Verify product structure
      expect(response.body.products[0]).toHaveProperty('name');
      expect(response.body.products[0]).toHaveProperty('slug');
      expect(response.body.products[0]).toHaveProperty('price');
      expect(response.body.products[0]).toHaveProperty('category');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return empty array when no products exist', async () => {
      await Product.deleteMany({});

      const response = await request(app)
        .get('/api/get-product')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return products with correct names', async () => {
      const response = await request(app)
        .get('/api/get-product')
        .expect(200);

      const products = getProductsFromResponse(response.body);
      const productNames = products.map(p => p.name);
      expect(productNames).toContain('Test Product One');
      expect(productNames).toContain('Test Product Two');
    });
  });

  describe('GET /api/get-product/:slug - Get Single Product', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return product by valid slug', async () => {
      const response = await request(app)
        .get('/api/get-product/test-product-one')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.product.slug).toBe('test-product-one');
      expect(response.body.product.name).toBe('Test Product One');
      expect(response.body.product.price).toBe(100);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for non-existent product slug', async () => {
      const response = await request(app)
        .get('/api/get-product/non-existent-slug')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Product not found');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle special characters in slug', async () => {
      const specialProduct = await Product.create({
        name: 'Special Product',
        slug: 'special-product-123',
        description: 'Product with special slug',
        price: 150,
        category: testCategory._id,
        quantity: 3,
        shipping: true,
      });

      const response = await request(app)
        .get('/api/get-product/special-product-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.product.slug).toBe('special-product-123');
    });
  });

  describe('GET /api/product-count - Product Count', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return correct product count', async () => {
      const response = await request(app)
        .get('/api/product-count')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return zero when no products exist', async () => {
      await Product.deleteMany({});

      const response = await request(app)
        .get('/api/product-count')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/product-list/:page - Pagination', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return paginated products for valid page', async () => {
      const response = await request(app)
        .get('/api/product-list/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle page boundary values', async () => {
      const testCases = [
        { page: '1', expectedStatus: 200 },
        { page: '0', expectedStatus: 400 },
        { page: '2', expectedStatus: 200 },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .get(`/api/product-list/${testCase.page}`)
          .expect(testCase.expectedStatus);

        const expectedSuccess = testCase.expectedStatus === 200;
        expect(response.body.success).toBe(expectedSuccess);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle invalid page parameters', async () => {
      const invalidCases = [
        { page: '-1', expectedStatus: 400 },
        { page: 'abc', expectedStatus: 400 },
      ];

      for (const testCase of invalidCases) {
        const response = await request(app)
          .get(`/api/product-list/${testCase.page}`)
          .expect(testCase.expectedStatus);

        if (testCase.page === 'abc') {
          expect(response.body.success).toBe(false);
        } else {
          expect(response.body.success).toBe(false);
        }
      }
    });
  });

  describe('POST /api/product-filters - Product Filtering', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should filter by price range', async () => {
      const response = await request(app)
        .post('/api/product-filters')
        .send({ checked: [], radio: [50, 150] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].price).toBe(100);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should filter by category', async () => {
      const response = await request(app)
        .post('/api/product-filters')
        .send({ checked: [testCategory._id.toString()], radio: [] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle combined category and price filters', async () => {
      const response = await request(app)
        .post('/api/product-filters')
        .send({
          checked: [testCategory._id.toString()],
          radio: [150, 250]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].price).toBe(200);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return all products when no filters applied', async () => {
      const response = await request(app)
        .post('/api/product-filters')
        .send({ checked: [], radio: [] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should filter products by price range using helper', async () => {
      const filters = {
        checked: [testCategory._id.toString()],
        radio: [0, 150]
      };

      const response = await request(app)
        .post('/api/product-filters')
        .send(filters)
        .expect(200);

      const products = getProductsFromResponse(response.body);
      const success = getSuccessFromResponse(response.body);
      
      expect(success).toBe(true);
      expect(products).toHaveLength(1);
      expect(products[0].price).toBe(100);
    });
  });

  describe('GET /api/search/:keyword - Product Search', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should find products by name keyword', async () => {
      const response = await request(app)
        .get('/api/search/Product')
        .expect(200);

      expect(Array.isArray(response.body.products) || Array.isArray(response.body)).toBe(true);
      const products = Array.isArray(response.body.products) ? response.body.products : response.body;
      expect(products.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should find products by description keyword', async () => {
      const response = await request(app)
        .get('/api/search/integration')
        .expect(200);

      const products = Array.isArray(response.body.products) ? response.body.products : response.body;
      expect(products.length).toBeGreaterThan(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return empty results for non-matching keyword', async () => {
      const response = await request(app)
        .get('/api/search/nonexistentkeyword')
        .expect(200);

      const products = Array.isArray(response.body.products) ? response.body.products : response.body;
      expect(products.length).toBe(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle empty search keyword', async () => {
      const response = await request(app)
        .get('/api/search/')
        .expect(404);

      const products = Array.isArray(response.body.products) ? response.body.products : response.body;
      expect(Array.isArray(products)).toBe(false);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should search products using helper functions', async () => {
      const response = await request(app)
        .get('/api/search/Test')
        .expect(200);

      const products = getProductsFromResponse(response.body);
      const success = getSuccessFromResponse(response.body);
      
      expect(success).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/related-product/:pid/:cid - Related Products', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return related products excluding current product', async () => {
      const response = await request(app)
        .get(`/api/related-product/${testProduct._id}/${testCategory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.products)).toBe(true);

      const returnedIds = response.body.products.map(p => p._id.toString());
      expect(returnedIds).toContain(testProduct2._id.toString());
      expect(returnedIds).not.toContain(testProduct._id.toString());
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle case with no related products', async () => {
      const uniqueCategory = await Category.create({
        name: 'Unique Category',
        slug: 'unique-category'
      });

      const uniqueProduct = await Product.create({
        name: 'Unique Product',
        slug: 'unique-product',
        description: 'Standalone product',
        price: 300,
        category: uniqueCategory._id,
        quantity: 1,
        shipping: true
      });

      const response = await request(app)
        .get(`/api/related-product/${uniqueProduct._id}/${uniqueCategory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return related products using helper functions', async () => {
      const response = await request(app)
        .get(`/api/related-product/${testProduct._id}/${testCategory._id}`)
        .expect(200);

      const products = getProductsFromResponse(response.body);
      const success = getSuccessFromResponse(response.body);
      
      expect(success).toBe(true);
      expect(Array.isArray(products)).toBe(true);
      
      const returnedIds = products.map(p => p._id.toString());
      if (products.length > 0) {
        expect(returnedIds).not.toContain(testProduct._id.toString());
      }
    });
  });

  describe('GET /api/product-category/:slug - Category Products', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return products by category slug', async () => {
      const response = await request(app)
        .get('/api/product-category/test-electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.category.slug).toBe('test-electronics');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products).toHaveLength(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/product-category/non-existent-category')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Category not found');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return category products using helper functions', async () => {
      const response = await request(app)
        .get(`/api/product-category/${testCategory.slug}`)
        .expect(200);

      const products = getProductsFromResponse(response.body);
      const success = getSuccessFromResponse(response.body);
      
      expect(success).toBe(true);
      expect(products).toHaveLength(2);
    });
  });

  describe('GET /api/product-photo/:pid - Product Photo', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for product without photo', async () => {
      const response = await request(app)
        .get(`/api/product-photo/${testProduct._id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/product-photo/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle invalid product ID format', async () => {
      const response = await request(app)
        .get('/api/product-photo/invalid-id-format')
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should handle database connection errors gracefully', async () => {
      await mongoose.disconnect();

      const response = await request(app)
        .get('/api/get-product')
        .expect(500);

      expect(response.body.success).toBe(false);

      await mongoose.connect(mongoServer.getUri());
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/product-filters')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(undefined);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle invalid product ID format', async () => {
      const response = await request(app)
        .get('/api/product-photo/invalid-id')
        .expect(400);

      if (response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle empty database gracefully', async () => {
      await Product.deleteMany({});
      
      const response = await request(app)
        .get('/api/get-product')
        .expect(200);

      const products = getProductsFromResponse(response.body);
      expect(products).toHaveLength(0);
    });
  });

  describe('Combinatorial Testing - Filter Combinations', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should handle all filter combinations correctly', async () => {
      const testCombinations = [
        { categories: [], prices: [] },
        { categories: [testCategory._id.toString()], prices: [] },
        { categories: [], prices: [0, 1000] },
        { categories: [testCategory._id.toString()], prices: [150, 250] },
      ];

      for (const combination of testCombinations) {
        const response = await request(app)
          .post('/api/product-filters')
          .send({
            checked: combination.categories,
            radio: combination.prices
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.products)).toBe(true);
      }
    });
  });
});