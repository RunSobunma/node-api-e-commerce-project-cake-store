const router = require('express').Router();
const order = require('../controllers/orderController');

// Laravel: POST /order
router.post('/order', order.createOrder);

module.exports = router;