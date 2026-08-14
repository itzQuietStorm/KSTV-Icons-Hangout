function scrollToForm() {
  const form = document.getElementById("inviteForm");
  if (form) {
    form.scrollIntoView({ behavior: "smooth" });
    form.querySelector("input").focus();
  }
}

function clearMessages() {
  const errorEl = document.getElementById("formError");
  const successEl = document.getElementById("formSuccess");
  errorEl.textContent = "";
  errorEl.classList.remove("show");
  successEl.textContent = "";
  successEl.classList.remove("show");
}

function showError(message) {
  clearMessages();
  const errorEl = document.getElementById("formError");
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

function showSuccess(message) {
  clearMessages();
  const successEl = document.getElementById("formSuccess");
  successEl.textContent = message;
  successEl.classList.add("show");
}

function validateInputs(requirePhone = false) {
  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name) {
    showError("Please enter your full name.");
    return false;
  }

  if (!email || !email.includes("@")) {
    showError("Please enter a valid email address.");
    return false;
  }

  if (requirePhone && (!phone || phone.length < 7)) {
    showError("Please enter a valid phone number including country code.");
    return false;
  }

  return { name, email, phone };
}

function sendWhatsApp() {
  const data = validateInputs(true);
  if (!data) return;

  // Format phone number by removing non-numeric characters
  const cleanPhone = data.phone.replace(/\D/g, "");

  const message = `Hello ${data.name},\n\nYou are cordially invited to the upcoming KSTV Icons event! We look forward to having you join us.\n\nBest regards,\nKSTV Icons Team`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
  showSuccess("Opening WhatsApp... Your invitation link is ready!");
}

function sendEmail() {
  const data = validateInputs(false);
  if (!data) return;

  const subject = "Official Invitation - KSTV Icons Event";
  const body = `Hello ${data.name},\n\nYou are cordially invited to the upcoming KSTV Icons event! We look forward to having you join us.\n\nBest regards,\nKSTV Icons Team`;

  const mailtoUrl = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
  showSuccess("Opening email client... Your invitation is ready!");
}