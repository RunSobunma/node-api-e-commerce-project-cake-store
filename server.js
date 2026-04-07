require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/productRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api', require('./routes/authRoutes'));

app.listen(3000, '0.0.0.0',() => {
    console.log("Server running on port 3000");
});