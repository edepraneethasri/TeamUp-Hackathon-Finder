const studentGrid = document.getElementById("studentGrid");
const searchInput = document.getElementById("searchInput");
const skillFilter = document.getElementById("skillFilter");
const emptyState = document.getElementById("emptyState");
const statusMessage = document.getElementById("statusMessage");
const profileDialog = document.getElementById("profileDialog");
const requestDialog = document.getElementById("requestDialog");
const profileForm = document.getElementById("profileForm");
const requestForm = document.getElementById("requestForm");

let students = [];

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b04444" : "#159b75";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function renderStudents() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedSkill = skillFilter.value.toLowerCase();

  const filtered = students.filter(student => {
    const searchable = [
      student.name, student.role, student.bio,
      ...student.skills, ...student.interests
    ].join(" ").toLowerCase();

    const matchesSearch = searchable.includes(searchTerm);
    const matchesSkill = !selectedSkill ||
      student.skills.some(skill => skill.toLowerCase() === selectedSkill);
    return matchesSearch && matchesSkill;
  });

  studentGrid.innerHTML = filtered.map(student => `
    <article class="student-card">
      <div class="student-top">
        <div class="student-avatar">${escapeHTML(initials(student.name))}</div>
        <div><div class="student-name">${escapeHTML(student.name)}</div>
          <div class="student-role">${escapeHTML(student.role)}</div></div>
      </div>
      <p class="card-bio">${escapeHTML(student.bio)}</p>
      <p class="tag-label">Skills</p>
      <div class="tags">${student.skills.map(skill => `<span class="tag">${escapeHTML(skill)}</span>`).join("")}</div>
      <p class="tag-label">Interests</p>
      <div class="tags">${student.interests.map(interest => `<span class="tag interest">${escapeHTML(interest)}</span>`).join("")}</div>
      <div class="card-footer"><span class="card-id">TeamUp member #${student.id}</span>
        <button class="button" data-request-id="${student.id}" data-request-name="${escapeHTML(student.name)}">Team up ↗</button>
      </div>
    </article>
  `).join("");

  emptyState.hidden = filtered.length !== 0;
}

async function loadStudents() {
  try {
    const response = await fetch("/api/students");
    if (!response.ok) throw new Error("Could not load profiles.");
    students = await response.json();
    renderStudents();
  } catch (error) {
    studentGrid.innerHTML = '<p class="empty-state">Could not connect to the server. Check that npm start is running.</p>';
    showStatus("Server connection failed. Please check the terminal.", true);
  }
}

async function loadRequests() {
  const requestList = document.getElementById("requestList");
  try {
    const response = await fetch("/api/requests");
    if (!response.ok) throw new Error("Could not load requests.");
    const requests = await response.json();
    if (requests.length === 0) {
      requestList.innerHTML = '<p class="muted">No requests yet. Choose a student above and send the first one.</p>';
      return;
    }
    requestList.innerHTML = requests.map(request => `
      <article class="request-item">
        <div><strong>${escapeHTML(request.from_name)} → ${escapeHTML(request.to_name)}</strong>
          <p>${escapeHTML(request.message)}</p></div>
        <span class="request-status">${escapeHTML(request.status)}</span>
      </article>
    `).join("");
  } catch (error) {
    requestList.innerHTML = '<p class="muted">Could not load requests. Check the server.</p>';
  }
}

function openProfile() {
  document.getElementById("profileFormMessage").textContent = "";
  profileDialog.showModal();
}

document.getElementById("openProfileTop").addEventListener("click", openProfile);
document.getElementById("openProfileHero").addEventListener("click", openProfile);
document.getElementById("openProfileSection").addEventListener("click", openProfile);
document.getElementById("refreshRequests").addEventListener("click", loadRequests);
searchInput.addEventListener("input", renderStudents);
skillFilter.addEventListener("change", renderStudents);

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => document.getElementById(button.dataset.close).close());
});

// Event delegation: handle Team up buttons even after cards are re-rendered.
studentGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-request-id]");
  if (!button) return;

  requestForm.reset();
  document.getElementById("requestFormMessage").textContent = "";
  requestForm.elements.studentId.value = button.dataset.requestId;
  document.getElementById("requestRecipient").textContent =
    `You're sending a collaboration request to ${button.dataset.requestName}.`;
  requestDialog.showModal();
});

profileForm.addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("profileFormMessage");
  message.textContent = "";

  const formData = new FormData(profileForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save profile.");

    profileForm.reset();
    profileDialog.close();
    showStatus("Profile saved successfully!");
    await loadStudents();
    document.getElementById("discover").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    message.textContent = error.message || "Could not save profile. Is the server running?";
  }
});

requestForm.addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("requestFormMessage");
  message.textContent = "";

  const payload = {
    fromName: requestForm.elements.fromName.value.trim(),
    studentId: requestForm.elements.studentId.value,
    message: requestForm.elements.message.value.trim()
  };

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not send request.");

    requestForm.reset();
    requestDialog.close();
    showStatus(result.message);
    await loadRequests();
    document.getElementById("requests").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    message.textContent = error.message || "Could not send request. Is the server running?";
  }
});

loadStudents();
loadRequests();