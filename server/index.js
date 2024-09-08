const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql2/promise");
const app = express();

app.use(bodyparser.json());
const port = 8000;

let conn = null;

const initmysql = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Product",
  });
};

// Post สำหรับสร้าง product ใหม่บันทึกเข้าไป
app.post("/Product", async (req, res) => {
  try {
    let product = req.body;
    const results = await conn.query(
      "INSERT INTO product_detail SET ?",
      product
    );
    res.json({
      message: "insert ok",
      data: results[0],
    });
  } catch (error) {
    console.error("error message", error.message);
    res.status(500).json({
      message: "Somthing Wrong",
    });
  }
});

app.get("/Product", async (req, res) => {
  const results = await conn.query("SELECT * FROM product_detail");
  res.json(results[0]);
});

//Get Product:id สำหรับการดึง แต่ละอันออกมา *ต้องใส่ : ด้วย
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
    res.json.status(500)({
      message: "somthing ERROR",
      errorMessage: error.message,
    });
  }
});

app.post("/user", (req, res) => {
  let user = req.body;
  user.id = counter;
  counter += 1;

  users.push(user);
  res.json({
    message: "add success",
    user: user,
  });
});
app.put("/user/:id", (req, res) => {
  let id = req.params.id;
  let selectedIndex = users.findIndex((user) => {
    if (user.id == id) {
      return true;
    } else {
      return false;
    }
  });
  res.send(selectedIndex + "");
});
app.listen(port, async (req, res) => {
  await initmysql();
  console.log("http server run at" + port);
});
