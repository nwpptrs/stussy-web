const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql2/promise");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(bodyparser.json());
const port = 8000;

let conn = null;

const initmysql = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "Product",
  });
};

app.get("/Product", async (req, res) => {
  const results = await conn.query("SELECT * FROM product_detail");
  res.json(results[0]);
});

app.get("/Product/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query(
      "SELECT * FROM product_detail WHERE id = ?",
      id
    );
    if (results[0].length == 0) {
      res.json(results[0][0]);
    } else {
      throw new Error("Not Found");
    }
  } catch (error) {
    res.status(500).json({
      message: "somthing ERROR",
      errorMessage: error.message,
    });
  }
});

app.listen(port, async (req, res) => {
  await initmysql();
  console.log("http server run at" + port);
});

app.post("/Product", async (req, res) => {
  try {
    const order = req.body;
    await conn.beginTransaction();
    const orderResult = await conn.query(
      "INSERT INTO Orders (customer_name, customer_phone, customer_address, total_amount) VALUES (?, ?, ?, ?)",
      [
        order.customer_name,
        order.customer_phone,
        order.customer_address,
        order.total_amount,
      ]
    );

    const orderId = orderResult[0].insertId;
    const productQueries = order.products.map((product) =>
      conn.query(
        "INSERT INTO Order_Items (order_id, product_id, product_name, product_image, product_price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
        [
          orderId,
          product.product_id,
          product.product_name,
          product.product_image,
          product.product_price,
          product.quantity,
        ]
      )
    );

    await Promise.all(productQueries);
    await conn.commit();

    res.json({ message: "Order and products inserted successfully", orderId });
  } catch (error) {
    await conn.rollback();
    console.error("Error:", error.message);
    res.status(500).json({ message: "Error processing order" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const query = `
      SELECT 
        o.order_id,
        o.customer_name,
        o.customer_phone,
        o.customer_address,
        o.total_amount,
        o.order_status,
        oi.product_id,
        oi.product_name,
        oi.product_image,
        oi.product_price,
        oi.quantity
      FROM 
        Orders o
      LEFT JOIN 
        Order_Items oi ON o.order_id = oi.order_id
    `;
    const [orders] = await conn.query(query);
    const ordersWithItems = orders.reduce((acc, order) => {
      const existingOrder = acc.find((o) => o.order_id === order.order_id);
      if (existingOrder) {
        existingOrder.products.push({
          product_id: order.product_id,
          product_name: order.product_name,
          product_image: order.product_image,
          product_price: order.product_price,
          quantity: order.quantity,
        });
      } else {
        acc.push({
          order_id: order.order_id,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          total_amount: order.total_amount,
          order_status: order.order_status,
          products: [
            {
              product_id: order.product_id,
              product_name: order.product_name,
              product_image: order.product_image,
              product_price: order.product_price,
              quantity: order.quantity,
            },
          ],
        });
      }
      return acc;
    }, []);
    res.json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// PUT: แก้ไขคำสั่งซื้อ
app.put("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  const { customer_name, customer_phone, customer_address } = req.body;

  try {
    const [result] = await conn.query(
      "UPDATE Orders SET customer_name = ?, customer_phone = ?, customer_address = ? WHERE order_id = ?",
      [customer_name, customer_phone, customer_address, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
    }

    res.json({ message: "อัปเดตคำสั่งซื้อเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตคำสั่งซื้อ" });
  }
});

// DELETE: ลบคำสั่งซื้อ
app.delete("/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    console.log("Attempting to delete order with ID:", orderId); // เพิ่ม log เพื่อตรวจสอบ
    const [result] = await conn.query("DELETE FROM Orders WHERE order_id = ?", [
      orderId,
    ]);

    if (result.affectedRows === 0) {
      console.log(`Order ID ${orderId} not found in Orders table`); // เพิ่ม log
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อที่ต้องการลบ" });
    }

    console.log(`Order ID ${orderId} deleted from Orders table`); // เพิ่ม log
    await conn.query("DELETE FROM Order_Items WHERE order_id = ?", [orderId]);

    console.log(`Order items for Order ID ${orderId} deleted`); // เพิ่ม log
    res.json({ message: "ลบคำสั่งซื้อเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error during delete operation:", error.message); // เพิ่ม log แสดง error message
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการลบคำสั่งซื้อ",
      error: error.message,
    });
  }
});


