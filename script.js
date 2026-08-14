// Form state management
const formState = {
  attending: null,
  paymentMade: null,
};

function clearMessages() {
  const errorEl = document.getElementById("formError");
  const successEl = document.getElementById("formSuccess");
  const messageEl = document.getElementById("formMessage");
  errorEl.textContent = "";
  errorEl.classList.remove("show");
  successEl.textContent = "";
  successEl.classList.remove("show");
  messageEl.textContent = "";
  messageEl.classList.remove("show", "info", "warning", "error", "success");
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

function showMessage(message, type = "info") {
  clearMessages();
  const messageEl = document.getElementById("formMessage");
  messageEl.textContent = message;
  messageEl.classList.add("show", type);
}

function resetForm() {
  formState.attending = null;
  formState.paymentMade = null;
  
  // Reset all buttons
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  
  // Hide sections
  document.getElementById("contactDetailsSection").style.display = "none";
  document.getElementById("paymentSection").style.display = "none";
  document.getElementById("submitButtonsSection").style.display = "none";
  
  // Clear input fields
  document.getElementById("fullName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  
  clearMessages();
}

function handleAttendance(response) {
  formState.attending = response === "yes";
  formState.paymentMade = null;
  
  // Update button states
  document.querySelectorAll(".option-btn[data-value]").forEach((btn) => {
    if (btn.parentElement.querySelector("label").textContent.includes("Will you be attending")) {
      btn.classList.toggle("active", btn.dataset.value === response);
    }
  });
  
  clearMessages();
  
  if (formState.attending) {
    // Show contact details and payment sections
    document.getElementById("contactDetailsSection").style.display = "block";
    document.getElementById("paymentSection").style.display = "block";
    
    // Reset payment button
    document.querySelectorAll(".option-btn[data-value]").forEach((btn) => {
      if (btn.parentElement.querySelector("label").textContent.includes("Have you made payment")) {
        btn.classList.remove("active");
      }
    });
    
    showMessage("Great! Please provide your details and confirm payment status.", "info");
  } else {
    // Not attending
    document.getElementById("contactDetailsSection").style.display = "none";
    document.getElementById("paymentSection").style.display = "none";
    document.getElementById("submitButtonsSection").style.display = "none";
    
    showMessage("Sorry we will not have you around 😞", "warning");
    
    // Clear form after showing message
    setTimeout(() => {
      resetForm();
    }, 3000);
  }
}

function handlePayment(response) {
  formState.paymentMade = response === "yes";
  
  // Update button states
  document.querySelectorAll(".option-btn[data-value]").forEach((btn) => {
    if (btn.parentElement.querySelector("label").textContent.includes("Have you made payment")) {
      btn.classList.toggle("active", btn.dataset.value === response);
    }
  });
  
  clearMessages();
  
  if (formState.paymentMade) {
    // Show submit buttons
    document.getElementById("submitButtonsSection").style.display = "flex";
    showMessage("Payment confirmed! Please send your invitation via WhatsApp or Email.", "success");
  } else {
    // Hide submit buttons
    document.getElementById("submitButtonsSection").style.display = "none";
    showMessage("Try again after you have made payment", "error");
  }
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

  // Check attendance and payment status
  if (!formState.attending || !formState.paymentMade) {
    showError("Please complete all steps before sending.");
    return;
  }

  // Format phone number by removing non-numeric characters
  const cleanPhone = data.phone.replace(/\D/g, "");

  const message = `Hello ${data.name},\n\nYou are cordially invited to the upcoming KSTV Icons event! We look forward to having you join us.\n\nBest regards,\nKSTV Icons Team`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
  showSuccess("Opening WhatsApp... Your invitation link is ready!");
  
  setTimeout(() => {
    resetForm();
  }, 2000);
}

function sendEmail() {
  const data = validateInputs(false);
  if (!data) return;

  // Check attendance and payment status
  if (!formState.attending || !formState.paymentMade) {
    showError("Please complete all steps before sending.");
    return;
  }

  const subject = "Official Invitation - KSTV Icons Event";
  const body = `Hello ${data.name},\n\nYou are cordially invited to the upcoming KSTV Icons event! We look forward to having you join us.\n\nBest regards,\nKSTV Icons Team`;

  const mailtoUrl = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
  showSuccess("Opening email client... Your invitation is ready!");
  
  setTimeout(() => {
    resetForm();
  }, 2000);
}