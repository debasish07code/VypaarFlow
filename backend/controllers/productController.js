import Product from "../models/productModel.js";

// ➕ ADD PRODUCT
export const addProduct = async (req, res) => {
  try {
    const { name, price, quantity, category } = req.body;

    const product = await Product.create({
      name,
      price,
      quantity,
      category,
      user: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 GET ALL PRODUCTS (only user's products)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ensure user owns product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
