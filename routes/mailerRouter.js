const nodemailer = require("nodemailer");

const sendPaymentConfirmationEmailForUser = async (userEmail, orderDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const attachments = orderDetails.items.map((product) => ({
    filename: `${product.product.name}.jpg`,
    path: `./uploads/${product.product.imageDis}`,
  }));

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Payment Confirmation - Order # " + orderDetails.id,
    text: `Dear ${orderDetails.name},\n\n` +
      `We are pleased to inform you that your payment for Order #${orderDetails.id} has been successfully confirmed.\n\n` +
      `Here are the details of your order:\n` +
      `Order ID: ${orderDetails.id}\n` +
      `Items: ${orderDetails.items
        .map(item => `${item.product.name} (Qty: ${item.quantity})`)
        .join(", ")}\n` +
      `Total Price: ₹${orderDetails.totalPrice}\n\n` +
      `Thank you for shopping with us.\n\nBest Regards,\nGold Palace Jewellery Team`,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendPaymentConfirmationEmailForAdmin = async (user, orderDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const attachments = orderDetails.items.map((product) => ({
    filename: `${product.product.name}.jpg`,
    path: `./uploads/${product.product.imageDis}`,
  }));

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "subashayyanar1@gmail.com",
    subject: "Payment Confirmation - Order # " + orderDetails.id,
    "From ": user.name,
    text: `${orderDetails.name} placed an order,\n\n` +
      `And payment for Order #${orderDetails.id} has been successfully confirmed and Verified.\n\n` +
      `Here are the details of the order:\n` +
      `Order ID: ${orderDetails.id}\n` +
      `productId: ${orderDetails.items.map(item => `${item.product.id}`)}\n` +
      `Items: ${orderDetails.items
        .map(item => `${item.product.name} (Qty: ${item.quantity})`)
        .join(", ")}\n` +
      `Total Price: ₹${orderDetails.totalPrice}\n\n`,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {sendPaymentConfirmationEmailForAdmin, sendPaymentConfirmationEmailForUser}