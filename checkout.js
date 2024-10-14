window.onload = () => {
  const savedTotalPrice = localStorage.getItem("totalPrice");
  if (savedTotalPrice) {
    const totalPriceDOM = document.querySelector("#totalPrice");
    if (totalPriceDOM) {
      totalPriceDOM.textContent = Number(savedTotalPrice).toLocaleString(); // ตรวจสอบว่าเป็น string และใส่เครื่องหมาย ','
    }
  }
};

document.getElementById("paymentFile").addEventListener("change", function () {
  const paymentStatusDOM = document.getElementById("paymentStatus");
  const submitButton = document.getElementById("submitPayment");

  // แสดง spinner ขณะกำลังโหลด
  paymentStatusDOM.innerHTML =
    '<span class="loading loading-spinner loading-lg"></span>';

  // จำลองการอัปโหลดโดยใช้ setTimeout
  setTimeout(() => {
    // เมื่อการอัปโหลดเสร็จสิ้น แสดงข้อความ "ชำระเงินเสร็จสิ้น" เป็นสีเขียว
    paymentStatusDOM.innerHTML =
      '<span style="color: green;">ชำระเงินเสร็จสิ้น</span>';

    // เปิดใช้งานปุ่มสั่งซื้อ
    submitButton.disabled = false;
  }, 2000); // จำลองการอัปโหลด 2 วินาที
});

function goBackToProduct() {
  window.location.href = "product.html"; // เปลี่ยนเส้นทางไปที่หน้า product.html
}

document.querySelector(".btn-neutral").addEventListener("click", function (e) {
  e.preventDefault();

  // ดึงค่าจากฟอร์ม
  const customerName = document.querySelector(
    'input[placeholder="ชื่อ-นามสกุล"]'
  ).value;
  const customerPhone = document.querySelector(
    'input[placeholder="หมายเลขเบอร์มือถือ"]'
  ).value;
  const customerAddress = document.querySelector(
    'textarea[placeholder="ที่อยู่"]'
  ).value;

  // เก็บข้อมูลใน localStorage
  localStorage.setItem("customerName", customerName);
  localStorage.setItem("customerPhone", customerPhone);
  localStorage.setItem("customerAddress", customerAddress);

  // ย้ายไปที่หน้าสรุปคำสั่งซื้อ
  window.location.href = "order.html"; // เปลี่ยนเส้นทางไปยังหน้า order.html
});

const formFields = [
  document.getElementById("customerName"),
  document.getElementById("customerPhone"),
  document.getElementById("customerAddress"),
];

formFields.forEach((field) => {
  field.addEventListener("input", checkFormCompletion);
});

function checkFormCompletion() {
  const allFilled = formFields.every((field) => field.value.trim() !== "");
  const checkoutButton = document.getElementById("checkoutButton");
  checkoutButton.disabled = !allFilled; // ปิดการใช้งานปุ่มถ้าไม่ครบ
}

document.getElementById("checkoutButton").addEventListener("click", () => {
  // เปลี่ยนปุ่มเป็น spinner
  const button = document.getElementById("checkoutButton");
  button.innerHTML = '<span class="loading loading-spinner loading-lg"></span>';
  button.disabled = true; // ปิดการใช้งานปุ่มเพื่อป้องกันการคลิกซ้ำ
});

