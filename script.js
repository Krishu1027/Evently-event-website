//1. Event data (add or edit events here)
const events = [
  { id: 1, name: "CodeStorm Hackathon", category: "Tech",   date: "2026-12-12T09:00:00", venue: "Main Auditorium",  desc: "24 hours of building, learning and pizza. Teams of up to 4." },
  { id: 2, name: "Winter Music Fest",   category: "Music",  date: "2026-12-20T18:00:00", venue: "Open Air Theatre", desc: "Live bands, DJ night and food stalls under the stars." },
  { id: 3, name: "Web Design Workshop", category: "Tech",   date: "2026-11-25T10:00:00", venue: "Computer Lab 2",   desc: "Learn HTML, CSS and JavaScript by building a real website." },
  { id: 4, name: "Canvas & Colours",    category: "Art",    date: "2027-01-08T11:00:00", venue: "Art Gallery Hall", desc: "A hands-on painting session. All materials are provided." },
  { id: 5, name: "Inter-College Cricket", category: "Sports", date: "2027-01-15T08:30:00", venue: "College Ground",  desc: "Knockout tournament with 16 teams. Come cheer or play!" },
  { id: 6, name: "AI & Future Talks",   category: "Tech",   date: "2027-02-02T14:00:00", venue: "Seminar Hall",     desc: "Industry experts talk about AI careers and real projects." }
];

//2. Grab page elements
const grid = document.getElementById("eventGrid");
const search = document.getElementById("search");
const category = document.getElementById("category");
const modal = document.getElementById("modal");
const eventSelect = document.getElementById("eventSelect");
const form = document.getElementById("form");
const success = document.getElementById("success");
const regList = document.getElementById("regList");

// Helper: nice date text
const niceDate = (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

// Helper: how much time is left?
function timeLeft(dateString) {
  const diff = new Date(dateString) - new Date();
  if (diff <= 0) return "Event started";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const mins = Math.floor(diff / 60000) % 60;
  const secs = Math.floor(diff / 1000) % 60;
  return `⏳ ${days}d ${hours}h ${mins}m ${secs}s left`;
}

//3. Show event cards 
function showEvents() {
  const text = search.value.toLowerCase();
  const chosen = category.value;

  const list = events.filter((e) =>
    e.name.toLowerCase().includes(text) && (chosen === "All" || e.category === chosen)
  );

  grid.innerHTML = list.length ? "" : "<p class='empty'>No events match your search.</p>";

  list.forEach((e, i) => {
    grid.innerHTML += `
      <article class="card" style="animation-delay:${i * 0.08}s">
        <img src="https://picsum.photos/seed/event${e.id}/400/240" alt="${e.name}">
        <div class="card-body">
          <span class="tag">${e.category}</span>
          <h3>${e.name}</h3>
          <p class="meta">📅 ${niceDate(e.date)}<br>📍 ${e.venue}</p>
          <p class="countdown" data-date="${e.date}">${timeLeft(e.date)}</p>
          <button class="btn" onclick="openEvent(${e.id})">View & Register</button>
        </div>
      </article>`;
  });
}
search.addEventListener("input", showEvents);
category.addEventListener("change", showEvents);

// Update every countdown on the page each second
setInterval(() => {
  document.querySelectorAll(".countdown[data-date]").forEach((el) => {
    el.textContent = timeLeft(el.dataset.date);
  });
}, 1000);

//4. Open the popup
function openEvent(id) {
  const e = events.find((ev) => ev.id === id);
  document.getElementById("mImg").src = `https://picsum.photos/seed/event${e.id}/600/300`;
  document.getElementById("mName").textContent = e.name;
  document.getElementById("mMeta").textContent = `📅 ${niceDate(e.date)}  |  📍 ${e.venue}`;
  document.getElementById("mDesc").textContent = e.desc;

  const mCount = document.getElementById("mCountdown");
  mCount.dataset.date = e.date;           // so the timer keeps updating
  mCount.textContent = timeLeft(e.date);

  eventSelect.value = e.name;
  form.reset();
  eventSelect.value = e.name;
  success.hidden = true;
  form.hidden = false;
  clearErrors();
  modal.showModal();
}
document.getElementById("closeBtn").onclick = () => modal.close();
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); }); // click outside to close

// Fill the event dropdown inside the form
events.forEach((e) => eventSelect.innerHTML += `<option>${e.name}</option>`);

//5. Form validation
function clearErrors() {
  ["nameErr", "emailErr", "phoneErr"].forEach((id) => (document.getElementById(id).textContent = ""));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  let ok = true;

  if (name.length < 3) {
    document.getElementById("nameErr").textContent = "Please enter at least 3 characters.";
    ok = false;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById("emailErr").textContent = "Please enter a valid email.";
    ok = false;
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    document.getElementById("phoneErr").textContent = "Enter a valid 10-digit mobile number.";
    ok = false;
  }
  if (!ok) return;

  //6. Save to Local Storage
  const registrations = JSON.parse(localStorage.getItem("registrations")) || [];
  registrations.push({ name, email, phone, event: eventSelect.value });
  localStorage.setItem("registrations", JSON.stringify(registrations));

  // Confirmation message
  success.textContent = `🎉 Thanks ${name}! You are registered for ${eventSelect.value}.`;
  success.hidden = false;
  form.hidden = true;
  showRegistrations();
});

// Show saved registrations on the page
function showRegistrations() {
  const registrations = JSON.parse(localStorage.getItem("registrations")) || [];
  regList.innerHTML = registrations.length ? "" : "<p class='empty'>No registrations yet. Pick an event above!</p>";

  registrations.forEach((r, i) => {
    regList.innerHTML += `
      <li>
        <span><strong>${r.name}</strong> → ${r.event}<br><small class="meta">${r.email} · ${r.phone}</small></span>
        <button onclick="removeRegistration(${i})">Cancel</button>
      </li>`;
  });
}

function removeRegistration(index) {
  const registrations = JSON.parse(localStorage.getItem("registrations")) || [];
  registrations.splice(index, 1);
  localStorage.setItem("registrations", JSON.stringify(registrations));
  showRegistrations();
}

//7. Dark / Light mode
const themeBtn = document.getElementById("themeBtn");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}
themeBtn.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
};
setTheme(localStorage.getItem("theme") || "light");   // remember the user's choice

//Start the page 
showEvents();
showRegistrations();
