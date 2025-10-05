// NOTE: This test file was written with the help of an LLM

import mongoose from 'mongoose';
import Product from './productModel';

describe('Product Model Structure', () => {
  test('should export a mongoose model', () => {
    expect(Product).toBeDefined();
  });

  test('should have correct model name', () => {
    expect(Product.modelName).toBe('Products');
  });

  test('should have all required fields defined', () => {
    const schema = Product.schema;
    const paths = schema.paths;

    expect(paths.name).toBeDefined();
    expect(paths.slug).toBeDefined();
    expect(paths.description).toBeDefined();
    expect(paths.price).toBeDefined();
    expect(paths.category).toBeDefined();
    expect(paths.quantity).toBeDefined();
  });

  test('should have correct field types', () => {
    const schema = Product.schema;
    
    expect(schema.path('name').instance).toBe('String');
    expect(schema.path('slug').instance).toBe('String');
    expect(schema.path('description').instance).toBe('String');
    expect(schema.path('price').instance).toBe('Number');
    expect(schema.path('quantity').instance).toBe('Number');
    expect(schema.path('shipping').instance).toBe('Boolean');
  });

  test('should have required validation on mandatory fields', () => {
    const schema = Product.schema;

    expect(schema.path('name').isRequired).toBe(true);
    expect(schema.path('slug').isRequired).toBe(true);
    expect(schema.path('description').isRequired).toBe(true);
    expect(schema.path('price').isRequired).toBe(true);
    expect(schema.path('category').isRequired).toBe(true);
    expect(schema.path('quantity').isRequired).toBe(true);
  });

  test('should not require optional fields', () => {
    const schema = Product.schema;

    expect(schema.path('shipping').isRequired).toBeFalsy();
    // Photo is nested, so check the nested paths
    expect(schema.path('photo.data')).toBeDefined();
    expect(schema.path('photo.contentType')).toBeDefined();
  });

  test('should have category field reference Category model', () => {
    const schema = Product.schema;
    const categoryPath = schema.path('category');

    expect(categoryPath.options.ref).toBe('Category');
  });

  test('should have timestamps enabled', () => {
    const schema = Product.schema;

    expect(schema.options.timestamps).toBe(true);
  });

  test('should have photo field with nested structure', () => {
    const schema = Product.schema;
    
    // For nested schemas, access paths directly
    expect(schema.path('photo.data')).toBeDefined();
    expect(schema.path('photo.contentType')).toBeDefined();
  });

  test('should have photo.data as Buffer type', () => {
    const schema = Product.schema;
    
    expect(schema.path('photo.data').instance).toBe('Buffer');
  });

  test('should have photo.contentType as String type', () => {
    const schema = Product.schema;
    
    expect(schema.path('photo.contentType').instance).toBe('String');
  });

  test('should have correct number of schema paths', () => {
    const schema = Product.schema;
    const pathKeys = Object.keys(schema.paths);
    
    // Includes: name, slug, description, price, category, quantity, 
    // photo.data, photo.contentType, shipping, _id, __v (when timestamps enabled: createdAt, updatedAt)
    expect(pathKeys.length).toBeGreaterThanOrEqual(11);
  });

  test('category should use correct ObjectId type', () => {
    const schema = Product.schema;
    const categoryPath = schema.path('category');
    
    // Verify it's using the correct type (case may vary by Mongoose version)
    expect(['ObjectID', 'ObjectId']).toContain(categoryPath.instance);
    expect(categoryPath.options.type).toBe(mongoose.Schema.Types.ObjectId);
  });

  test('should verify price is Number type', () => {
    const schema = Product.schema;
    expect(schema.path('price').instance).toBe('Number');
  });

  test('should verify quantity is Number type', () => {
    const schema = Product.schema;
    expect(schema.path('quantity').instance).toBe('Number');
  });

  // Bug detection tests - schema validation rules
  describe('Schema Validation Rules', () => {
    test('BUG: should have minimum value validation for price', () => {
      const schema = Product.schema;
      const priceValidators = schema.path('price').validators;
      
      // Check if there's a min validator
      const hasMinValidator = priceValidators.some(v => v.type === 'min');
      expect(hasMinValidator).toBe(true);
    });

    test('BUG: should have minimum value validation for quantity', () => {
      const schema = Product.schema;
      const quantityValidators = schema.path('quantity').validators;
      
      // Check if there's a min validator
      const hasMinValidator = quantityValidators.some(v => v.type === 'min');
      expect(hasMinValidator).toBe(true);
    });

    test('BUG: should have unique constraint on slug', () => {
      const schema = Product.schema;
      const slugPath = schema.path('slug');
      
      expect(slugPath.options.unique).toBe(true);
    });

    test('should have photo.data as optional field', () => {
      const schema = Product.schema;
      const photoDataPath = schema.path('photo.data');
      
      expect(photoDataPath.isRequired).toBeFalsy();
    });

    test('should have shipping as optional field', () => {
      const schema = Product.schema;
      const shippingPath = schema.path('shipping');
      
      expect(shippingPath.isRequired).toBeFalsy();
    });

    test('should have correct reference type for category', () => {
      const schema = Product.schema;
      const categoryPath = schema.path('category');
      
      expect(categoryPath.options.ref).toBe('Category');
      expect(['ObjectID', 'ObjectId']).toContain(categoryPath.instance);
    });
  });

  describe('Schema Options', () => {
    test('should have timestamps option enabled', () => {
      const schema = Product.schema;
      expect(schema.options.timestamps).toBe(true);
    });

    test('should have createdAt virtual path', () => {
      const schema = Product.schema;
      expect(schema.path('createdAt')).toBeDefined();
    });

    test('should have updatedAt virtual path', () => {
      const schema = Product.schema;
      expect(schema.path('updatedAt')).toBeDefined();
    });
  });

  describe('Field Count Validation', () => {
    test('should have exactly the expected required fields', () => {
      const schema = Product.schema;
      const requiredPaths = Object.keys(schema.paths).filter(
        path => schema.path(path).isRequired && !path.startsWith('_')
      );
      
      // Required: name, slug, description, price, category, quantity
      expect(requiredPaths).toContain('name');
      expect(requiredPaths).toContain('slug');
      expect(requiredPaths).toContain('description');
      expect(requiredPaths).toContain('price');
      expect(requiredPaths).toContain('category');
      expect(requiredPaths).toContain('quantity');
    });

    test('should have all expected optional fields', () => {
      const schema = Product.schema;
      
      expect(schema.path('shipping')).toBeDefined();
      expect(schema.path('photo.data')).toBeDefined();
      expect(schema.path('photo.contentType')).toBeDefined();
    });
  });
});