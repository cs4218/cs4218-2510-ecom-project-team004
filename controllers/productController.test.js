import { jest } from '@jest/globals';

import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController
} from '../controllers/productController.js';

// NOTE: The test setup was written with the help of an LLM

// Mock dependencies
jest.mock('../models/productModel.js');
jest.mock('../models/categoryModel.js');
jest.mock('../models/orderModel.js');
jest.mock('fs');
jest.mock('slugify');
jest.mock('braintree');

var mockGenerate, mockGateway;

jest.mock('braintree', () => {
    mockGenerate = jest.fn();
    // Add the transaction property with a sale method to your mockGateway
    mockGateway = {
        clientToken: {
            generate: mockGenerate,
        },
        transaction: { // <-- Add this
            sale: jest.fn(), // <-- And this
        },
    };

    return {
        BraintreeGateway: jest.fn().mockReturnValue(mockGateway),
        Environment: {
            Sandbox: 'Sandbox',
        },
    };
});

import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import orderModel from '../models/orderModel.js';
import fs from 'fs';
import slugify from 'slugify';
import braintree from 'braintree';

describe('productController Tests', () => {

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
    console.log.mockRestore();
    console.warn.mockRestore();
  });
  
  let mockReq, mockRes, mockNext;

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
    
    slugify.mockReturnValue('test-slug');
    fs.readFileSync.mockReturnValue(Buffer.from('test-image-data'));
  });

  describe('createProductController', () => {
    describe('Validation', () => {
      const validData = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100',
        category: 'category123',
        quantity: '10',
        shipping: 'true'
      };

      // Boundary Value Analysis for required fields
      describe('Required Fields Validation', () => {
        const requiredFields = ['name', 'description', 'price', 'category', 'quantity'];
        
        // NOTE: The test below was written with the help of an LLM
        test.each(requiredFields)('should return 500 when %s is missing', async (field) => {
          const invalidData = { ...validData };
          delete invalidData[field];
          mockReq.fields = invalidData;

          await createProductController(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.send).toHaveBeenCalledWith({
            error: expect.stringContaining('Required')
          });
        });

        // NOTE: The test below was written with the help of an LLM
        test.each(requiredFields)('should return 500 when %s is empty string', async (field) => {
          const invalidData = { ...validData, [field]: '' };
          mockReq.fields = invalidData;

          await createProductController(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.send).toHaveBeenCalledWith({
            error: expect.stringContaining('Required')
          });
        });
      });

      describe('Photo Size Validation', () => { // Boundary Value Analysis!
        // NOTE: The test below was written with the help of an LLM
        test('should accept photo with size exactly 1000000 bytes', async () => {
          mockReq.fields = validData;
          mockReq.files = {
            photo: {
              size: 1000000,
              path: '/test/path',
              type: 'image/jpeg'
            }
          };
          
          const mockProduct = {
            save: jest.fn().mockResolvedValue(true),
            photo: { data: null, contentType: null }
          };
          productModel.mockImplementation(() => mockProduct);

          await createProductController(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        // NOTE: The test below was written with the help of an LLM
        test('should reject photo with size 1000001 bytes (boundary + 1)', async () => {
          mockReq.fields = validData;
          mockReq.files = {
            photo: {
              size: 1000001,
              path: '/test/path',
              type: 'image/jpeg'
            }
          };

          await createProductController(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.send).toHaveBeenCalledWith({
            error: 'photo is Required and should be less then 1mb'
          });
        });

        // NOTE: The test below was written with the help of an LLM
        test('should accept product without photo', async () => {
          mockReq.fields = validData;
          
          const mockProduct = {
            save: jest.fn().mockResolvedValue(true),
            photo: { data: null, contentType: null }
          };
          productModel.mockImplementation(() => mockProduct);

          await createProductController(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(201);
        });
      });
    });

    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should create product successfully with photo', async () => {
        const validData = {
          name: 'Test Product',
          description: 'Test Description',
          price: '100',
          category: 'category123',
          quantity: '10'
        };
        
        mockReq.fields = validData;
        mockReq.files = {
          photo: {
            size: 50000,
            path: '/test/path',
            type: 'image/jpeg'
          }
        };
        
        const mockProduct = {
          save: jest.fn().mockResolvedValue(true),
          photo: { data: null, contentType: null }
        };
        productModel.mockImplementation(() => mockProduct);

        await createProductController(mockReq, mockRes);

        expect(slugify).toHaveBeenCalledWith('Test Product');
        expect(fs.readFileSync).toHaveBeenCalledWith('/test/path');
        expect(mockProduct.photo.data).toEqual(Buffer.from('test-image-data'));
        expect(mockProduct.photo.contentType).toBe('image/jpeg');
        expect(mockProduct.save).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(201);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should create product successfully without photo', async () => {
        const validData = {
          name: 'Test Product',
          description: 'Test Description',
          price: '100',
          category: 'category123',
          quantity: '10'
        };
        
        mockReq.fields = validData;
        
        const mockProduct = {
          save: jest.fn().mockResolvedValue(true),
          photo: { data: null, contentType: null }
        };
        productModel.mockImplementation(() => mockProduct);

        await createProductController(mockReq, mockRes);

        expect(fs.readFileSync).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle database save error', async () => {
        const validData = {
          name: 'Test Product',
          description: 'Test Description',
          price: '100',
          category: 'category123',
          quantity: '10'
        };
        
        mockReq.fields = validData;
        
        const mockProduct = {
          save: jest.fn().mockRejectedValue(new Error('Database error')),
          photo: { data: null, contentType: null }
        };
        productModel.mockImplementation(() => mockProduct);

        await createProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          error: expect.any(Error),
          message: 'Error in crearing product'
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle file system error', async () => {
        const validData = {
          name: 'Test Product',
          description: 'Test Description',
          price: '100',
          category: 'category123',
          quantity: '10'
        };
        
        mockReq.fields = validData;
        mockReq.files = {
          photo: {
            size: 50000,
            path: '/invalid/path',
            type: 'image/jpeg'
          }
        };
        
        const mockProduct = {
          save: jest.fn(),
          photo: { data: null, contentType: null }
        };
        productModel.mockImplementation(() => mockProduct);
        fs.readFileSync.mockImplementation(() => {
          throw new Error('File not found');
        });

        await createProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
      });
    });
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
          counTotal: 2,
          message: 'ALlProducts ',
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
          counTotal: 0,
          message: 'ALlProducts ',
          products: []
        });
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
          message: 'Erorr in getting products',
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

      // NOTE: The test below was written with the help of an LLM
      test('should handle product not found', async () => {
        mockReq.params.slug = 'nonexistent-product';
        
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(null)
        };
        
        productModel.findOne.mockReturnValue(mockQuery);

        await getSingleProductController(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          message: 'Single Product Fetched',
          product: null
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
          message: 'Eror while getitng single product',
          error: expect.any(Error)
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

      // NOTE: The test below was written with the help of an LLM
      test('should handle product not found', async () => {
        mockReq.params.pid = 'nonexistent';
        
        const mockQuery = {
          select: jest.fn().mockResolvedValue(null)
        };
        
        productModel.findById.mockReturnValue(mockQuery);

        await productPhotoController(mockReq, mockRes);

        expect(mockRes.set).not.toHaveBeenCalled();
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
          message: 'Erorr while getting photo',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('deleteProductController', () => {
    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should delete product successfully', async () => {
        mockReq.params.pid = 'product123';
        
        const mockQuery = {
          select: jest.fn().mockResolvedValue({ _id: 'product123' })
        };
        
        productModel.findByIdAndDelete.mockReturnValue(mockQuery);

        await deleteProductController(mockReq, mockRes);

        expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('product123');
        expect(mockQuery.select).toHaveBeenCalledWith('-photo');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          message: 'Product Deleted successfully'
        });
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle deletion of non-existent product', async () => {
        mockReq.params.pid = 'nonexistent';
        
        const mockQuery = {
          select: jest.fn().mockResolvedValue(null)
        };
        
        productModel.findByIdAndDelete.mockReturnValue(mockQuery);

        await deleteProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle database error during deletion', async () => {
        mockReq.params.pid = 'product123';
        
        const mockQuery = {
          select: jest.fn().mockRejectedValue(new Error('Database error'))
        };
        
        productModel.findByIdAndDelete.mockReturnValue(mockQuery);

        await deleteProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error while deleting product',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('updateProductController', () => {
    const validUpdateData = {
      name: 'Updated Product',
      description: 'Updated Description',
      price: '150',
      category: 'category456',
      quantity: '20'
    };

    describe('Validation', () => {
      const requiredFields = ['name', 'description', 'price', 'category', 'quantity'];
      
      // NOTE: The test below was written with the help of an LLM
      test.each(requiredFields)('should validate required field: %s', async (field) => {
        const invalidData = { ...validUpdateData };
        delete invalidData[field];
        mockReq.fields = invalidData;
        mockReq.params.pid = 'product123';

        await updateProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          error: expect.stringContaining('Required')
        });
      });

      // ----------------------------------------------------------------- Should further test the combinations of valid and invalid size and image type!
      // NOTE: The test below was written with the help of an LLM
      test('should validate photo size limit', async () => {
        mockReq.fields = validUpdateData;
        mockReq.params.pid = 'product123';
        mockReq.files = {
          photo: {
            size: 1500000,
            path: '/test/path',
            type: 'image/jpeg'
          }
        };

        await updateProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          error: 'photo is Required and should be less then 1mb'
        });
      });
    });

    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should update product successfully with photo', async () => {
        mockReq.fields = validUpdateData;
        mockReq.params.pid = 'product123';
        mockReq.files = {
          photo: {
            size: 50000,
            path: '/test/path',
            type: 'image/png'
          }
        };
        
        const mockProduct = {
          save: jest.fn().mockResolvedValue(true),
          photo: { data: null, contentType: null }
        };
        
        productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);

        await updateProductController(mockReq, mockRes);

        expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'product123',
          { ...validUpdateData, slug: 'test-slug' },
          { new: true }
        );
        expect(fs.readFileSync).toHaveBeenCalledWith('/test/path');
        expect(mockProduct.photo.contentType).toBe('image/png');
        expect(mockProduct.save).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(201);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should update product successfully without photo', async () => {
        mockReq.fields = validUpdateData;
        mockReq.params.pid = 'product123';
        
        const mockProduct = {
          save: jest.fn().mockResolvedValue(true),
          photo: { data: null, contentType: null }
        };
        
        productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);

        await updateProductController(mockReq, mockRes);

        expect(fs.readFileSync).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle update error', async () => {
        mockReq.fields = validUpdateData;
        mockReq.params.pid = 'product123';
        
        productModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

        await updateProductController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          error: expect.any(Error),
          message: 'Error in Updte product'
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
          expectedArgs: { category: ['cat1', 'cat2'] }
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
            category: ['cat1'], 
            price: { $gte: 50, $lte: 150 } 
          }
        }
      ];

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

    describe('Error Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should handle database error during filtering', async () => {
        mockReq.body = { checked: ['cat1'], radio: [100, 200] };
        productModel.find.mockRejectedValue(new Error('Database error'));

        await productFiltersController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          success: false,
          message: 'Error WHile Filtering Products',
          error: expect.any(Error)
        });
      });
    });
  });

  describe('productCountController', () => {
    // NOTE: The test below was written with the help of an LLM
    test('should return product count successfully', async () => {
      const mockQuery = {
        estimatedDocumentCount: jest.fn().mockResolvedValue(42)
      };
      productModel.find.mockReturnValue(mockQuery);

      await productCountController(mockReq, mockRes);

      expect(productModel.find).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        total: 42
      });
    });

    test('should handle count error', async () => {
      // NOTE: The test below was written with the help of an LLM
      const mockQuery = {
        estimatedDocumentCount: jest.fn().mockRejectedValue(new Error('Count failed'))
      };
      productModel.find.mockReturnValue(mockQuery);

      await productCountController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Error in product count',
        error: expect.any(Error),
        success: false
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

        expect(mockQuery.skip).toHaveBeenCalledWith(NaN);
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
          message: 'error in per page ctrl',
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
          message: 'Error In Search Product API',
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
          message: 'error while geting related product',
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
        expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
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
        
        const mockQuery = {
          populate: jest.fn().mockResolvedValue([])
        };
        productModel.find.mockReturnValue(mockQuery);

        await productCategoryController(mockReq, mockRes);

        expect(productModel.find).toHaveBeenCalledWith({ category: null });
        expect(mockRes.send).toHaveBeenCalledWith({
          success: true,
          category: null,
          products: []
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
          message: 'Error While Getting products'
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
          message: 'Error While Getting products'
        });
      });
    });
  });

  describe('braintreeTokenController', () => {
    describe('Token Generation', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should generate client token successfully', async () => {
        const mockResponse = { clientToken: 'mock-client-token-123' };
        
        // Use the module-level mockGenerate
        mockGenerate.mockImplementation((options, callback) => {
          callback(null, mockResponse);
        });

        await braintreeTokenController(mockReq, mockRes);

        expect(mockGenerate).toHaveBeenCalledWith({}, expect.any(Function));
        expect(mockRes.send).toHaveBeenCalledWith(mockResponse);
      });

      // NOTE: The test below was written with the help of an LLM
      test('should handle token generation error', async () => {
        const mockError = new Error('Token generation failed');
        
        mockGenerate.mockImplementation((options, callback) => {
          callback(mockError, null);
        });

        await braintreeTokenController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('brainTreePaymentController', () => {
    // NOTE: The test setup was written with the help of an LLM
    let mockReq, mockRes, mockOrderSave;

    beforeEach(() => {
        mockGenerate.mockClear(); 
        mockGateway.transaction.sale.mockClear();
        orderModel.mockClear();

        mockReq = {
            body: {
                nonce: 'test-nonce',
                cart: [
                    { price: 10.99, name: 'Product 1' },
                    { price: 20.50, name: 'Product 2' }
                ]
            },
            user: { _id: 'user123' },
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
        };

        mockOrderSave = jest.fn().mockResolvedValue({});
        orderModel.mockImplementation(() => ({ save: mockOrderSave }));
        console.log = jest.fn();
    });

    // Equivalence Partitioning: Valid cart scenarios
    describe('Success Paths', () => {
      // NOTE: The test below was written with the help of an LLM
      test('should process payment with single item cart', async () => {
          mockReq.body.cart = [{ price: 15.99 }];
          const mockResult = { success: true, transaction: { id: 'transaction123', amount: 15.99 } };

          // Use mockResolvedValueOnce for async/await compatibility
          mockGateway.transaction.sale.mockResolvedValueOnce(mockResult);

          await brainTreePaymentController(mockReq, mockRes);

          expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
          {
            amount: '15.99', 
            paymentMethodNonce: 'test-nonce',
            options: { submitForSettlement: true },
          },
          expect.any(Function) // Expect the callback function
        );
      });

      // NOTE: The test below was written with the help of an LLM
      test('should process payment with multiple items', async () => {
        const mockResult = { success: true, transaction: { id: 'transaction456', amount: 31.49 } };
        mockGateway.transaction.sale.mockResolvedValueOnce(mockResult);

        await brainTreePaymentController(mockReq, mockRes);

        expect(mockGateway.transaction.sale).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: '31.49',
            paymentMethodNonce: 'test-nonce',
            options: { submitForSettlement: true },
          }),
          expect.any(Function) // Still expect the callback
        );
      });
    });
  });
});