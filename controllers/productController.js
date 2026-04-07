const db = require('../config/db');

// GET /index
exports.getIndex = async (req, res) => {
    const [products] = await db.query("SELECT * FROM products ORDER BY id DESC LIMIT 4");
    res.json(products);
};

// GET /order (same as websiteController@order)
exports.getOrderPage = async (req, res) => {
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
};

exports.getImage = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT ppic FROM products WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.json(rows[0]); // return single object
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
//
exports.addToCart = async (req, res) => {
  try {
    const {
      customer_id,
      product_id,
      product_name,
      product_image, // <-- new field
      size,
      color,
      message,
      nut_free = 0,
      gluten_free = 0,
      dairy_free = 0,
      quantity,
      price
    } = req.body;

    const now = new Date();

    // Check if same item already exists
    const [exist] = await db.query(
      `SELECT * FROM carts 
       WHERE customer_id = ? 
       AND product_id = ? 
       AND size = ? 
       AND color = ?`,
      [customer_id, product_id, size, color]
    );

    if (exist.length > 0) {
      // update quantity
      await db.query(
        `UPDATE carts 
         SET quantity = quantity + ?, updated_at = ?
         WHERE id = ?`,
        [quantity, now, exist[0].id]
      );
    } else {
      // insert new item
      await db.query(
        `INSERT INTO carts
        (customer_id, product_id, product_name, product_image, size, color, special_message, nut_free, gluten_free, dairy_free, quantity, price, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer_id,
          product_id,
          product_name,
          product_image, // <-- pass image here
          size,
          color,
          message,
          nut_free,
          gluten_free,
          dairy_free,
          quantity,
          price,
          now,
          now
        ]
      );
    }

    res.json({ message: "Added to cart ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//
exports.getCart = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM carts WHERE customer_id = ?`,
      [customer_id]
    );

    res.json(rows); // rows now include product_image
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//
exports.removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`DELETE FROM carts WHERE id = ?`, [id]);

        res.json({ message: "Item removed ❌" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//
exports.clearCartItem = async (req, res) => {
    try {
        const { customer_id } = req.params;

        if (!customer_id) {
            return res.status(400).json({ message: "customer_id is required" });
        }

        const [result] = await db.query(
            "DELETE FROM carts WHERE customer_id = ?",
            [customer_id]
        );

        res.json({
            message: "Cart cleared 🧹",
            affectedRows: result.affectedRows
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// controllers/cartController.js
exports.updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params; // cart item ID
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be >= 1" });
    }

    const [result] = await db.query(
      "UPDATE carts SET quantity = ? WHERE id = ?",
      [quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Optional: return updated cart item
    const [updatedItem] = await db.query(
      "SELECT * FROM carts WHERE id = ?",
      [id]
    );

    res.json({
      message: "Quantity updated successfully",
      cartItem: updatedItem[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};