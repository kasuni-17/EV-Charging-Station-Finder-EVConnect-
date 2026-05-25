/* EvConnect – script.js */

// ── NAV SCROLL EFFECT ─────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── HAMBURGER ─────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── SET TODAY AS MIN DATE FOR BOOKING ─────────────────────
const bookDate = document.getElementById('bookDate');
if (bookDate) {
  const today = new Date().toISOString().split('T')[0];
  bookDate.min = today;
  bookDate.value = today;

  // Date validation
  bookDate.addEventListener('change', function() {
    const selectedDate = new Date(this.value);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const errorEl = document.getElementById('dateError');
    if (selectedDate < todayDate) {
      errorEl.textContent = 'Please select a date that is today or in the future';
      errorEl.style.display = 'block';
      this.value = today;
    } else {
      errorEl.style.display = 'none';
      bookingData.date = this.value;
      const dateStr = new Date(this.value + 'T00:00').toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' });
      document.getElementById('sum-date') && (document.getElementById('sum-date').textContent = dateStr);
    }
  });
}

// ── STATIONS DATA ─────────────────────────────────────────
const stationsData = [
  {
    id: 1, name: 'City Center Hub', address: 'Colombo 03',
    dist: 0.8, connectors: ['CCS2', 'Type2', 'CHAdeMO'],
    maxKw: 150, price: 45, rating: 4.8, free: 3, total: 5,
    hours: '24/7', amenities: ['Parking', 'WiFi', 'Café'],
    status: 'available'
  },
  {
    id: 2, name: 'Kandy Road Express', address: 'Kelaniya',
    dist: 5.2, connectors: ['CCS2', 'Type2'],
    maxKw: 100, price: 40, rating: 4.6, free: 5, total: 6,
    hours: '6am–10pm', amenities: ['Parking', 'Restroom'],
    status: 'available'
  },
  {
    id: 3, name: 'Marina Beach Charge', address: 'Galle Face',
    dist: 1.4, connectors: ['Type2', 'CCS2'],
    maxKw: 50, price: 42, rating: 4.5, free: 1, total: 4,
    hours: '7am–9pm', amenities: ['Parking', 'Beach access'],
    status: 'busy'
  },
  {
    id: 4, name: 'Nugegoda Square', address: 'Nugegoda',
    dist: 3.1, connectors: ['CCS2', 'Type2', 'CHAdeMO'],
    maxKw: 150, price: 44, rating: 4.7, free: 4, total: 6,
    hours: '24/7', amenities: ['Parking', 'Shopping', 'WiFi'],
    status: 'available'
  },
  {
    id: 5, name: 'Dehiwala Point', address: 'Dehiwala',
    dist: 6.5, connectors: ['Type2'],
    maxKw: 22, price: 38, rating: 4.2, free: 0, total: 2,
    hours: '8am–8pm', amenities: ['Parking'],
    status: 'full'
  },
  {
    id: 6, name: 'Rajagiriya Hub', address: 'Rajagiriya',
    dist: 4.8, connectors: ['CCS2', 'Type2'],
    maxKw: 100, price: 43, rating: 4.6, free: 2, total: 4,
    hours: '24/7', amenities: ['Parking', 'WiFi'],
    status: 'available'
  },
  {
    id: 7, name: 'Maharagama Charge', address: 'Maharagama',
    dist: 7.2, connectors: ['CCS2', 'Type2', 'CHAdeMO'],
    maxKw: 150, price: 41, rating: 4.5, free: 6, total: 8,
    hours: '24/7', amenities: ['Parking', 'Restroom', 'Café'],
    status: 'available'
  }
];

let filteredStations = [...stationsData];
let currentView = 'list';

function renderStations(data) {
  const container = document.getElementById('stationsContainer');
  const countEl = document.getElementById('stationCount');
  if (!container) return;

  countEl && (countEl.textContent = `${data.length} station${data.length !== 1 ? 's' : ''} found`);

  if (data.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">
      <div style="font-size:2rem;margin-bottom:12px;">🔍</div>
      <div style="font-weight:600;margin-bottom:6px;">No stations found</div>
      <div style="font-size:13px;">Try adjusting your filters</div>
    </div>`;
    return;
  }

  container.innerHTML = data.map(s => {
    const statusColor = s.status === 'available' ? 'available' : s.status === 'busy' ? 'busy' : 'full';
    const statusLabel = s.free > 0 ? `${s.free} Available` : 'Full';
    const badgeClass = s.free > 1 ? 'available' : s.free === 1 ? 'busy' : 'full';
    return `
    <div class="station-list-item" onclick="openStationModal(${s.id})">
      <div class="sli-top">
        <div>
          <div class="sli-name">${s.name}</div>
          <div class="sli-addr">📍 ${s.address} · ${s.dist} km</div>
        </div>
        <div class="sc-badge ${badgeClass}">${statusLabel}</div>
      </div>
      <div class="sli-meta">
        ${s.connectors.map(c => `<span class="conn">${c}</span>`).join('')}
        <span>⚡ ${s.maxKw} kW</span>
        <span>💰 LKR ${s.price}/kWh</span>
        <span>⭐ ${s.rating}</span>
      </div>
      <div class="sli-actions">
        <span class="btn-detail" onclick="event.stopPropagation();openStationModal(${s.id})">Details</span>
        <a href="booking.html" class="btn-book" onclick="event.stopPropagation()">Book Now</a>
      </div>
    </div>
    `;
  }).join('');
}

function filterStations() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const conn = document.getElementById('connectorFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  const sort = document.getElementById('sortFilter')?.value || 'distance';

  let result = stationsData.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search) || s.address.toLowerCase().includes(search);
    const matchConn = !conn || s.connectors.includes(conn);
    const matchStatus = !status || (status === 'available' && s.free > 0) || (status === 'busy' && s.free === 0);
    return matchSearch && matchConn && matchStatus;
  });

  if (sort === 'distance') result.sort((a, b) => a.dist - b.dist);
  if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  if (sort === 'price') result.sort((a, b) => a.price - b.price);

  filteredStations = result;
  renderStations(result);
}

function setView(view) {
  currentView = view;
  const container = document.getElementById('stationsContainer');
  const listBtn = document.getElementById('listBtn');
  const gridBtn = document.getElementById('gridBtn');
  if (!container) return;

  if (view === 'grid') {
    container.classList.add('grid-view');
    gridBtn?.classList.add('active');
    listBtn?.classList.remove('active');
  } else {
    container.classList.remove('grid-view');
    listBtn?.classList.add('active');
    gridBtn?.classList.remove('active');
  }
}

function openStationModal(id) {
  const s = stationsData.find(x => x.id === id);
  if (!s) return;
  const modal = document.getElementById('stationModal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;

  const portData = {
    'CCS2': { kw: '150kW DC', free: s.free > 0 },
    'Type2': { kw: '22kW AC', free: s.free > 1 },
    'CHAdeMO': { kw: '50kW DC', free: s.free > 2 }
  };

  content.innerHTML = `
    <div class="modal-station-name">${s.name}</div>
    <div class="modal-addr">📍 ${s.address} · ${s.dist} km away</div>
    <div class="modal-ports">
      ${s.connectors.map(c => {
        const p = portData[c] || { kw: 'AC', free: true };
        return `<div class="modal-port ${p.free ? 'free' : 'busy'}">
          <strong>${c}</strong>
          <small>${p.kw} · ${p.free ? '✅ Free' : '🔴 In Use'}</small>
        </div>`;
      }).join('')}
    </div>
    <div class="modal-meta">
      <div class="modal-meta-item"><label>Max Power</label><span>⚡ ${s.maxKw} kW</span></div>
      <div class="modal-meta-item"><label>Price</label><span>💰 LKR ${s.price}/kWh</span></div>
      <div class="modal-meta-item"><label>Rating</label><span>⭐ ${s.rating} / 5</span></div>
      <div class="modal-meta-item"><label>Hours</label><span>🕐 ${s.hours}</span></div>
    </div>
    <div style="margin-bottom:16px;">
      <label style="font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Amenities</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
        ${s.amenities.map(a => `<span style="background:var(--bg);border:1px solid var(--border);padding:4px 10px;border-radius:6px;font-size:12px;">${a}</span>`).join('')}
      </div>
    </div>
    <div style="display:flex;gap:12px;">
      <a href="booking.html" class="btn-primary" style="flex:1;justify-content:center;">Book a Slot</a>
      <button onclick="closeModal()" class="btn-ghost" style="flex:1;justify-content:center;">Close</button>
    </div>
  `;

  modal.classList.add('open');
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
});

// ── BOOKING STEPPER ───────────────────────────────────────
let bookingData = {
  station: 'City Center Hub',
  date: '',
  time: '10:00',
  duration: '60',
  connector: 'CCS2',
  name: '', email: '', phone: '', vehicle: '',
  payment: 'card'
};

function nextStep(step) {
  if (step === 3) {
    const name = document.getElementById('fullName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    // gather details
    if (document.getElementById('fullName')) bookingData.name = name;
    if (document.getElementById('email')) bookingData.email = email;
    if (document.getElementById('phone')) bookingData.phone = document.getElementById('phone').value.trim();
    if (document.getElementById('vehicle')) bookingData.vehicle = document.getElementById('vehicle').value.trim();
    if (document.getElementById('bookDate')) bookingData.date = document.getElementById('bookDate').value;
    if (document.getElementById('duration')) bookingData.duration = document.getElementById('duration').value;
  }

  if (step === 4) {
    if (!document.getElementById('fullName')?.value.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!document.getElementById('email')?.value.trim()) {
      alert('Please enter your email address.');
      return;
    }
    bookingData.name = document.getElementById('fullName').value.trim();
    bookingData.email = document.getElementById('email').value.trim();
    buildSummary();
  }

  goToStep(step);
}

function prevStep(step) {
  goToStep(step);
}

function goToStep(step) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`)?.classList.add('active');

  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 < step) dot.classList.add('done'), dot.querySelector('span').textContent = '✓';
    else if (i + 1 === step) dot.classList.add('active');
    else dot.querySelector('span').textContent = i + 1;
  });
  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('done', i + 1 < step);
  });
}

function buildSummary() {
  const summary = document.getElementById('bookingSummary');
  if (!summary) return;

  const d = bookingData;
  const dateStr = d.date ? new Date(d.date + 'T00:00').toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Today';
  const durLabel = { '30': '30 mins', '60': '1 hour', '90': '1.5 hours', '120': '2 hours' }[d.duration] || '1 hour';
  const estKwh = Math.round((parseInt(d.duration) / 60) * 15);
  const estCost = estKwh * 45;

  summary.innerHTML = `
    <div class="summary-row"><label>Station</label><span>${d.station}</span></div>
    <div class="summary-row"><label>Date</label><span>${dateStr}</span></div>
    <div class="summary-row"><label>Time</label><span>${d.time}</span></div>
    <div class="summary-row"><label>Duration</label><span>${durLabel}</span></div>
    <div class="summary-row"><label>Connector</label><span>${d.connector}</span></div>
    <div class="summary-row"><label>Name</label><span>${d.name || '—'}</span></div>
    <div class="summary-row"><label>Est. Energy</label><span>~${estKwh} kWh</span></div>
    <div class="summary-row" style="margin-top:8px;padding-top:12px;border-top:2px solid var(--border);">
      <label style="font-weight:700;color:var(--dark);">Est. Total</label>
      <span style="color:var(--green-dark);font-size:1.1rem;">LKR ${estCost}</span>
    </div>
  `;

  // Update sidebar
  document.getElementById('sum-date') && (document.getElementById('sum-date').textContent = dateStr);
  document.getElementById('sum-duration') && (document.getElementById('sum-duration').textContent = durLabel);
  document.getElementById('sum-cost') && (document.getElementById('sum-cost').textContent = `LKR ${estCost}`);
}

function selectSlot(btn, time) {
  document.querySelectorAll('.time-slot.selected').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  bookingData.time = time;
  document.getElementById('sum-time') && (document.getElementById('sum-time').textContent = time);
}

function selectConn(btn, conn) {
  document.querySelectorAll('.conn-btn.selected').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  bookingData.connector = conn;
  document.getElementById('sum-conn') && (document.getElementById('sum-conn').textContent = conn);
}

// Station picker
document.querySelectorAll('.sp-card').forEach(card => {
  card.addEventListener('click', function () {
    document.querySelectorAll('.sp-card.selected').forEach(c => c.classList.remove('selected'));
    this.classList.add('selected');
    bookingData.station = this.dataset.station;
    const sumStation = document.getElementById('sum-station');
    if (sumStation) sumStation.textContent = bookingData.station;
  });
});

// Payment options
document.querySelectorAll('.pay-opt').forEach(opt => {
  opt.addEventListener('click', function () {
    document.querySelectorAll('.pay-opt.selected').forEach(o => o.classList.remove('selected'));
    this.classList.add('selected');
    bookingData.payment = this.querySelector('input').value;
  });
});

// Duration change → update cost
const durationEl = document.getElementById('duration');
if (durationEl) {
  durationEl.addEventListener('change', () => {
    bookingData.duration = durationEl.value;
    const label = durationEl.options[durationEl.selectedIndex].text;
    document.getElementById('sum-duration') && (document.getElementById('sum-duration').textContent = label);
    const estKwh = Math.round((parseInt(durationEl.value) / 60) * 15);
    const estCost = estKwh * 45;
    document.getElementById('sum-cost') && (document.getElementById('sum-cost').textContent = `LKR ${estCost}`);
  });
}

function confirmBooking() {
  const d = bookingData;
  const dateInput = document.getElementById('bookDate');
  const dateStr = dateInput?.value ? new Date(dateInput.value + 'T00:00').toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';
  const timeStr = d.time || '11:00 AM';
  const stationName = d.station || 'Colombo City Center';
  const connectorName = d.connector || 'CCS2';
  const estCost = 45;

  const refId = 'EVC-' + Date.now().toString(36).toUpperCase().slice(-6);

  document.getElementById('bookingRef').textContent = refId;
  document.getElementById('successDetails').innerHTML = `
    <span><strong>Station:</strong> <span>${stationName}</span></span>
    <span><strong>Date & Time:</strong> <span>${dateStr}, ${timeStr}</span></span>
    <span><strong>Connector:</strong> <span>${connectorName} (50kW)</span></span>
    <span><strong>Est. Cost:</strong> <span>Rs. ${estCost}.00</span></span>
  `;

  document.getElementById('successModal').classList.add('open');
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Booking page initialization
  if (document.querySelector('.booking-section')) {
    // Initialize booking data with default values
    bookingData.station = 'Colombo City Center';
    bookingData.time = '11:00 AM';
    bookingData.connector = 'CCS2';

    const dateInput = document.getElementById('bookDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      bookingData.date = today;
      const dateStr = new Date(today + 'T00:00').toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      document.getElementById('sum-date') && (document.getElementById('sum-date').textContent = dateStr);
    }

    // Update sidebar with initial values
    document.getElementById('sum-station') && (document.getElementById('sum-station').textContent = bookingData.station);
    document.getElementById('sum-time') && (document.getElementById('sum-time').textContent = bookingData.time + ' - 12:00 PM');
    document.getElementById('sum-conn') && (document.getElementById('sum-conn').textContent = bookingData.connector + ' (50kW)');

    // Stepper functionality
    const stepDots = document.querySelectorAll('.step-dot');
    let currentStep = 0;

    stepDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (index <= currentStep || index === currentStep + 1) {
          goToStep(index);
        }
      });
    });

    function goToStep(stepIndex) {
      stepDots.forEach((dot, index) => {
        if (index <= stepIndex) {
          dot.classList.add('active');
          dot.classList.add('done');
        } else {
          dot.classList.remove('active');
          dot.classList.remove('done');
        }
      });
      currentStep = stepIndex;
    }

    // Station card selection
    const stationCards = document.querySelectorAll('.sp-card');
    stationCards.forEach(card => {
      card.addEventListener('click', () => {
        stationCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        bookingData.station = card.dataset.station;
        document.getElementById('sum-station') && (document.getElementById('sum-station').textContent = bookingData.station);
        // Auto-advance to step 2
        nextStep();
      });
    });

    // Time slot selection
    const timeSlots = document.querySelectorAll('.time-slot.available');
    timeSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        timeSlots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        const timeText = slot.textContent;
        bookingData.time = timeText;
        document.getElementById('sum-time') && (document.getElementById('sum-time').textContent = timeText + ' - 12:00 PM');
        // Auto-advance to step 3
        nextStep();
      });
    });

    // Customer login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          console.log('Login response:', data);
          console.log('User data:', data.user);
          console.log('Is admin:', data.user?.isAdmin);

          if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Check if user is admin and redirect accordingly
            // Also check if email is admin email as a fallback
            const isAdmin = data.user?.isAdmin || email === 'admin@evconnect.lk';
            
            if (isAdmin) {
              alert('Admin login successful! Redirecting to dashboard...');
              window.location.href = 'admin-dashboard.html';
            } else {
              alert('Login successful! Redirecting to home...');
              window.location.href = 'index.html';
            }
          } else {
            alert(data.message || 'Login failed');
          }
        } catch (error) {
          alert('Server error. Please try again.');
          console.error('Login error:', error);
        }
      });
    }

    // Customer registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        if (password !== confirmPassword) {
          alert('Passwords do not match.');
          return;
        }

        if (!agreeTerms) {
          alert('Please agree to the Terms of Service.');
          return;
        }

        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, phone, password })
          });

          const data = await response.json();

          if (response.ok) {
            alert('Registration successful! Please login to continue.');
            window.location.href = 'login.html';
          } else {
            alert(data.message || 'Registration failed');
          }
        } catch (error) {
          alert('Server error. Please try again.');
          console.error('Registration error:', error);
        }
      });
    }

    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        try {
          const response = await fetch('http://localhost:5000/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Admin login successful! Redirecting to dashboard...');
            window.location.href = 'admin-dashboard.html';
          } else {
            alert(data.message || 'Admin login failed');
          }
        } catch (error) {
          alert('Server error. Please try again.');
          console.error('Admin login error:', error);
        }
      });
    }

    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      // Star rating functionality
      const stars = document.querySelectorAll('.star');
      const ratingValue = document.getElementById('ratingValue');

      stars.forEach(star => {
        star.addEventListener('click', function() {
          const rating = this.dataset.rating;
          ratingValue.value = rating;

          stars.forEach((s, index) => {
            if (index < rating) {
              s.classList.add('active');
            } else {
              s.classList.remove('active');
            }
          });
        });

        star.addEventListener('mouseenter', function() {
          const rating = this.dataset.rating;
          stars.forEach((s, index) => {
            if (index < rating) {
              s.style.color = '#fbbf24';
            } else {
              s.style.color = '';
            }
          });
        });

        star.addEventListener('mouseleave', function() {
          stars.forEach(s => {
            s.style.color = '';
          });
          const currentRating = ratingValue.value;
          stars.forEach((s, index) => {
            if (index < currentRating) {
              s.classList.add('active');
            } else {
              s.classList.remove('active');
            }
          });
        });
      });

      // Feedback form submission
      feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const bookingRef = document.getElementById('bookingRef').value;
        const stationName = document.getElementById('stationName').value;
        const rating = document.getElementById('ratingValue').value;
        const chargingSpeed = document.querySelector('input[name="chargingSpeed"]:checked')?.value;
        const cleanliness = document.querySelector('input[name="cleanliness"]:checked')?.value;
        const staffFriendliness = document.querySelector('input[name="staffFriendliness"]:checked')?.value;
        const comments = document.getElementById('comments').value;
        const recommend = document.querySelector('input[name="recommend"]:checked')?.value;

        if (rating === '0') {
          alert('Please select a star rating.');
          return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
          const response = await fetch('http://localhost:5000/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingRef,
              stationName,
              rating: parseInt(rating),
              chargingSpeed,
              cleanliness,
              staffFriendliness,
              comments,
              recommend,
              userEmail: user.email || 'guest'
            })
          });

          const data = await response.json();

          if (response.ok) {
            alert('Thank you for your feedback! Your review has been submitted.');
            feedbackForm.reset();
            ratingValue.value = '0';
            stars.forEach(s => s.classList.remove('active'));
            window.location.href = 'index.html';
          } else {
            alert(data.message || 'Feedback submission failed');
          }
        } catch (error) {
          alert('Server error. Please try again.');
          console.error('Feedback error:', error);
        }
      });
    }

    // Stations page
    if (document.getElementById('stationsContainer')) {
      renderStations(stationsData);

      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('keydown', e => {
          if (e.key === 'Enter') filterStations();
        });
      }
    }

    // Admin dashboard - Load feedback
    const adminFeedbackList = document.getElementById('adminFeedbackList');
    if (adminFeedbackList) {
      fetch('http://localhost:5000/api/feedback')
        .then(response => response.json())
        .then(feedbackData => {
          if (feedbackData.length > 0) {
            adminFeedbackList.innerHTML = feedbackData.slice(-5).reverse().map(fb => {
              const stars = '⭐'.repeat(fb.rating);
              const date = new Date(fb.createdAt).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
              return `
                <div class="feedback-item">
                  <div class="feedback-header">
                    <span class="feedback-user">${fb.userEmail ? fb.userEmail.split('@')[0] : 'Guest'}</span>
                    <span class="feedback-rating">${stars}</span>
                  </div>
                  <p class="feedback-text">${fb.comments || 'No comments provided'}</p>
                  <span class="feedback-station">${fb.stationName} · ${date}</span>
                </div>
              `;
            }).join('');
          }
        })
        .catch(error => {
          console.error('Error loading feedback:', error);
        });
    }

    // Logout functionality
    const logoutBtns = document.querySelectorAll('.btn-nav');
    logoutBtns.forEach(btn => {
      if (btn.textContent === 'Logout') {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          localStorage.removeItem('isAdminLoggedIn');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert('Logged out successfully!');
          window.location.href = 'admin-login.html';
        });
      }
    });

    // Admin dashboard - Booking management
    const viewButtons = document.querySelectorAll('.action-btn.view');
    const editButtons = document.querySelectorAll('.action-btn.edit');

    // Add delete buttons to each booking row
    const bookingRows = document.querySelectorAll('.bookings-table tbody tr');
    bookingRows.forEach((row, index) => {
      const actionsCell = row.querySelector('td:last-child');
      if (actionsCell) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.background = '#fee2e2';
        deleteBtn.style.color = '#dc2626';
        deleteBtn.style.border = 'none';
        deleteBtn.onclick = () => openDeleteModal(index);
        actionsCell.appendChild(deleteBtn);
      }
    });

    // View button functionality
    viewButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        alert('View booking details - Feature coming soon');
      });
    });

    // Edit button functionality
    editButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => openEditModal(index));
    });

    // Edit booking form submission
    const editBookingForm = document.getElementById('editBookingForm');
    if (editBookingForm) {
      editBookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const bookingId = document.getElementById('editBookingId').value;
        const token = localStorage.getItem('token');

        if (!token) {
          alert('Please login first');
          return;
        }

        const updateData = {
          name: document.getElementById('editCustomerName').value,
          station: document.getElementById('editStation').value,
          connector: document.getElementById('editConnector').value,
          status: document.getElementById('editStatus').value,
          amount: parseFloat(document.getElementById('editAmount').value)
        };

        try {
          const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });

          const data = await response.json();

          if (response.ok) {
            alert('Booking updated successfully!');
            closeModal();
            loadAdminBookings(); // Reload bookings to show updated data
          } else {
            alert(data.message || 'Failed to update booking');
          }
        } catch (error) {
          console.error('Error updating booking:', error);
          alert('Server error. Please try again.');
        }
      });
    }

    // Delete button functionality
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', async function() {
        const bookingId = window.deleteBookingId;
        const token = localStorage.getItem('token');

        if (!token) {
          alert('Please login first');
          return;
        }

        if (!bookingId) {
          alert('No booking selected for deletion');
          return;
        }

        try {
          const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();

          if (response.ok) {
            alert('Booking deleted successfully!');
            closeModal();
            loadAdminBookings(); // Reload bookings to show updated data
            window.deleteBookingId = null;
          } else {
            alert(data.message || 'Failed to delete booking');
          }
        } catch (error) {
          console.error('Error deleting booking:', error);
          alert('Server error. Please try again.');
        }
      });
    }

    // Add SVG gradient for ring if on home page
    if (document.querySelector('.ring-svg')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
      `;
      document.querySelector('.ring-svg').prepend(defs);
    }

    // Animate on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.step-card, .station-card, .value-card, .team-card, .coverage-area').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      observer.observe(el);
    });
  }
  });

// Star rating initialization function
function initStarRating() {
  const stars = document.querySelectorAll('.star');
  const ratingValue = document.getElementById('ratingValue');

  if (stars.length > 0 && ratingValue) {
    stars.forEach(star => {
      star.addEventListener('click', function() {
        const rating = this.dataset.rating;
        ratingValue.value = rating;

        stars.forEach((s, index) => {
          if (index < rating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });

      star.addEventListener('mouseenter', function() {
        const rating = this.dataset.rating;
        stars.forEach((s, index) => {
          if (index < rating) {
            s.style.color = '#fbbf24';
          } else {
            s.style.color = '';
          }
        });
      });

      star.addEventListener('mouseleave', function() {
        stars.forEach(s => {
          s.style.color = '';
        });
        const currentRating = ratingValue.value;
        stars.forEach((s, index) => {
          if (index < currentRating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });
  }
}

// Initialize star rating after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStarRating);
} else {
  initStarRating();
}

// Admin dashboard - Load bookings
function loadAdminBookings() {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch('http://localhost:5000/api/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(bookings => {
      const tbody = document.querySelector('.bookings-table tbody');
      if (tbody) {
        tbody.innerHTML = bookings.map(booking => `
          <tr>
            <td><span class="booking-id">${booking.bookingId || 'EVC-' + booking._id.substring(0, 6).toUpperCase()}</span></td>
            <td>
              <div class="customer-info">
                <span class="customer-name">${booking.name || 'N/A'}</span>
                <span class="customer-email">${booking.email || 'N/A'}</span>
              </div>
            </td>
            <td>${booking.station || 'N/A'}</td>
            <td>${booking.date ? new Date(booking.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}<br>${booking.time || 'N/A'}</td>
            <td>${booking.connector || 'N/A'}</td>
            <td><span class="status-badge ${booking.status || 'confirmed'}">${booking.status || 'Confirmed'}</span></td>
            <td>Rs. ${booking.amount || '0.00'}</td>
            <td>
              <button class="action-btn view" onclick="viewBooking('${booking._id}')">View</button>
              <button class="action-btn edit" onclick="openEditModal('${booking._id}')">Edit</button>
              <button class="action-btn delete" onclick="openDeleteModal('${booking._id}')">Delete</button>
            </td>
          </tr>
        `).join('');

        // Re-attach event listeners to new buttons
        attachBookingActionListeners();
      }
    })
    .catch(error => {
      console.error('Error loading bookings:', error);
    });
}

// Attach event listeners to booking action buttons
function attachBookingActionListeners() {
  const viewButtons = document.querySelectorAll('.action-btn.view');
  const editButtons = document.querySelectorAll('.action-btn.edit');
  const deleteButtons = document.querySelectorAll('.action-btn.delete');

  viewButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      viewBooking(bookingId);
    });
  });

  editButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      openEditModal(bookingId);
    });
  });

  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      openDeleteModal(bookingId);
    });
  });
}

// View booking details
function viewBooking(bookingId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(booking => {
      const modal = document.getElementById('viewBookingModal');
      const detailsDiv = document.getElementById('viewBookingDetails');
      
      if (modal && detailsDiv) {
        const dateStr = booking.date ? new Date(booking.date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
        
        detailsDiv.innerHTML = `
          <div class="detail-row">
            <span class="detail-label">Booking ID:</span>
            <span class="detail-value">${booking.bookingId || 'EVC-' + booking._id.substring(0, 6).toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Customer Name:</span>
            <span class="detail-value">${booking.name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${booking.email || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${booking.phone || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Station:</span>
            <span class="detail-value">${booking.station || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${dateStr}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${booking.time || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Connector:</span>
            <span class="detail-value">${booking.connector || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge ${booking.status || 'confirmed'}">${booking.status || 'Confirmed'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">Rs. ${booking.amount || '0.00'}</span>
          </div>
        `;
        modal.classList.add('open');
      }
    })
    .catch(error => {
      console.error('Error viewing booking:', error);
      alert('Error loading booking details');
    });
}

// Open edit modal with booking data
function openEditModal(bookingId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(booking => {
      const modal = document.getElementById('editBookingModal');
      if (modal) {
        document.getElementById('editBookingId').value = booking._id;
        document.getElementById('editCustomerName').value = booking.name || '';
        document.getElementById('editStation').value = booking.station || '';
        document.getElementById('editConnector').value = booking.connector || '';
        document.getElementById('editStatus').value = booking.status || 'confirmed';
        document.getElementById('editAmount').value = booking.amount || '0';
        modal.classList.add('open');
      }
    })
    .catch(error => {
      console.error('Error loading booking for edit:', error);
      alert('Error loading booking details');
    });
}

// Open delete modal with booking data
function openDeleteModal(bookingId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(booking => {
      const modal = document.getElementById('deleteBookingModal');
      const detailsDiv = document.getElementById('deleteBookingDetails');
      if (modal && detailsDiv) {
        detailsDiv.innerHTML = `
          <p><strong>Booking ID:</strong> ${booking.bookingId || 'EVC-' + booking._id.substring(0, 6).toUpperCase()}</p>
          <p><strong>Customer:</strong> ${booking.name || 'N/A'}</p>
          <p><strong>Station:</strong> ${booking.station || 'N/A'}</p>
          <p><strong>Date & Time:</strong> ${booking.date || 'N/A'} ${booking.time || 'N/A'}</p>
        `;
        modal.classList.add('open');
        window.deleteBookingId = booking._id;
      }
    })
    .catch(error => {
      console.error('Error loading booking for delete:', error);
      alert('Error loading booking details');
    });
}

// Load bookings when admin dashboard is loaded
if (window.location.pathname.includes('admin-dashboard.html')) {
  loadAdminBookings();
}

// Stations page search functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const stationCards = document.querySelectorAll('.station-card');
    let visibleCount = 0;

    stationCards.forEach(card => {
      const stationName = card.querySelector('h3').textContent.toLowerCase();
      const stationAddress = card.querySelector('p').textContent.toLowerCase();

      if (stationName.includes(searchTerm) || stationAddress.includes(searchTerm)) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update station count
    const countLabel = document.querySelector('.section-label');
    if (countLabel) {
      countLabel.textContent = `${visibleCount} station${visibleCount !== 1 ? 's' : ''} found`;
    }
  });
}

// Step navigation functions
function nextStep() {
  const currentStep = document.querySelector('.form-step.active');
  if (!currentStep) {
    console.error('No active step found');
    return;
  }

  const stepNumber = currentStep.id.replace('step', '');
  const nextStepNum = parseInt(stepNumber) + 1;

  if (nextStepNum <= 3) {
    currentStep.classList.remove('active');
    currentStep.style.display = 'none';
    document.getElementById('step' + nextStepNum).classList.add('active');
    document.getElementById('step' + nextStepNum).style.display = 'block';

    // Update stepper dots
    const stepDots = document.querySelectorAll('.step-dot');
    stepDots.forEach((dot, index) => {
      if (index < nextStepNum) {
        dot.classList.add('done');
      }
      if (index === nextStepNum - 1) {
        dot.classList.add('active');
      }
    });
  }
}

function prevStep() {
  const currentStep = document.querySelector('.form-step.active');
  const stepNumber = currentStep.id.replace('step', '');
  const prevStepNum = parseInt(stepNumber) - 1;

  if (prevStepNum >= 1) {
    currentStep.classList.remove('active');
    currentStep.style.display = 'none';
    document.getElementById('step' + prevStepNum).classList.add('active');
    document.getElementById('step' + prevStepNum).style.display = 'block';

    // Update stepper dots
    const stepDots = document.querySelectorAll('.step-dot');
    stepDots.forEach((dot, index) => {
      if (index >= prevStepNum) {
        dot.classList.remove('done');
      }
      if (index === prevStepNum - 1) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
}

// Open edit modal
function openEditModal(index) {
  const modal = document.getElementById('editBookingModal');
  const rows = document.querySelectorAll('.bookings-table tbody tr');
  const row = rows[index];

  if (row && modal) {
    const cells = row.querySelectorAll('td');
    document.getElementById('editBookingId').value = index;
    document.getElementById('editCustomerName').value = cells[1].querySelector('.customer-name').textContent;
    document.getElementById('editStation').value = cells[2].textContent.trim();
    document.getElementById('editConnector').value = cells[4].textContent.trim();
    document.getElementById('editAmount').value = parseFloat(cells[6].textContent.replace('Rs. ', '').replace('.00', ''));

    const statusText = cells[5].querySelector('.status-badge').textContent.toLowerCase();
    const statusSelect = document.getElementById('editStatus');
    if (statusText === 'confirmed') statusSelect.value = 'confirmed';
    else if (statusText === 'in progress') statusSelect.value = 'in-progress';
    else if (statusText === 'completed') statusSelect.value = 'completed';
    else if (statusText === 'cancelled') statusSelect.value = 'cancelled';

    modal.classList.add('open');
  }
}

// Open delete modal
function openDeleteModal(index) {
  const modal = document.getElementById('deleteBookingModal');
  const detailsDiv = document.getElementById('deleteBookingDetails');
  const rows = document.querySelectorAll('.bookings-table tbody tr');
  const row = rows[index];

  if (row && modal && detailsDiv) {
    const cells = row.querySelectorAll('td');
    detailsDiv.innerHTML = `
      <p><strong>Booking ID:</strong> ${cells[0].querySelector('.booking-id').textContent}</p>
      <p><strong>Customer:</strong> ${cells[1].querySelector('.customer-name').textContent}</p>
      <p><strong>Station:</strong> ${cells[2].textContent.trim()}</p>
      <p><strong>Date & Time:</strong> ${cells[3].innerHTML.replace('<br>', ' ')}</p>
    `;
    modal.classList.add('open');
    window.deleteIndex = index;
  }
}

// Close modal function
function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('open');
  });
}
