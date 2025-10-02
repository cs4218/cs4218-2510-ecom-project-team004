/**
 * Tests for createCategoryController, updateCategoryController, deleteCategoryCOntroller
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
  const __saveMock = jest.fn();

  const Model = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = __saveMock;
    return this;
  });

  Model.find = jest.fn();
  Model.findOne = jest.fn();
  Model.findByIdAndUpdate = jest.fn();
  Model.findByIdAndDelete = jest.fn();

  Model.__saveMock = __saveMock;

  return { __esModule: true, default: Model };
});

import categoryModel from '../models/categoryModel.js';
import {
  createCategoryController,
  updateCategoryController,
  deleteCategoryCOntroller,
  categoryControlller,
  singleCategoryController,
} from './categoryController.js';

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

describe('createCategoryController Component', () => {
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
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Already Exisits',
    });
    expect(categoryModel).not.toHaveBeenCalled();
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

describe('deleteCategoryCOntroller', () => {
  it('200 on successful delete', async () => {
    categoryModel.findByIdAndDelete.mockResolvedValueOnce({ acknowledged: true });

    const req = mockReq({ params: { id: 'cid' } });
    const res = mockRes();

    await deleteCategoryCOntroller(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith('cid');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Category Deleted Successfully',
    });
  });

  it('500 on delete error', async () => {
    categoryModel.findByIdAndDelete.mockRejectedValueOnce(new Error('nope'));

    const req = mockReq({ params: { id: 'cid' } });
    const res = mockRes();

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error while deleting category',
      })
    );
  });
});

describe("categoryController Component", () => {
  it("status 200 for successful", async () => {
    const fake = [{ _id: "1", name: "A" }, { _id: "2", name: "B" }];
    categoryModel.find.mockResolvedValueOnce(fake);

    const req = mockReq();
    const res = mockRes();

    await categoryControlller(req, res);

    expect(categoryModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'All Categories List',
      category: fake,
    });
  });

  it("status 500 with error payload on failure", async () => {
    categoryModel.find.mockRejectedValueOnce(new Error('DB down'));

    const req = mockReq();
    const res = mockRes();

    await categoryControlller(req, res);

    expect(categoryModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error while getting all categories',
      })
    );
  });
});

describe("singleCategoryController Component", () => {
  it("status 200 on success", async () => {
    const doc = { _id: 'x', name: 'Books', slug: 'books' };
    categoryModel.findOne.mockResolvedValueOnce(doc);

    const req = mockReq({ params: { slug: 'books' } });
    const res = mockRes();

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'books' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Get SIngle Category SUccessfully',
      category: doc,
    });
  });

  it("status 200 on success with null", async () => {
    categoryModel.findOne.mockResolvedValueOnce(null);

    const req = mockReq({ params: { slug: 'missing' } });
    const res = mockRes();

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'missing' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Get SIngle Category SUccessfully',
      category: null,
    });
  });

  it("status 500 on failure", async () => {
    categoryModel.findOne.mockRejectedValueOnce(new Error('boom'));

    const req = mockReq({ params: { slug: 'bad' } });
    const res = mockRes();

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'bad' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error While getting Single Category',
      })
    );
  });
});
