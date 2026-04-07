const db = require('../config/db');

// CREATE ORDER (same as Laravel setOrder)
exports.createOrder = async (req, res) => {
    try {
        const {
            carts,
            payment,
            customer_id,
            delivery_contact,
            delivery_address,
            customer_name,
            total
        } = req.body;

        // ✅ FIX 1: handle both string + array
        const cart = typeof carts === 'string' ? JSON.parse(carts) : carts;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // ✅ 1. INSERT ORDER
        const now = new Date();

        const [orderResult] = await db.query(
            `INSERT INTO orders 
            (customer_id, customer_name, delivery_contact, delivery_address, total, payway, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_id,
                customer_name,
                delivery_contact,
                delivery_address,
                total,
                payment,
                now,
                now
            ]
        );

        const orderId = orderResult.insertId;

        // ✅ 2. INSERT ORDER DETAILS
        for (const item of cart) {

            let size = null;
            let color = null;
            let message = null;
            let nutFree = 0;
            let glutenFree = 0;
            let dairyFree = 0;

            // ✅ FIX 2: safe options
            const options = item.options || [];

            for (const option of options) {

                if (option.startsWith('Size:')) {
                    const match = option.match(/Size:\s*(.+?)\s*\(\$/);
                    size = match ? match[1] : null;
                }

                if (option.startsWith('Color:')) {
                    color = option.replace('Color:', '').trim();
                }

                if (option.startsWith('Nut Free')) {
                    const match = option.match(/\+\$(\d+)/);
                    nutFree = match ? parseFloat(match[1]) : 0;
                }

                if (option.startsWith('Gluten Free')) {
                    const match = option.match(/\+\$(\d+)/);
                    glutenFree = match ? parseFloat(match[1]) : 0;
                }

                if (option.startsWith('Dairy Free')) {
                    const match = option.match(/\+\$(\d+)/);
                    dairyFree = match ? parseFloat(match[1]) : 0;
                }

                if (option.startsWith('Message:')) {
                    const match = option.match(/Message:\s*"?(.+?)"?$/);
                    message = match ? match[1] : null;
                }
            }

            // ✅ FIX 3: include all DB fields (safe)
            await db.query(
                `INSERT INTO order_details
                (order_id, product_id, product_name, size, color, special_message, nut_free, gluten_free, dairy_free, quantity, price, amount, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item.productId,
                    item.title,
                    size,
                    color,
                    message,
                    nutFree,
                    glutenFree,
                    dairyFree,
                    item.quantity,
                    item.price,
                    item.quantity * item.price,
                    now,
                    now
                ]
            );
        }

        // ✅ 3. UPDATE USER ROLE
        await db.query(
            "UPDATE users SET role = 'customer' WHERE id = ?",
            [customer_id]
        );

        // ✅ SUCCESS RESPONSE
        res.json({
            message: `Order #${orderId} created successfully`,
            order_id: orderId
        });

    } catch (err) {
        console.error("ERROR FULL:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message,
            sqlMessage: err.sqlMessage
        });
    }



};
