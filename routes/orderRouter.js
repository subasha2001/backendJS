const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const { HTTP_BAD_REQUEST } = require("../constants/http_status");
const { OrderModel } = require("../models/orderModel");
const { OrderStatus } = require("../constants/order_status");
const auth = require("../middlewares/auth.mid");
const Razorpay = require("razorpay");
const { ProductsModel } = require("../models/productsModel");
const { UserModel } = require("../models/userModel");
const { sendPaymentConfirmationEmailForUser, sendPaymentConfirmationEmailForAdmin } = require("./mailerRouter");
const crypto = require("crypto");

const router = Router();
router.use(auth);

const razorpay = new Razorpay({
  key_id: process.env.RPAY_KEY,
  key_secret: process.env.RPAY_SECRET,
});

router.post(
  "/create",
  asyncHandler(async (req, res) => {
    const requestOrder = req.body;
    if (requestOrder.items.length <= 0) {
      res.status(HTTP_BAD_REQUEST).send("Cart is empty");
      return;
    }

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    try {
      for (const item of requestOrder.items) {
        const product = await ProductsModel.findById(item.product.id);

        if (!product) {
          return res
            .status(404)
            .send({ error: `Product not found for ID: ${item.product.id}` });
        }

        // Ensure stock is greater than 0
        if (product.stock < item.quantity) {
          return res.status(400).send({
            error: `Insufficient stock for product ID: ${item.product.id}. Available stock: ${product.stock}`,
          });
        }
      }
    } catch (error) {}

    for (const item of requestOrder.items) {
      const options = {
        amount: requestOrder.totalPrice * 100,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
        payment_capture: 1,
      };

      try {
        const razorpayOrder = await razorpay.orders.create(options);

        const newOrder = new OrderModel({
          ...requestOrder,
          user: req.user.id,
          razorpayOrderId: razorpayOrder.id,
          status: OrderStatus.NEW,
        });

        await newOrder.save();
        res
          .status(201)
          .send({ order: newOrder, razorpayOrderId: razorpayOrder.id });
      } catch (err) {
        res.status(500).json({ error: err });
      }
    }
  })
);

router.post(
  "/verify-payment",
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const hmac = crypto.createHmac("sha256", process.env.RPAY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      const order = await OrderModel.findOne({
        razorpayOrderId: razorpay_order_id,
      });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const user = await UserModel.findOne({
        _id: order.user,
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      try {
        for (const item of order.items) {
          await ProductsModel.findByIdAndUpdate(item.product.id, {
            $inc: { stock: -item.quantity },
          });
        }

        order.status = OrderStatus.PAYED;
        await order.save();

        await sendPaymentConfirmationEmailForUser(user.email, order);
        await sendPaymentConfirmationEmailForAdmin(user, order);

        res.status(200).send({
          message: "Payment verified, order confirmed, and stock updated",
        });
      } catch (err) {
        console.error("Error while updating stock:", err);
        res.status(500).json({ error: "Failed to update stock" });
      }
    } else {
      res.status(400).json({ error: "Invalid payment signature" });
    }
  })
);

router.get(
  "/newOrderForCurrentUser",
  asyncHandler(async (req, res) => {
    const order = await getNewOrderForCurrentUser(req);
    if (order) res.send(order);
    else res.status(HTTP_BAD_REQUEST).send();
  })
);

router.get(
  "/track/:id",
  asyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    res.send(order);
  })
);

module.exports = router;

async function getNewOrderForCurrentUser(req) {
  return await OrderModel.findOne({
    user: req.user.id,
    status: OrderStatus.NEW,
  });
}