const expressAsyncHandler = require("express-async-handler");
const Category = require("../../models/category/Category");

// CREATE A CATEGORY
const createCategoryCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const category = await Category.create({
      user: req.user._id,
      title: req.body.title,
    });
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

module.exports = { createCategoryCtrl };
