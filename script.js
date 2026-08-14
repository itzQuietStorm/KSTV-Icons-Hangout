// Supabase Configuration
const SUPABASE_URL = 'https://jmpdquhvvfzcmeimyywi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcGRxdWh2dmZ6Y21laW15eXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzk3NjgsImV4cCI6MjEwMjExNTc2OH0.oQ9MJZQZiVvwuqAlzuCo_gknyKUcXtaGeLp6Bq-5Wyw';

// Initialize Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Form state management
const initialValues = {
  full_name: '',
  email: '',
  whatsapp_number: '',
  attendance: 'attending',
  payment_made: '',
};

let formValues = { ...initialValues };
let formErrors = {};

// Auto-update form state when inputs change
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inviteForm');
  if (form) {
    form.addEventListener('change', (e) => {
      const { name, value } = e.target;
      formValues[name] = value;
      
      // Clear error for this field
      if (formErrors[name]) {
        delete formErrors[name];
        document.getElementById(`error-${name}`).textContent = '';
      }
      
      // Show/hide payment section based on attendance
      if (name === 'attendance') {
        const paymentSection = document.getElementById('paymentSection');
        if (value === 'attending') {
          paymentSection.style.display = 'block';
          formValues.payment_made = '';
          document.getElementById('payment_made').value = '';
        } else {
          paymentSection.style.display = 'none';
          formValues.payment_made = '';
          document.getElementById('payment_made').value = '';
        }
      }
    });
  }
});

function clearMessages() {
  document.getElementById('formError').textContent = '';
  document.getElementById('formError').classList.remove('show');
  document.getElementById('formSuccess').textContent = '';
  document.getElementById('formSuccess').classList.remove('show');
  
  // Clear all field errors
  Object.keys(initialValues).forEach((field) => {
    const errorEl = document.getElementById(`error-${field}`);
    if (errorEl) errorEl.textContent = '';
  });
}

function showError(message, field = null) {
  clearMessages();
  if (field) {
    const errorEl = document.getElementById(`error-${field}`);
    if (errorEl) errorEl.textContent = message;
    formErrors[field] = message;
  } else {
    const errorEl = document.getElementById('formError');
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

function showSuccess(message) {
  clearMessages();
  const successEl = document.getElementById('formSuccess');
  successEl.textContent = message;
  successEl.classList.add('show');
}

function validateForm() {
  formErrors = {};
  clearMessages();
  
  // Validate full name
  if (!formValues.full_name.trim()) {
    showError('Please enter your full name.', 'full_name');
  }
  
  // Validate email
  if (!formValues.email.trim()) {
    showError('Please enter your email address.', 'email');
  } else if (!formValues.email.includes('@')) {
    showError('Please enter a valid email address.', 'email');
  }
  
  // Validate WhatsApp number
  if (!formValues.whatsapp_number.trim()) {
    showError('Please enter your WhatsApp number.', 'whatsapp_number');
  } else if (formValues.whatsapp_number.replace(/\D/g, '').length < 7) {
    showError('Please enter a valid phone number.', 'whatsapp_number');
  }
  
  // Validate attendance
  if (!formValues.attendance) {
    showError('Please select your attendance status.', 'attendance');
  }
  
  // If attending, validate payment is confirmed
  if (formValues.attendance === 'attending') {
    if (!formValues.payment_made) {
      showError('Please confirm your payment status.', 'payment_made');
      return false;
    } else if (formValues.payment_made === 'no') {
      showError('Try again after making payment', 'payment_made');
      return false;
    }
  }
  
  return Object.keys(formErrors).length === 0;
}

async function saveRegistration() {
  if (!supabase) {
    console.error('Supabase client is not available.');
    return false;
  }

  const registrationData = {
    full_name: formValues.full_name.trim(),
    email: formValues.email.trim(),
    whatsapp_number: formValues.whatsapp_number.trim(),
    attendance: formValues.attendance,
    payment_made: formValues.payment_made || 'not_required'
  };

  const { error } = await supabase.from('registrations').insert([registrationData]);

  if (error) {
    console.error('Supabase insert error:', error);
    return false;
  }

  return true;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Check if not attending
  if (formValues.attendance === 'not_attending') {
    showError('Sorry we will not have you around 😔');
    setTimeout(() => {
      resetForm();
    }, 2000);
    return;
  }
  
  // If attending, payment must be confirmed as 'yes'
  if (formValues.attendance === 'attending' && formValues.payment_made !== 'yes') {
    showError('Try again after making payment');
    return;
  }

  const saved = await saveRegistration();
  if (!saved) {
    showError('Registration could not be saved. Please check Supabase and try again.');
    return;
  }
  
  // Show submit confirmation
  showSuccess('Registration confirmed! Your invitation is ready.');
  
  // Generate QR code after a brief delay
  setTimeout(() => {
    generateQRCode(formValues.full_name.trim());
  }, 500);
}

function resetForm() {
  formValues = { ...initialValues };
  formErrors = {};
  
  const form = document.getElementById('inviteForm');
  if (form) form.reset();
  
  document.getElementById('paymentSection').style.display = 'none';
  clearMessages();
}

function sendWhatsApp() {
  const cleanPhone = formValues.whatsapp_number.replace(/\D/g, '');
  const message = `Hello ${formValues.full_name},\n\nYou are cordially invited to the upcoming KSTV Icons event! We look forward to having you join us.\n\nBest regards,\nKSTV Icons Team`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
  showSuccess('Opening WhatsApp... Your invitation link is ready!');
  
  setTimeout(() => {
    resetForm();
  }, 2000);
}

function sendEmail() {
  const subject = 'Official Invitation - KSTV Icons Event';
  const body = `Hello ${formValues.full_name},\n\nYou are cordially invited to the upcoming KSTV Icons event! We look forward to having you join us.\n\nBest regards,\nKSTV Icons Team`;
  const mailtoUrl = `mailto:${encodeURIComponent(formValues.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.location.href = mailtoUrl;
  showSuccess('Opening email client... Your invitation is ready!');
  
  setTimeout(() => {
    resetForm();
  }, 2000);
}

function scrollToForm() {
  const form = document.getElementById('inviteForm');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth' });
  }
}
// QR Code functions
let currentQRCode = null;

function generateQRCode(participantName) {
  const qrContainer = document.getElementById('qrCode');
  const qrLink = document.getElementById('qrLink');
  const safeName = participantName.trim();

  qrContainer.innerHTML = '';

  const confirmationURL = new URL('confirmation.html', window.location.href);
  confirmationURL.searchParams.set('name', safeName);

  if (qrLink) {
    qrLink.href = confirmationURL.toString();
    qrLink.textContent = confirmationURL.toString();
    qrLink.style.display = 'inline-block';
  }

  currentQRCode = new QRCode(qrContainer, {
    text: confirmationURL.toString(),
    width: 250,
    height: 250,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById('participantName').textContent = safeName;
  document.getElementById('confirmationModal').style.display = 'flex';
}

function downloadQRCode() {
  // Get the canvas element from QR code
  const canvas = document.querySelector('#qrCode canvas');
  
  if (!canvas) {
    alert('QR Code not found. Please try again.');
    return;
  }
  
  // Create a download link
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `KSTV-Icons-${formValues.full_name.replace(/\s+/g, '-')}-QR.png`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function closeConfirmation() {
  document.getElementById('confirmationModal').style.display = 'none';
  const qrLink = document.getElementById('qrLink');
  if (qrLink) {
    qrLink.textContent = 'Generating link...';
    qrLink.href = '#';
    qrLink.style.display = 'none';
  }
  resetForm();
  scrollToForm();
}
