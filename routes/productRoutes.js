const router = require('express').Router();
const controller = require('../controllers/productController');

// Laravel: /index
router.get('/index', controller.getIndex);

// Laravel: /order (auth)
router.get('/order', controller.getOrderPage);

// get image
router.get('/image/:id', controller.getImage);

// add to cart
router.post('/addtocart', controller.addToCart);
// remove cart
router.delete('/removecart/:id', controller.removeCartItem);

// get carts
router.get('/cart/:customer_id', controller.getCart);
// update 
router.put("/cart/:id", controller.updateCartQuantity);

// clear cart
router.delete('/clearcart/:customer_id', controller.clearCartItem);
module.exports = router;