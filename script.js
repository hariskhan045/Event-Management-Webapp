/* ============================================================
   EVENT HORIZON – script.js
   Features:
   ✔ Initial events from array
   ✔ Add event with form validation + warning
   ✔ Delete event
   ✔ Past vs upcoming highlighting
   ✔ Auto-sort by date ascending
   ✔ Search/filter by name or date
   ✔ Live header counters
   ============================================================ */

/* ── Initial Data ──────────────────────────────────────────── */
let events = [
  {
    id: Date.now() + 1,
    name: "Tech Summit 2025",
    date: "2025-09-14",
    desc: "A global gathering of software engineers, designers, and innovators discussing the future of technology."
  },
  {
    id: Date.now() + 2,
    name: "Design Week Peshawar",
    date: "2025-07-22",
    desc: "Local design community showcase featuring UI/UX portfolios, branding workshops, and creative talks."
  },
  {
    id: Date.now() + 3,
    name: "Open Source Hackathon",
    date: "2025-10-05",
    desc: "48-hour hackathon to build open-source tools for education and accessibility."
  },
  {
    id: Date.now() + 4,
    name: "UET Annual Tech Fest",
    date: "2024-04-10",
    desc: "University-level competition covering robotics, web development, and machine learning challenges."
  },
  {
    id: Date.now() + 5,
    name: "Startup Pitch Night",
    date: "2024-11-30",
    desc: "Entrepreneurs pitch their early-stage startups to investors and mentors in a fast-paced event."
  }
];

/* ── DOM References ────────────────────────────────────────── */
const eventsGrid    = document.getElementById("eventsGrid");
const emptyState    = document.getElementById("emptyState");
const warningBox    = document.getElementById("warningBox");
const addEventBtn   = document.getElementById("addEventBtn");
const searchInput   = document.getElementById("searchInput");
const totalCount    = document.getElementById("totalCount");
const upcomingCount = document.getElementById("upcomingCount");

const nameInput = document.getElementById("eventName");
const dateInput = document.getElementById("eventDate");
const descInput = document.getElementById("eventDesc");

/* ── Helpers ───────────────────────────────────────────────── */
function isUpcoming(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) >= today;
}

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
}

function sortByDate(arr) {
  return [...arr].sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* ── Render ────────────────────────────────────────────────── */
function render(filter = "") {
  const query = filter.trim().toLowerCase();

  const filtered = sortByDate(events).filter(ev =>
    ev.name.toLowerCase().includes(query) ||
    ev.date.includes(query)
  );

  eventsGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.add("visible");
  } else {
    emptyState.classList.remove("visible");
    filtered.forEach(ev => {
      const upcoming = isUpcoming(ev.date);
      const card = document.createElement("div");
      card.className = `event-card ${upcoming ? "upcoming" : "past"}`;
      card.dataset.id = ev.id;

      card.innerHTML = `
        <span class="card-tag ${upcoming ? "upcoming" : "past"}">
          ${upcoming ? "✦ Upcoming" : "✗ Past"}
        </span>
        <h3 class="card-name">${escapeHTML(ev.name)}</h3>
        <p class="card-date">📅 ${formatDate(ev.date)}</p>
        <p class="card-desc">${escapeHTML(ev.desc)}</p>
        <button class="btn-delete" data-id="${ev.id}">🗑 Delete</button>
      `;

      eventsGrid.appendChild(card);
    });
  }

  updateStats();
}

/* ── Stats counter ─────────────────────────────────────────── */
function updateStats() {
  totalCount.textContent    = `${events.length} Event${events.length !== 1 ? "s" : ""}`;
  const upcoming = events.filter(e => isUpcoming(e.date)).length;
  upcomingCount.textContent = `${upcoming} Upcoming`;
}

/* ── Escape HTML (XSS safety) ──────────────────────────────── */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Add Event ─────────────────────────────────────────────── */
addEventBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const date = dateInput.value.trim();
  const desc = descInput.value.trim();

  // Validation
  if (!name || !date || !desc) {
    warningBox.classList.add("visible");
    setTimeout(() => warningBox.classList.remove("visible"), 3500);
    return;
  }

  warningBox.classList.remove("visible");

  const newEvent = {
    id:   Date.now(),
    name,
    date,
    desc
  };

  events.push(newEvent);

  // Clear form
  nameInput.value = "";
  dateInput.value = "";
  descInput.value = "";

  render(searchInput.value);

  // Scroll to new card smoothly
  const card = eventsGrid.querySelector(`[data-id="${newEvent.id}"]`);
  if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

/* ── Delete Event (delegated) ──────────────────────────────── */
eventsGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = parseInt(e.target.dataset.id, 10);
    // Animate out
    const card = e.target.closest(".event-card");
    card.style.transition = "opacity .25s, transform .25s";
    card.style.opacity    = "0";
    card.style.transform  = "scale(.93)";
    setTimeout(() => {
      events = events.filter(ev => ev.id !== id);
      render(searchInput.value);
    }, 250);
  }
});

/* ── Search / Filter ───────────────────────────────────────── */
searchInput.addEventListener("input", () => {
  render(searchInput.value);
});

/* ── Set Footer Year ───────────────────────────────────────── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ── Initial Render ────────────────────────────────────────── */
render();
