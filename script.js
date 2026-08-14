function validateInputs(requirePhone = false) {
  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name) {
    alert("Please enter the guest's full name.");
    return false;
  }

  if (!email || !email.includes("@")) {
    alert("Please enter a valid email address.");
    return false;
  }

  if (requirePhone && (!phone || phone.length < 7)) {
    alert("Please enter a valid phone number including country code (numbers only).");
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
}

function sendEmail() {
  const data = validateInputs(false);
  if (!data) return;

  const subject = "Official Invitation - KSTV Icons Event";
  const body = `Hello ${data.name},\n\nYou are cordially invited to the upcoming KSTV Icons event! We look forward to having you join us.\n\nBest regards,\nKSTV Icons Team`;

  const mailtoUrl = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
}