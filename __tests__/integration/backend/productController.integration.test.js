import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../../../models/productModel.js';
import Category from '../../../models/categoryModel.js';
import {
  getProductController,
  getSingleProductController,
  productCountController,
  productListController,
  productFiltersController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  productPhotoController
} from '../../../controllers/productController.js';

// NOTE: The test setup was written with the help of an LLM


let mongoServer;
let testCategory;
let testProduct;
let testProduct2;

const createMockReqRes = () => {
  const req = {
    params: {},
    body: {},
    query: {}
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return { req, res };
};

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
  testCategory = await Category.create({
    name: 'Test Electronics',
    slug: 'test-electronics',
    description: 'Test category description'
  });

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
});

describe('Product Controller Integration Tests', () => {
  describe('getProductController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return all products with populated category data', async () => {
      const { req, res } = createMockReqRes();

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      
      // Integration: verify category was populated from DB
      expect(response.products[0].category).toHaveProperty('name');
      expect(response.products[0].category).toHaveProperty('slug');
      expect(response.products[0].category.name).toBe('Test Electronics');
      
      // Verify sorting works with newest first
      const firstProductId = response.products[0]._id.toString();
      expect(firstProductId).toBe(testProduct2._id.toString());
    });

    // NOTE: The test below was written with the help of an LLM
    test('should exclude photo field in response', async () => {
      const { req, res } = createMockReqRes();

      await getProductController(req, res);

      const response = res.send.mock.calls[0][0];
      response.products.forEach(product => {
        // When .select("-photo") is used, the field doesn't exist at all
        const productObj = product.toObject ? product.toObject() : product;
        expect('photo' in productObj).toBe(false);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return empty array when no products exist', async () => {
      await Product.deleteMany({});
      const { req, res } = createMockReqRes();

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      expect(response.products).toHaveLength(0);
    });
  });

  describe('getSingleProductController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return product by slug with populated category', async () => {
      const { req, res } = createMockReqRes();
      req.params.slug = 'test-product-one';

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      
      // Integration: verify correct product was retrieved
      expect(response.product._id.toString()).toBe(testProduct._id.toString());
      expect(response.product.slug).toBe('test-product-one');
      
      // Integration: verify category was populated from DB
      expect(response.product.category._id.toString()).toBe(testCategory._id.toString());
      expect(response.product.category.name).toBe('Test Electronics');
      
      // Verify photo excluded
      const productObj = response.product.toObject ? response.product.toObject() : response.product;
      expect('photo' in productObj).toBe(false);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for non-existent product slug', async () => {
      const { req, res } = createMockReqRes();
      req.params.slug = 'non-existent-slug';

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      const response = res.send.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('Product not found');
    });
  });

  describe('productCountController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return accurate count from database', async () => {
      const { req, res } = createMockReqRes();

      await productCountController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify actual DB count
      const dbCount = await Product.countDocuments();
      expect(response.total).toBe(dbCount);
      expect(response.total).toBe(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return zero when no products exist', async () => {
      await Product.deleteMany({});
      const { req, res } = createMockReqRes();

      await productCountController(req, res);

      const response = res.send.mock.calls[0][0];
      const dbCount = await Product.countDocuments();
      expect(response.total).toBe(dbCount);
      expect(response.total).toBe(0);
    });
  });

  describe('productListController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return correct products for page 1 with pagination metadata', async () => {
      const { req, res } = createMockReqRes();
      req.params.page = '1';

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify pagination data
      expect(response.currentPage).toBe(1);
      expect(response.totalProducts).toBe(2);
      expect(response.totalPages).toBe(1);
      
      // Verify sorting works with newest first
      expect(response.products[0]._id.toString()).toBe(testProduct2._id.toString());
      expect(response.products).not.toHaveProperty('photo');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle pagination correctly with multiple pages', async () => {
      // Create 8 more products (so 10 total and perPage=6 means 2 pages)
      const promises = [];
      for (let i = 3; i <= 10; i++) {
        promises.push(Product.create({
          name: `Product ${i}`,
          slug: `product-${i}`,
          description: `Description ${i}`,
          price: i * 10,
          category: testCategory._id,
          quantity: 5,
          shipping: true
        }));
      }
      await Promise.all(promises);

      // Test page 1
      const { req: req1, res: res1 } = createMockReqRes();
      req1.params.page = '1';
      await productListController(req1, res1);
      const response1 = res1.send.mock.calls[0][0];
      
      expect(response1.products).toHaveLength(6);
      expect(response1.totalProducts).toBe(10);
      expect(response1.totalPages).toBe(2);

      // Test page 2
      const { req: req2, res: res2 } = createMockReqRes();
      req2.params.page = '2';
      await productListController(req2, res2);
      const response2 = res2.send.mock.calls[0][0];
      
      expect(response2.products).toHaveLength(4);
      expect(response2.currentPage).toBe(2);
      
      // Verify pages don't overlap
      const page1Ids = response1.products.map(p => p._id.toString());
      const page2Ids = response2.products.map(p => p._id.toString());
      const intersection = page1Ids.filter(id => page2Ids.includes(id));
      expect(intersection).toHaveLength(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should reject invalid page numbers', async () => {
      const invalidPages = ['0', '-1', 'abc', null, undefined];
      
      for (const invalidPage of invalidPages) {
        const { req, res } = createMockReqRes();
        req.params.page = invalidPage;

        await productListController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        const response = res.send.mock.calls[0][0];
        expect(response.success).toBe(false);
        expect(response.message).toBe("Invalid page number");
      }
    });
  });

  describe('productFiltersController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should filter by price range and return only matching products', async () => {
      const { req, res } = createMockReqRes();
      req.body = { checked: [], radio: [50, 150] };

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify only products in price range returned
      expect(response.products).toHaveLength(1);
      expect(response.products[0]._id.toString()).toBe(testProduct._id.toString());
      expect(response.products[0].price).toBe(100);
      
      // Integration: Verify the other product was excluded
      const returnedIds = response.products.map(p => p._id.toString());
      expect(returnedIds).not.toContain(testProduct2._id.toString());
    });

    // NOTE: The test below was written with the help of an LLM
    test('should filter by category and verify all products belong to that category', async () => {
      // Create another category with a product
      const otherCategory = await Category.create({
        name: 'Other Category',
        slug: 'other-category'
      });
      const otherProduct = await Product.create({
        name: 'Other Product',
        slug: 'other-product',
        description: 'Product in different category',
        price: 150,
        category: otherCategory._id,
        quantity: 5,
        shipping: true
      });

      const { req, res } = createMockReqRes();
      req.body = { checked: [testCategory._id.toString()], radio: [] };

      await productFiltersController(req, res);

      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify products from testCategory are returned
      expect(response.products).toHaveLength(2);
      response.products.forEach(product => {
        expect(product.category.toString()).toBe(testCategory._id.toString());
      });
      
      // Integration: Verify other product excluded
      const returnedIds = response.products.map(p => p._id.toString());
      expect(returnedIds).not.toContain(otherProduct._id.toString());
    });

    // NOTE: The test below was written with the help of an LLM
    test('should filter by both category and price range', async () => {
      const { req, res } = createMockReqRes();
      req.body = {
        checked: [testCategory._id.toString()],
        radio: [150, 250]
      };

      await productFiltersController(req, res);

      const response = res.send.mock.calls[0][0];
      
      // Only testProduct2 matches both filters
      expect(response.products).toHaveLength(1);
      expect(response.products[0]._id.toString()).toBe(testProduct2._id.toString());
      expect(response.products[0].price).toBe(200);
      expect(response.products[0].category.toString()).toBe(testCategory._id.toString());
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return all products when no filters applied', async () => {
      const { req, res } = createMockReqRes();
      req.body = { checked: [], radio: [] };

      await productFiltersController(req, res);

      const response = res.send.mock.calls[0][0];
      expect(response.products).toHaveLength(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle invalid price ranges gracefully', async () => {
      const { req, res } = createMockReqRes();
      req.body = { checked: [], radio: [-10, 50] };

      await productFiltersController(req, res);

      const response = res.send.mock.calls[0][0];
      // Invalid range should be ignored, returns all products
      expect(response.products).toHaveLength(2);
    });
  });

  describe('searchProductController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should find products by name with case-insensitive search', async () => {
      const { req, res } = createMockReqRes();
      req.params = { keyword: 'PRODUCT' };

      await searchProductController(req, res);

      const results = res.json.mock.calls[0][0];
      expect(results).toHaveLength(2);
      
      // Integration: Verify both products contain the keyword
      results.forEach(product => {
        expect(product.name.toLowerCase()).toContain('product');
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should find products by description keyword', async () => {
      const { req, res } = createMockReqRes();
      req.params = { keyword: 'integration' };

      await searchProductController(req, res);

      const results = res.json.mock.calls[0][0];
      expect(results.length).toBeGreaterThan(0);
      
      // Integration: Verify results contain keyword in description
      results.forEach(product => {
        const matchFound = 
          product.name.toLowerCase().includes('integration') ||
          product.description.toLowerCase().includes('integration');
        expect(matchFound).toBe(true);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return empty array for non-matching keyword', async () => {
      const { req, res } = createMockReqRes();
      req.params = { keyword: 'xyznonexistent' };

      await searchProductController(req, res);

      const results = res.json.mock.calls[0][0];
      expect(results).toHaveLength(0);
    });
  });

  describe('realtedProductController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return products from same category excluding current product', async () => {
      const { req, res } = createMockReqRes();
      req.params.pid = testProduct._id.toString();
      req.params.cid = testCategory._id.toString();

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify only related products returned
      expect(response.products).toHaveLength(1);
      expect(response.products[0]._id.toString()).toBe(testProduct2._id.toString());
      
      // Integration: Verify current product excluded
      const returnedIds = response.products.map(p => p._id.toString());
      expect(returnedIds).not.toContain(testProduct._id.toString());
      
      // Integration: Verify category populated
      expect(response.products[0].category).toHaveProperty('name');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return empty array when no related products exist', async () => {
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

      const { req, res } = createMockReqRes();
      req.params.pid = uniqueProduct._id.toString();
      req.params.cid = uniqueCategory._id.toString();

      await realtedProductController(req, res);

      const response = res.send.mock.calls[0][0];
      expect(response.products).toHaveLength(0);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should limit related products to maximum of 3', async () => {
      // Create 4 more products (6 total in category)
      const promises = [];
      for (let i = 3; i <= 6; i++) {
        promises.push(Product.create({
          name: `Product ${i}`,
          slug: `product-${i}`,
          description: `Description ${i}`,
          price: i * 50,
          category: testCategory._id,
          quantity: 5,
          shipping: true
        }));
      }
      await Promise.all(promises);

      const { req, res } = createMockReqRes();
      req.params.pid = testProduct._id.toString();
      req.params.cid = testCategory._id.toString();

      await realtedProductController(req, res);

      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify that a max of 3 products are returned
      expect(response.products.length).toBeLessThanOrEqual(3);
      expect(response.products.length).toBe(3);
      
      // Integration: Verify current product not in results
      const returnedIds = response.products.map(p => p._id.toString());
      expect(returnedIds).not.toContain(testProduct._id.toString());
    });

    // NOTE: The test below was written with the help of an LLM
    test('should only return products from specified category', async () => {
      // Create product in different category
      const otherCategory = await Category.create({
        name: 'Other Category',
        slug: 'other-category'
      });
      const otherProduct = await Product.create({
        name: 'Other Product',
        slug: 'other-product',
        description: 'Different category',
        price: 150,
        category: otherCategory._id,
        quantity: 5,
        shipping: true
      });

      const { req, res } = createMockReqRes();
      req.params.pid = testProduct._id.toString();
      req.params.cid = testCategory._id.toString();

      await realtedProductController(req, res);

      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify only products from testCategory returned
      response.products.forEach(product => {
        expect(product.category._id.toString()).toBe(testCategory._id.toString());
      });
      
      // Integration: Verify other category product excluded
      const returnedIds = response.products.map(p => p._id.toString());
      expect(returnedIds).not.toContain(otherProduct._id.toString());
    });
  });

  describe('productCategoryController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return all products for given category with populated data', async () => {
      const { req, res } = createMockReqRes();
      req.params.slug = 'test-electronics';

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify category returned
      expect(response.category._id.toString()).toBe(testCategory._id.toString());
      expect(response.category.slug).toBe('test-electronics');
      
      // Integration: Verify all products belong to this category
      expect(response.products).toHaveLength(2);
      response.products.forEach(product => {
        expect(product.category._id.toString()).toBe(testCategory._id.toString());
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should only return products from specified category', async () => {
      // Create another category with products
      const otherCategory = await Category.create({
        name: 'Other Electronics',
        slug: 'other-electronics'
      });
      await Product.create({
        name: 'Other Product',
        slug: 'other-product',
        description: 'Different category',
        price: 150,
        category: otherCategory._id,
        quantity: 5,
        shipping: true
      });

      const { req, res } = createMockReqRes();
      req.params.slug = 'test-electronics';

      await productCategoryController(req, res);

      const response = res.send.mock.calls[0][0];
      
      // Integration: Verify only products from test-electronics
      expect(response.products).toHaveLength(2);
      
      // Integration: Verify all returned products are from correct category
      const dbProducts = await Product.find({ 
        category: testCategory._id 
      });
      expect(response.products.length).toBe(dbProducts.length);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for non-existent category', async () => {
      const { req, res } = createMockReqRes();
      req.params.slug = 'non-existent-category';

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      const response = res.send.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('Category not found');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return empty array for category with no products', async () => {
      const emptyCategory = await Category.create({
        name: 'Empty Category',
        slug: 'empty-category'
      });

      const { req, res } = createMockReqRes();
      req.params.slug = 'empty-category';

      await productCategoryController(req, res);

      const response = res.send.mock.calls[0][0];
      expect(response.category._id.toString()).toBe(emptyCategory._id.toString());
      expect(response.products).toHaveLength(0);
    });
  });

  describe('productPhotoController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for product without photo', async () => {
      const { req, res } = createMockReqRes();
      req.params.pid = testProduct._id.toString();

      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      const response = res.send.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('Photo not found');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res } = createMockReqRes();
      req.params.pid = fakeId.toString();

      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      const response = res.send.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('Product not found');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return 400 for invalid product ID format', async () => {
      const { req, res } = createMockReqRes();
      req.params.pid = 'invalid-id-format';

      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.send.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.message).toContain('Invalid product ID');
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return photo data with correct content type', async () => {
      const photoData = Buffer.from('fake-image-data-12345');
      const productWithPhoto = await Product.create({
        name: 'Product With Photo',
        slug: 'product-with-photo',
        description: 'Has a photo',
        price: 250,
        category: testCategory._id,
        quantity: 3,
        shipping: true,
        photo: {
          data: photoData,
          contentType: 'image/jpeg'
        }
      });

      const { req, res } = createMockReqRes();
      req.params.pid = productWithPhoto._id.toString();

      await productPhotoController(req, res);

      // Verify correct headers set
      expect(res.set).toHaveBeenCalledWith('Content-type', 'image/jpeg');
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify actual photo data sent (compare Buffer contents)
      const sentData = res.send.mock.calls[0][0];
      expect(Buffer.isBuffer(sentData)).toBe(true);
      expect(sentData.toString()).toBe(photoData.toString());
      expect(sentData.length).toBe(photoData.length);
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle product with empty photo data', async () => {
      const productWithEmptyPhoto = await Product.create({
        name: 'Product With Empty Photo',
        slug: 'product-empty-photo',
        description: 'Has empty photo',
        price: 250,
        category: testCategory._id,
        quantity: 3,
        shipping: true,
        photo: {
          data: null,
          contentType: 'image/jpeg'
        }
      });

      const { req, res } = createMockReqRes();
      req.params.pid = productWithEmptyPhoto._id.toString();

      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      const response = res.send.mock.calls[0][0];
      expect(response.message).toContain('Photo not found');
    });
  });
});