const SUPABASE_URL = 'https://jmpdquhvvfzcmeimyywi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcGRxdWh2dmZ6Y21laW15eXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzk3NjgsImV4cCI6MjEwMjExNTc2OH0.oQ9MJZQZiVvwuqAlzuCo_gknyKUcXtaGeLp6Bq-5Wyw';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const loginForm = document.getElementById('adminLoginForm');
const dashboard = document.getElementById('adminDashboard');
const message = document.getElementById('adminMessage');
const countElement = document.getElementById('participantCount');

function showMessage(text, isError = true) {
  message.textContent = text;
  message.className = `admin-message${isError ? ' is-error' : ' is-success'}`;
}

async function loadParticipantCount() {
  countElement.textContent = '...';
  const { count, error } = await supabaseClient
    .from('registrations')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Supabase count error:', error);
    countElement.textContent = '--';
    showMessage('Unable to load the participant count. Check the registrations SELECT policy.');
    return;
  }

  countElement.textContent = count ?? 0;
  showMessage('Count updated.', false);
}

async function showDashboard(session) {
  if (!session) return;
  loginForm.hidden = true;
  dashboard.hidden = false;
  await loadParticipantCount();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage('Signing in...', false);
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: document.getElementById('adminEmail').value.trim(),
    password: document.getElementById('adminPassword').value
  });

  if (error) {
    console.error('Admin sign-in error:', error);
    showMessage('Sign-in failed. Check the admin email and password.');
    return;
  }

  await showDashboard(data.session);
});

document.getElementById('refreshCount').addEventListener('click', loadParticipantCount);
document.getElementById('adminLogout').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  dashboard.hidden = true;
  loginForm.hidden = false;
  loginForm.reset();
  showMessage('Signed out.', false);
});

supabaseClient.auth.getSession().then(({ data }) => showDashboard(data.session));