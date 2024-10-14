window.onload = async () => {
  const savedCart = localStorage.getItem("cart");
  const savedTotalPrice = localStorage.getItem("totalPrice");
  const customerName = localStorage.getItem("customerName");
  const customerPhone = localStorage.getItem("customerPhone");
  const customerAddress = localStorage.getItem("customerAddress");

  console.log("Cart:", savedCart);
  console.log("TotalPrice:", savedTotalPrice);
  console.log("CustomerName:", customerName);
  console.log("CustomerPhone:", customerPhone);
  console.log("CustomerAddress:", customerAddress);

  if (
    savedCart &&
    customerName &&
    customerPhone &&
    customerAddress &&
    savedTotalPrice
  ) {
    const cartItems = JSON.parse(savedCart);

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      total_amount: savedTotalPrice,
      products: cartItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_image: item.img,
        product_price: item.price,
        quantity: item.quantity,
      })),
    };

    await sendOrderToBackend(orderData);
  }

  await fetchOrders();
};

async function sendOrderToBackend(orderData) {
  try {
    console.log("Order Data to send:", orderData);
    const response = await axios.post(
      "http://localhost:8000/Product",
      orderData
    );
    console.log("Response status:", response.status);
    console.log("Order sent successfully:", response.data);

    localStorage.setItem("orderCreated", "true");
  } catch (error) {
    console.error("Error sending order:", error);
  }
}

async function fetchOrders() {
  try {
    const response = await axios.get("http://localhost:8000/orders");
    const orders = response.data;

    console.log("Fetched Orders:", orders);

    if (orders && orders.length > 0) {
      displayOrders(orders);
    } else {
      console.log("ไม่พบรายการคำสั่งซื้อ");
      document.getElementById("orderList").innerHTML =
        "<p>ไม่พบรายการคำสั่งซื้อ</p>";
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:", error);
  }
}

function displayOrders(orders) {
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = ""; // ล้างเนื้อหาก่อน

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.classList.add("card", "bg-base-100", "shadow-xl", "p-4");

    orderCard.innerHTML = `
      <p>ออเดอร์ที่: ${order.order_id}</p>
      <p style="color: green;">สถานะ: ${order.order_status}</p>
      <p><strong>ชื่อลูกค้า:</strong> ${order.customer_name}</p>
      <p><strong>เบอร์โทร:</strong> ${order.customer_phone}</p>
      <p><strong>ที่อยู่:</strong> ${order.customer_address}</p>
      <p><strong>ยอดรวม:</strong> ${order.total_amount}฿</p>
      <h3 class="font-bold mt-3">รายการสั่งซื้อ:</h3>
      <div class="ml-5">
        ${
          order.products && order.products.length > 0
            ? order.products
                .map(
                  (product) => `
                  <div class="flex items-center mt-2">
                    <img src="${product.product_image}" alt="${product.product_name}" width="50" class="mr-2">
                    <p>- ${product.product_name} (฿${product.product_price}) จำนวน: ${product.quantity}</p>
                  </div>
                `
                )
                .join("")
            : "<p>ไม่มีสินค้าในออเดอร์</p>"
        }
      </div>
      <button onclick="showUpdateForm(${order.order_id}, '${
      order.customer_name
    }', '${order.customer_phone}', '${
      order.customer_address
    }')" class="btn btn-success">แก้ไข</button>

      <button onclick="deleteOrder(${
        order.order_id
      })" class="btn btn-error">ลบคำสั่งซื้อ</button>
    `;

    orderList.appendChild(orderCard);
  });
}

async function deleteOrder(orderId) {
  console.log("Trying to delete order with ID:", orderId); // เพิ่ม log
  try {
    const response = await axios.delete(
      `http://localhost:8000/orders/${orderId}`
    );
    console.log("Delete Response:", response.data);
    await fetchOrders();
  } catch (error) {
    console.error(
      "Error deleting order:",
      error.response ? error.response.data : error.message
    ); // ปรับแสดงรายละเอียด error
  }
}

function showUpdateForm(orderId, customerName, customerPhone, customerAddress) {
  const nameInput = prompt("ชื่อ:", customerName);
  const phoneInput = prompt("เบอร์โทร:", customerPhone);
  const addressInput = prompt("ที่อยู่:", customerAddress);

  if (nameInput && phoneInput && addressInput) {
    const updatedData = {
      customer_name: nameInput,
      customer_phone: phoneInput,
      customer_address: addressInput,
    };
    updateOrder(orderId, updatedData);
  }
}

async function updateOrder(orderId, updatedData) {
  try {
    const response = await axios.put(
      `http://localhost:8000/orders/${orderId}`,
      updatedData
    );
    console.log("Update Response:", response.data);
    await fetchOrders();
  } catch (error) {
    console.error("Error updating order:", error);
  }
}

function goToProductPage() {
  // ลบข้อมูลใน localStorage ที่เกี่ยวกับตะกร้าสินค้าและราคารวม
  localStorage.removeItem("cart");
  localStorage.removeItem("totalPrice");

  // ลบจำนวนสินค้าในตะกร้าที่เก็บใน localStorage
  localStorage.removeItem("cartItemsCount");

  // เปลี่ยนไปที่หน้า product.html
  window.location.href = "product.html";
}
