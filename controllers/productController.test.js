import { jest } from '@jest/globals';

import {
  getProductController,
  getSingleProductController,
  productPhotoController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,

} from '../controllers/productController.js';

// NOTE: The test setup was written with the help of an LLM

// Mock dependencies
jest.mock('../models/productModel.js');
jest.mock('../models/categoryModel.js');

import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';

describe('productController Tests', () => {

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterAll(() => {
    console.error.mockRestore();
    console.log.mockRestore();
    console.warn.mockRestore();
  });

  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      fields: {},
      files: {},
      params: {},
      body: {},
      user: { _id: 'testUser' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('getProductController', () => {
    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should get products successfully', async () => {
        const mockResults = [
          { _id: '1', name: 'Product 1' },
          { _id: '2', name: 'Product 2' }
        ];

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockResults)
        };

        productModel.find.mockReturnValue(mockQuery);

        await getProductController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(mockQuery.populate).toHaveBeenCalledWith('category');
        expect(mockQuery.select).toHaveBeenCalledWith('-photo');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          countTotal: 2,
          message: 'All Products',
          products: mockResults
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle empty products list', async () => {
        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue([])
        };

        productModel.find.mockReturnValue(mockQuery);

        await getProductController(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          countTotal: 0,
          message: 'All Products',
          products: []
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return correctly spelled response properties', async () => {
        const mockResults = [
          { _id: '1', name: 'Product 1' },
          { _id: '2', name: 'Product 2' }
        ];

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockResults)
        };

        productModel.find.mockReturnValue(mockQuery);

        await getProductController(mockReq, mockRes);

        const responseCall = mockRes.send.mock.calls[0][0];

        expect(responseCall).toHaveProperty('countTotal');
        expect(responseCall.countTotal).toBe(2);
        expect(responseCall.message).toBe('All Products');
      });

      // NOTE: The test below was written with the help of an LLM
      test('should match expected response structure snapshot', async () => {
        const mockResults = [
          { _id: '1', name: 'Product 1' }
        ];

        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockResults)
        };

        productModel.find.mockReturnValue(mockQuery);

        await getProductController(mockReq, mockRes);

        const response = mockRes.send.mock.calls[0][0];

        // This will fail if any keys are misspelled
        expect(Object.keys(response).sort()).toEqual([
          'countTotal',
          'message',
          'products',
          'success'
        ].sort());
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle database error', async () => {
        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockRejectedValue(new Error('Database error'))
        };

        productModel.find.mockReturnValue(mockQuery);

        await getProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error in getting products',
          error: 'Database error'
        });
      });
    });
  });

  describe('getSingleProductController', () => {
    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should get single product by slug', async () => {
        mockReq.params.slug = 'test-product';
        const mockProduct = { _id: '1', name: 'Test Product', slug: 'test-product' };

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findOne.mockReturnValue(mockQuery);

        await getSingleProductController(mockReq, mockRes);

        expect(productModel.findOne).toHaveBeenCalledWith({ slug: 'test-product' });
        expect(mockQuery.select).toHaveBeenCalledWith('-photo');
        expect(mockQuery.populate).toHaveBeenCalledWith('category');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          message: 'Single Product Fetched',
          product: mockProduct
        });
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle database error', async () => {
        mockReq.params.slug = 'test-product';

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          populate: jest.fn().mockRejectedValue(new Error('Database error'))
        };

        productModel.findOne.mockReturnValue(mockQuery);

        await getSingleProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error while getting single product',
          error: expect.any(Error)
        });
      });

      // NOTE: The test below was written with the help of an LLM
      // Test case for non-existent product (should return 404)
      test('should return 404 when product is not found', async () => {
        mockReq.params.slug = 'nonexistent-product';

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(null)
        };

        productModel.findOne.mockReturnValue(mockQuery);

        await getSingleProductController(mockReq, mockRes);

        expect(productModel.findOne).toHaveBeenCalledWith({ slug: 'nonexistent-product' });
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Product not found'
        });
      });
      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when product is undefined', async () => {
        mockReq.params.slug = 'undefined-product';

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(undefined)
        };

        productModel.findOne.mockReturnValue(mockQuery);

        await getSingleProductController(mockReq, mockRes);

        expect(productModel.findOne).toHaveBeenCalledWith({ slug: 'undefined-product' });
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Product not found'
        });
      });
    });
  });

  describe('productPhotoController', () => {
    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should return photo when it exists', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: {
            data: Buffer.from('image-data'),
            contentType: 'image/jpeg'
          }
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(productModel.findById).toHaveBeenCalledWith('product123');
        expect(mockQuery.select).toHaveBeenCalledWith('photo');
        expect(mockRes.set).toHaveBeenCalledWith('Content-type', 'image/jpeg');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith(Buffer.from('image-data'));
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle product with no photo data', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: {
            data: null,
            contentType: 'image/jpeg'
          }
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.set).not.toHaveBeenCalled();
        expect(mockRes.send).not.toHaveBeenCalledWith(expect.any(Buffer));
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle database error', async () => {
        mockReq.params.pid = 'product123';

        const mockQuery = {
          select: jest.fn().mockRejectedValue(new Error('Database error'))
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error while getting photo',
          error: expect.any(Error)
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when product is not found (null)', async () => {
        mockReq.params.pid = 'nonexistent123';

        const mockQuery = {
          select: jest.fn().mockResolvedValue(null)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(productModel.findById).toHaveBeenCalledWith('nonexistent123');
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Product not found"
        });
        expect(mockRes.set).not.toHaveBeenCalled();
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when product is undefined', async () => {
        mockReq.params.pid = 'undefined-product';

        const mockQuery = {
          select: jest.fn().mockResolvedValue(undefined)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Product not found"
        });
      });
      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when product.photo is null', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: null
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Photo not found for this product"
        });
        expect(mockRes.set).not.toHaveBeenCalled();
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when product.photo is undefined', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          // photo property doesn't exist
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Photo not found for this product"
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when photo exists but data is missing', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: {
            contentType: 'image/jpeg'
            // data property doesn't exist
          }
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Photo not found for this product"
        });
      });
      test('should return 404 when photo.data is null', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: {
            data: null,
            contentType: 'image/jpeg'
          }
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Photo not found for this product"
        });
        expect(mockRes.set).not.toHaveBeenCalled();
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when photo.data is empty string', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: {
            data: '',
            contentType: 'image/jpeg'
          }
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Photo not found for this product"
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when photo.data is undefined', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: {
            data: undefined,
            contentType: 'image/jpeg'
          }
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Photo not found for this product"
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when photo.data is false', async () => {
        mockReq.params.pid = 'product123';
        const mockProduct = {
          photo: {
            data: false,
            contentType: 'image/jpeg'
          }
        };

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockProduct)
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: "Photo not found for this product"
        });
      });
      // NOTE: The test below was written with the help of an LLM
      test('should handle invalid ObjectId format', async () => {
        mockReq.params.pid = 'invalid-id-format';

        const mockQuery = {
          select: jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'))
        };

        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error while getting photo',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('productFiltersController', () => {
    // NOTE: The test below was written with the help of an LLM
    describe('Filter Combinations', () => { // Decision Table Testing!
      const testCases = [
        {
          name: 'no filters',
          input: { checked: [], radio: [] },
          expectedArgs: {}
        },
        {
          name: 'category filter only',
          input: { checked: ['cat1', 'cat2'], radio: [] },
          expectedArgs: { category: { $in: ['cat1', 'cat2'] } }
        },
        {
          name: 'price filter only',
          input: { checked: [], radio: [100, 200] },
          expectedArgs: { price: { $gte: 100, $lte: 200 } }
        },
        {
          name: 'both filters',
          input: { checked: ['cat1'], radio: [50, 150] },
          expectedArgs: {
            category: { $in: ['cat1'] },
            price: { $gte: 50, $lte: 150 }
          }
        }
      ];

      // NOTE: The test below was written with the help of an LLM
      test.each(testCases)('should handle $name', async ({ input, expectedArgs }) => {
        mockReq.body = input;
        const mockProducts = [{ _id: '1', name: 'Product 1' }];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith(expectedArgs);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          products: mockProducts
        });
      });
    });

    describe('Validation for req.body properties', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle undefined checked and radio', async () => {
        mockReq.body = {}; // No checked or radio properties
        const mockProducts = [{ _id: '1', name: 'Product 1' }];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle null checked value', async () => {
        mockReq.body = { checked: null, radio: [] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle null radio value', async () => {
        mockReq.body = { checked: [], radio: null };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle completely missing req.body', async () => {
        mockReq.body = undefined;
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });
    describe('radio.length check edge cases', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should not apply price filter with empty radio array', async () => {
        mockReq.body = { checked: [], radio: [] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should not apply price filter with single element radio array', async () => {
        mockReq.body = { checked: [], radio: [100] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        // Should not include price filter since we need min AND max
        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should apply price filter only with exactly 2 elements', async () => {
        mockReq.body = { checked: [], radio: [100, 200] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          price: { $gte: 100, $lte: 200 }
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should apply price filter only with exactly 2 elements', async () => {
        mockReq.body = { checked: [], radio: [100, 200] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          price: { $gte: 100, $lte: 200 }
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle radio array with more than 2 elements', async () => {
        mockReq.body = { checked: [], radio: [100, 200, 300] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        // Should only use first two elements
        expect(productModel.find).toHaveBeenCalledWith({
          price: { $gte: 100, $lte: 200 }
        });
      });
    });

    describe('Category filter operator usage', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should use $in operator for single category', async () => {
        mockReq.body = { checked: ['electronics'], radio: [] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          category: { $in: ['electronics'] }
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should use $in operator for multiple categories', async () => {
        mockReq.body = { checked: ['electronics', 'books', 'clothing'], radio: [] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          category: { $in: ['electronics', 'books', 'clothing'] }
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should work correctly with both category and price filters using $in', async () => {
        mockReq.body = {
          checked: ['electronics', 'books'],
          radio: [50, 100]
        };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          category: { $in: ['electronics', 'books'] },
          price: { $gte: 50, $lte: 100 }
        });
      });
    });

    describe('Data sanitization for price values', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should reject negative minimum price', async () => {
        mockReq.body = { checked: [], radio: [-100, 200] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        // Should not apply invalid price filter
        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should reject negative maximum price', async () => {
        mockReq.body = { checked: [], radio: [100, -200] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should reject when min price is greater than max price', async () => {
        mockReq.body = { checked: [], radio: [300, 100] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should reject string price values', async () => {
        mockReq.body = { checked: [], radio: ['100', '200'] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should reject NaN price values', async () => {
        mockReq.body = { checked: [], radio: [NaN, 200] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should reject Infinity price values', async () => {
        mockReq.body = { checked: [], radio: [100, Infinity] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({});
      });

      // NOTE: The test below was written with the help of an LLM
      test('should accept valid zero as minimum price', async () => {
        mockReq.body = { checked: [], radio: [0, 100] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          price: { $gte: 0, $lte: 100 }
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should accept equal min and max prices', async () => {
        mockReq.body = { checked: [], radio: [100, 100] };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          price: { $gte: 100, $lte: 100 }
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle object injection attempts in radio array', async () => {
        mockReq.body = {
          checked: [],
          radio: [{ $gt: 0 }, { $lt: 1000 }]
        };
        const mockProducts = [];
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(mockReq, mockRes);

        // Should reject non-number values
        expect(productModel.find).toHaveBeenCalledWith({});
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle database error during filtering', async () => {
        mockReq.body = { checked: ['cat1'], radio: [100, 200] };
        productModel.find.mockRejectedValue(new Error('Database error'));

        await productFiltersController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error while filtering products',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('productCountController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return product count successfully', async () => {
      productModel.estimatedDocumentCount.mockResolvedValue(42);

      await productCountController(mockReq, mockRes);

      expect(productModel.estimatedDocumentCount).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        total: 42
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle count error', async () => {
      const mockError = new Error('Count failed');
      productModel.estimatedDocumentCount.mockRejectedValue(mockError);

      await productCountController(mockReq, mockRes);

      expect(productModel.estimatedDocumentCount).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Error in product count',
        error: mockError,
        success: false
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should return zero when collection is empty', async () => {
      productModel.estimatedDocumentCount.mockResolvedValue(0);

      await productCountController(mockReq, mockRes);

      expect(productModel.estimatedDocumentCount).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        total: 0
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle database connection error', async () => {
      const dbError = new Error('Database connection failed');
      productModel.estimatedDocumentCount.mockRejectedValue(dbError);

      await productCountController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Error in product count',
        error: dbError,
        success: false
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('should handle large product counts', async () => {
      const largeCount = 1000000;
      productModel.estimatedDocumentCount.mockResolvedValue(largeCount);

      await productCountController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        total: largeCount
      });
    });
  });

  describe('productListController', () => {
    describe('Pagination', () => { // Equivalence Partitioning!
      // NOTE: The test below was written with the help of an LLM
      test('should handle first page (default)', async () => {
        mockReq.params = {};
        const mockProducts = Array(6).fill().map((_, i) => ({ _id: i, name: `Product ${i}` }));

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockProducts)
        };

        productModel.find.mockReturnValue(mockQuery);

        await productListController(mockReq, mockRes);

        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(6);
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle specific page number', async () => {
        mockReq.params.page = '3';
        const mockProducts = [];

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockProducts)
        };

        productModel.find.mockReturnValue(mockQuery);

        await productListController(mockReq, mockRes);

        expect(mockQuery.skip).toHaveBeenCalledWith(12); // (3-1) * 6
        expect(mockQuery.limit).toHaveBeenCalledWith(6);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should default to page 1 when page is null', async () => {
        mockReq.params.page = null;
        const mockProducts = [];

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockProducts)
        };

        productModel.find.mockReturnValue(mockQuery);
        productModel.countDocuments.mockResolvedValue(0);

        await productListController(mockReq, mockRes);

        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockRes.send).toHaveBeenCalledWith(
          expect.objectContaining({
            currentPage: 1
          })
        );
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle decimal page numbers by parsing to integer', async () => {
        mockReq.params.page = '2.7';
        const mockProducts = [];

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockProducts)
        };

        productModel.find.mockReturnValue(mockQuery);
        productModel.countDocuments.mockResolvedValue(0);

        await productListController(mockReq, mockRes);

        // parseInt('2.7') = 2, so skip should be (2-1) * 6 = 6
        expect(mockQuery.skip).toHaveBeenCalledWith(6);
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      test('should handle invalid page number gracefully', async () => {
        mockReq.params.page = 'invalid';
        const mockProducts = [];

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockProducts)
        };

        productModel.find.mockReturnValue(mockQuery);

        await productListController(mockReq, mockRes);

        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle pagination error', async () => {
        mockReq.params.page = '2';

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockRejectedValue(new Error('Pagination failed'))
        };

        productModel.find.mockReturnValue(mockQuery);

        await productListController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error in per page ctrl',
          error: expect.any(Error)
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle error when counting total products', async () => {
        mockReq.params.page = '1';

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue([])
        };

        productModel.find.mockReturnValue(mockQuery);
        productModel.countDocuments.mockRejectedValue(new Error('Count failed'));

        await productListController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error in per page ctrl',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('searchProductController', () => {
    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle empty search results', async () => {
        mockReq.params.keyword = 'nonexistent';

        const mockQuery = {
          select: jest.fn().mockResolvedValue([])
        };

        productModel.find.mockReturnValue(mockQuery);

        await searchProductController(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith([]);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle search with special characters', async () => { // Boundary Value Analysis?
        mockReq.params.keyword = 'test-product!@#';
        const mockResults = [];

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockResults)
        };

        productModel.find.mockReturnValue(mockQuery);

        await searchProductController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          $or: [
            { name: { $regex: 'test-product!@#', $options: 'i' } },
            { description: { $regex: 'test-product!@#', $options: 'i' } }
          ]
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle empty keyword search', async () => {
        mockReq.params.keyword = '';
        const mockResults = [];

        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockResults)
        };

        productModel.find.mockReturnValue(mockQuery);

        await searchProductController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          $or: [
            { name: { $regex: '', $options: 'i' } },
            { description: { $regex: '', $options: 'i' } }
          ]
        });
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle search database error', async () => {
        mockReq.params.keyword = 'test';

        const mockQuery = {
          select: jest.fn().mockRejectedValue(new Error('Search failed'))
        };

        productModel.find.mockReturnValue(mockQuery);

        await searchProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error in search product API',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('realtedProductController', () => { // Is the controller being misspelled causing any bugs?
    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should find related products excluding current product', async () => {
        mockReq.params = { pid: 'product123', cid: 'category456' };
        const mockProducts = [
          { _id: 'product789', name: 'Related Product 1' },
          { _id: 'product101', name: 'Related Product 2' }
        ];

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(mockProducts)
        };

        productModel.find.mockReturnValue(mockQuery);

        await realtedProductController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({
          category: 'category456',
          _id: { $ne: 'product123' }
        });
        expect(mockQuery.select).toHaveBeenCalledWith('-photo');
        expect(mockQuery.limit).toHaveBeenCalledWith(3);
        expect(mockQuery.populate).toHaveBeenCalledWith('category');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          products: mockProducts
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle no related products found', async () => {
        mockReq.params = { pid: 'product123', cid: 'category456' };

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue([])
        };

        productModel.find.mockReturnValue(mockQuery);

        await realtedProductController(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          products: []
        });
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle related products database error', async () => {
        mockReq.params = { pid: 'product123', cid: 'category456' };

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          populate: jest.fn().mockRejectedValue(new Error('Related products failed'))
        };

        productModel.find.mockReturnValue(mockQuery);

        await realtedProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error while getting related product',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('productCategoryController', () => {
    describe('Category-based Product Retrieval', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should get products by category successfully', async () => {
        mockReq.params.slug = 'electronics';
        const mockCategory = { _id: 'cat123', name: 'Electronics', slug: 'electronics' };
        const mockProducts = [
          { _id: 'prod1', name: 'Laptop', category: 'cat123' },
          { _id: 'prod2', name: 'Phone', category: 'cat123' }
        ];

        categoryModel.findOne.mockResolvedValue(mockCategory);
        const mockQuery = {
          populate: jest.fn().mockResolvedValue(mockProducts)
        };
        productModel.find.mockReturnValue(mockQuery);

        await productCategoryController(mockReq, mockRes);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
        expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory._id }); // *
        expect(mockQuery.populate).toHaveBeenCalledWith('category');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          category: mockCategory,
          products: mockProducts
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle category not found', async () => {
        mockReq.params.slug = 'nonexistent-category';
        categoryModel.findOne.mockResolvedValue(null);

        await productCategoryController(mockReq, mockRes);

        expect(productModel.find).not.toHaveBeenCalled(); 
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,  
          message: 'Category not found'
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should pass only category._id to find()', async () => {
        mockReq.params.slug = 'electronics';
        const mockCategory = {
          _id: 'cat123',
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic items'
        };
        const mockProducts = [
          { _id: 'prod1', name: 'Laptop', category: 'cat123' }
        ];

        categoryModel.findOne.mockResolvedValue(mockCategory);
        const mockQuery = {
          populate: jest.fn().mockResolvedValue(mockProducts)
        };
        productModel.find.mockReturnValue(mockQuery);

        await productCategoryController(mockReq, mockRes);

        // FIX: Should pass only the _id
        expect(productModel.find).toHaveBeenCalledWith({
          category: mockCategory._id // Correct!
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          category: mockCategory,
          products: mockProducts
        });
      });

      test('should clearly differentiate: category not found vs no products', async () => {
        // Scenario 1: Category doesn't exist
        mockReq.params.slug = 'nonexistent';
        categoryModel.findOne.mockResolvedValue(null);

        await productCategoryController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Category not found'
        });

        // Reset mocks
        mockRes.status.mockClear();
        mockRes.send.mockClear();

        // Scenario 2: Category exists but no products
        mockReq.params.slug = 'empty-category';
        const mockCategory = { _id: 'cat789', name: 'Empty Category', slug: 'empty-category' };
        categoryModel.findOne.mockResolvedValue(mockCategory);
        const mockQuery = {
          populate: jest.fn().mockResolvedValue([])
        };
        productModel.find.mockReturnValue(mockQuery);

        await productCategoryController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          category: mockCategory,
          products: [] // Clear distinction: success with empty products
        });
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle category lookup error', async () => {
        mockReq.params.slug = 'electronics';
        categoryModel.findOne.mockRejectedValue(new Error('Category lookup failed'));

        await productCategoryController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          error: expect.any(Error),
          message: 'Error while getting products'
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle products lookup error', async () => {
        mockReq.params.slug = 'electronics';
        const mockCategory = { _id: 'cat123', name: 'Electronics' };
        categoryModel.findOne.mockResolvedValue(mockCategory);

        const mockQuery = {
          populate: jest.fn().mockRejectedValue(new Error('Products lookup failed'))
        };
        productModel.find.mockReturnValue(mockQuery);

        await productCategoryController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          error: expect.any(Error),
          message: 'Error while getting products'
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should return 404 when category is not found', async () => {
        mockReq.params.slug = 'nonexistent-category';
        categoryModel.findOne.mockResolvedValue(null);

        await productCategoryController(mockReq, mockRes);

        // FIX: Should not call productModel.find at all
        expect(productModel.find).not.toHaveBeenCalled();
        // FIX: Should return 404 with proper error message
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Category not found'
        });
      });
    });
  });
});