// Config
const API = 'http://localhost:4321';

// Toast helper
function toast(msg, type = 'success') {
  const box = document.getElementById('toast');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Fetch wrapper
async function api(url, opts = {}) {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok && res.status !== 409) throw new Error(res.statusText);
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null; // 2xx with non-JSON body still counts as success
  }
}

// Load attendees
async function loadAttendees() {
  const list = await api('/api/attendees');
  const tbody = document.getElementById('attendeeTable');
  tbody.innerHTML = '';
  list.forEach((a) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50';
    tr.innerHTML = `
      <td class="py-2">${a.firstName} ${a.lastName}</td>
      <td class="py-2">${a.email}</td>
      <td class="py-2">${a.company || '-'}</td>
      <td class="py-2">${new Date(a.rsvpAt).toLocaleDateString()}</td>
      <td class="py-2">
        ${a.checkedIn ? '<span class="text-green-600">✓</span>' : '<span class="text-gray-400">—</span>'}
      </td>
      <td class="py-2">
        <button class="text-red-600 hover:underline text-xs" onclick="deleteAttendee('${a.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  const total = list.length;
  const checked = list.filter((a) => a.checkedIn).length;
  document.getElementById('totalBadge').textContent = `${total} Total`;
  document.getElementById('checkedBadge').textContent = `${checked} Checked In`;
}

// Delete attendee (on window so inline onclick works with type="module")
async function deleteAttendee(id) {
  if (!confirm('Delete this attendee?')) return;
  try {
    await api('/api/attendees', { method: 'DELETE', body: JSON.stringify({ id }) });
    toast('Attendee deleted');
    window.location.reload();
  } catch (err) {
    toast('Delete failed', 'error');
  }
}
window.deleteAttendee = deleteAttendee;

// RSVP submit
document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Registering…';
  try {
    const data = Object.fromEntries(new FormData(e.target));
    const res = await api('/api/attendees', { method: 'POST', body: JSON.stringify(data) });
    // Backend returns { error, status?, message? } for 409, or the attendee object on success
    if (res && res.error && res.status === 409) {
      toast(res.message || 'Already registered', 'info');
      return;
    }
    if (!res || !res.id) {
      toast('Registration failed', 'error');
      return;
    }
    toast('Registration successful!');
    e.target.reset();
    const canvas = document.getElementById('qrCanvas');
    await QRCode.toCanvas(canvas, JSON.stringify({ id: res.id, email: res.email }), { width: 180 });
    document.getElementById('previewCard').classList.remove('hidden');
    loadAttendees().catch(() => {}); // refresh list; don't overwrite success toast
  } catch (err) {
    toast('Registration failed', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Register';
  }
});

// Search
document.getElementById('searchInput').addEventListener('input', (e) => {
  const rows = document.querySelectorAll('#attendeeTable tr');
  const term = e.target.value.toLowerCase();
  rows.forEach((r) => (r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none'));
});

// Export CSV
document.getElementById('exportBtn').addEventListener('click', () => {
  const rows = Array.from(document.querySelectorAll('#attendeeTable tr'));
  let csv = 'Name,Email,Company,RSVP Date,Checked In\n';
  rows.forEach((r) => {
    const cells = Array.from(r.querySelectorAll('td')).slice(0, 5);
    csv += cells.map((c) => `"${c.textContent.trim()}"`).join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'attendees.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// QR scanner
document.getElementById('startScanner').addEventListener('click', async () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const box = document.getElementById('scannerBox');
  const resBox = document.getElementById('checkInResult');
  box.querySelector('p').textContent = 'Scanning…';
  document.getElementById('startScanner').classList.add('hidden');
  video.classList.remove('hidden');

  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  video.srcObject = stream;
  await video.play();

  const ctx = canvas.getContext('2d');
  const loop = setInterval(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data.data, canvas.width, canvas.height);
    if (code) {
      clearInterval(loop);
      stream.getTracks().forEach((t) => t.stop());
      video.classList.add('hidden');
      handleCheckIn(code.data);
    }
  }, 200);
});

// Check-in
async function handleCheckIn(raw) {
  const resBox = document.getElementById('checkInResult');
  try {
    const res = await api('/api/checkin', { method: 'POST', body: JSON.stringify({ qrData: raw }) });
    resBox.className = 'mt-4 p-3 rounded bg-green-100 text-green-800';
    resBox.textContent = `Checked in: ${res.attendee.firstName} ${res.attendee.lastName}`;
    loadAttendees();
  } catch (err) {
    resBox.className = 'mt-4 p-3 rounded bg-red-100 text-red-800';
    resBox.textContent = 'Check-in failed: ' + (err.message || 'Invalid or used QR code');
  }
  resBox.classList.remove('hidden');
}

// Init
loadAttendees();
setInterval(loadAttendees, 10000); // refresh every 10 s

// Load jsQR lib dynamically
const script = document.createElement('script');
script.src = 'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js';
document.head.appendChild(script);