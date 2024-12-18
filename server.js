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
    origin: ['http://localhost:4200', 'https://goldpalacejewels.com', 'http://13.61.140.48', 'http://goldpalacejewels.com'],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/products', productsRouter);
app.use('/banner', bannerRouter);
app.use('/users', userRouter);
app.use('/orders', orderRouter);
app.use('/goldSilver', goldSilver);
app.use('/reviews', reviewsRouter);
app.use('/mailer', emailRouter);
// app.use("", addImageRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 3002;

app.listen(port, () => {
  console.log('connected to ' + port);
});