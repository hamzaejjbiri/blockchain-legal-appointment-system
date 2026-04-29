// ============================
// The House of WA - Consultation JS
// Works with your Flask form (action="/submit" method="post")
// ============================

const form = document.querySelector("form#form-appointment"); // <-- matches your index.html

// Optional: date display if you have <span id="date"></span>
const dateEl = document.getElementById("date");
if (dateEl) dateEl.textContent = new Date().toDateString();

// Helper: basic email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Helper: basic phone validation (keeps digits + + - spaces)
function isValidPhone(phone) {
  const cleaned = String(phone).trim();
  if (!cleaned) return false;
  return /^[0-9+\-\s()]{7,}$/.test(cleaned);
}

// Validate the form input (aligned with your Flask fields)
function validateForm() {
  if (!form) return false;

  const name = form.elements["name"];
  const email = form.elements["email"];
  const phone = form.elements["phone"];
  const department = form.elements["department"];
  const message = form.elements["message"]; // or "symptoms" if you used that name

  if (!name || !name.value.trim()) {
    alert("Please enter your name");
    return false;
  }

  if (!email || !isValidEmail(email.value.trim())) {
    alert("Please enter a valid email address");
    return false;
  }

  if (!phone || !isValidPhone(phone.value)) {
    alert("Please enter a valid phone number");
    return false;
  }

  if (!department || !department.value) {
    alert("Please select a department");
    return false;
  }

  // Optional message field: only validate if it exists and is required by you
  if (message && message.hasAttribute("required") && !message.value.trim()) {
    alert("Please write your message");
    return false;
  }

  return true;
}

// Optional: add a new inquiry card to the page (only if #posts exists)
function addInquiryCard(data) {
  const posts = document.querySelector("#posts") || document.querySelector(".posts");
  if (!posts) return;

  const card = document.createElement("div");
  card.className = "comment-card";

  const header = document.createElement("div");
  header.className = "comment-header";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  const avatarSpan = document.createElement("span");
  avatarSpan.textContent = data.name.trim()[0].toUpperCase();
  avatar.appendChild(avatarSpan);

  const info = document.createElement("div");
  info.className = "comment-info";

  const nameEl = document.createElement("h4");
  nameEl.className = "name";
  nameEl.textContent = data.name;

  const dateText = document.createElement("p");
  dateText.className = "date";
  dateText.textContent = new Date(data.timestamp).toDateString();

  info.appendChild(nameEl);
  info.appendChild(dateText);

  header.appendChild(avatar);
  header.appendChild(info);

  const body = document.createElement("div");
  body.className = "comment-body";
  body.innerHTML = `
    <table>
      <tr><td>Email:</td><td>${data.email}</td></tr>
      <tr><td>Phone:</td><td>${data.phone}</td></tr>
      <tr><td>Department:</td><td>${data.department}</td></tr>
      <tr><td>Message:</td><td>${(data.message || "").replace(/</g, "&lt;")}</td></tr>
    </table>
  `;

  card.appendChild(header);
  card.appendChild(body);

  posts.prepend(card);
}

// Submit handler
if (form) {
  form.addEventListener("submit", function (event) {
    // IMPORTANT:
    // Let Flask submit to /submit so it can save to blockchain.
    // We only validate before sending.
    if (!validateForm()) {
      event.preventDefault();
      return;
    }

    // Optional: instant preview card (does NOT replace backend saving)
    // If you want ZERO preview, just delete the lines below.
    const messageField = form.elements["message"] || form.elements["symptoms"];
    const preview = {
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      phone: form.elements["phone"].value.trim(),
      department: form.elements["department"].value,
      message: messageField ? messageField.value.trim() : "",
      timestamp: Date.now(),
    };
    addInquiryCard(preview);

    // do NOT preventDefault() -> allow real POST to /submit
  });
}
