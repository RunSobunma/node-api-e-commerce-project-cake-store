const router = require('express').Router();
const auth = require('../controllers/authController');

// Laravel: /order/register
router.post('/order/register', auth.register);

// Laravel: /order/login
router.post('/order/login', auth.login);

// Laravel: /order/logout
router.get('/order/logout', auth.logout);

module.exports = router;