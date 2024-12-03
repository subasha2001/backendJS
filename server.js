require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dbConnect = require("./configs/db.config");
const productsRouter = require('./routes/productsRouter');
const bannerRouter = require('./routes/bannerRouter');
const userRouter = require('./routes/userRouter');
const bodyParser = require('body-parser');
const orderRouter = require('./routes/orderRouter');
const goldSilver = require('./routes/goldSilverRouter');
const reviewsRouter = require('./routes/reviewsRouter');
const emailRouter = require('./routes/emailRouter');
const path = require('path');

dbConnect();

const app = express();
app.use(express.json());
app.use(
  cors({
    methods: ['GET,POST,PUT,DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'access_token'],
    origin: ['https://apsinfotech.in', 'http://localhost:4200', 'http://13.61.105.213'],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/products', productsRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/goldSilver', goldSilver);
app.use('/api/reviews', reviewsRouter);
app.use('/api/mailer', emailRouter);
// app.use("/api", addImageRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 3002;

app.listen(port, () => {
  console.log('connected to ' + port);
});

// "build": "npm install && tsc"