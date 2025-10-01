/**
 * Tests for createCategoryController, updateCategoryController, deleteCategoryController
 * Works with ESM paths (notice the .js at import paths).
 */

// ---- inline mocks (no out-of-scope variables) ----
jest.mock('slugify', () => {
  return {
    __esModule: true,
    default: (s) => `slug-${String(s)}`,
  };
});

jest.mock('../models/categoryModel.js', () => {
  // define everything INSIDE the factory to avoid the out-of-scope error
  const __saveMock = jest.fn();

  // constructor used as: new categoryModel({...}).save()
  const Model = jest.fn(function (data) {
    // mimic a mongoose doc instance with a save method
    Object.assign(this, data);
    this.save = __saveMock;
    return this;
  });

  // static methods your controller calls
  Model.findOne = jest.fn();
  Model.findByIdAndUpdate = jest.fn();
  Model.findByIdAndDelete = jest.fn();

  // expose the save mock so tests can control its resolution
  Model.__saveMock = __saveMock;

  return { __esModule: true, default: Model };
});

// Now import after mocks (Jest hoists jest.mock calls)
import categoryModel from '../models/categoryModel.js';
import {
  createCategoryController,
  updateCategoryController,
  deleteCategoryController, // note the capital O in your source
} from './categoryController.js';

// ---- tiny req/res helpers ----
const mockReq = (overrides = {}) => ({ body: {}, params: {}, ...overrides });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn();
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

/* ------------------ CREATE ------------------ */
describe('createCategoryController', () => {
  it('400 when name missing', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Name is required' });
    expect(categoryModel.findOne).not.toHaveBeenCalled();
  });

  it('200 when category already exists (no save)', async () => {
    categoryModel.findOne.mockResolvedValueOnce({ _id: 'x', name: 'Books' });

    const req = mockReq({ body: { name: 'Books' } });
    const res = mockRes();

    await createCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: 'Books' });
    expect(res.status).toHaveBeenCalledWith(200);
    // matches your controller’s exact message (typo included)
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Already Exisits',
    });
    expect(categoryModel).not.toHaveBeenCalled(); // constructor not used
    expect(categoryModel.__saveMock).not.toHaveBeenCalled();
  });

  it('201 on successful creation (save called with slug)', async () => {
    categoryModel.findOne.mockResolvedValueOnce(null);
    categoryModel.__saveMock.mockResolvedValueOnce({
      _id: 'newId',
      name: 'Books',
      slug: 'slug-Books',
    });

    const req = mockReq({ body: { name: 'Books' } });
    const res = mockRes();

    await createCategoryController(req, res);

    // constructor called with name & slug
    expect(categoryModel).toHaveBeenCalledWith({ name: 'Books', slug: 'slug-Books' });
    expect(categoryModel.__saveMock).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'New category created',
      category: { _id: 'newId', name: 'Books', slug: 'slug-Books' },
    });
  });

  it('500 on unexpected error', async () => {
    categoryModel.findOne.mockRejectedValueOnce(new Error('DB down'));

    const req = mockReq({ body: { name: 'Books' } });
    const res = mockRes();

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error in Category',
      })
    );
  });
});

/* ------------------ UPDATE ------------------ */
describe('updateCategoryController', () => {
  it('200 on successful update (slugified)', async () => {
    const updated = { _id: 'cid', name: 'NewName', slug: 'slug-NewName' };
    categoryModel.findByIdAndUpdate.mockResolvedValueOnce(updated);

    const req = mockReq({ params: { id: 'cid' }, body: { name: 'NewName' } });
    const res = mockRes();

    await updateCategoryController(req, res);

    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'cid',
      { name: 'NewName', slug: 'slug-NewName' },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    // matches your controller’s exact key "messsage"
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      messsage: 'Category Updated Successfully',
      category: updated,
    });
  });

  it('500 on update error', async () => {
    categoryModel.findByIdAndUpdate.mockRejectedValueOnce(new Error('boom'));

    const req = mockReq({ params: { id: 'cid' }, body: { name: 'X' } });
    const res = mockRes();

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error while updating category',
      })
    );
  });
});

/* ------------------ DELETE ------------------ */
describe('deleteCategoryController', () => {
  it('200 on successful delete', async () => {
    categoryModel.findByIdAndDelete.mockResolvedValueOnce({ acknowledged: true });

    const req = mockReq({ params: { id: 'cid' } });
    const res = mockRes();

    await deleteCategoryController(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith('cid');
    expect(res.status).toHaveBeenCalledWith(200);
    // matches your controller message (typo included)
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Deleted Successfully',
    });
  });

  it('500 on delete error', async () => {
    categoryModel.findByIdAndDelete.mockRejectedValueOnce(new Error('nope'));

    const req = mockReq({ params: { id: 'cid' } });
    const res = mockRes();

    await deleteCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error while deleting category',
      })
    );
  });
});
