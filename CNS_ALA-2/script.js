
"use strict";

const TOTAL_PCS = 12;
const $ = id => document.getElementById(id);

const threats = {
  virus: {
    name: "Computer Virus",
    symbol: "✳",
    category: "File-based malware",
    spread: "11 PCs + 1 host",
    prevention: "Scan files",
    description:
      "A computer virus attaches to a host file or program. The selected host stays yellow and secure in this visual model, while all other 11 PCs become infected."
  },
  worm: {
    name: "Computer Worm",
    symbol: "⤳",
    category: "Network malware",
    spread: "All 12 PCs",
    prevention: "Patch systems",
    description:
      "A worm can spread between vulnerable systems. This demonstration animates simulated infections across all 12 PCs and highlights their LAN connections."
  },
  trojan: {
    name: "Trojan Horse",
    symbol: "♜",
    category: "Deceptive software",
    spread: "One random PC",
    prevention: "Verify software",
    description:
      "A Trojan disguises itself as legitimate software. This demonstration marks one randomly selected PC as infected while the other 11 remain online."
  }
};

const ui = {
  grid: $("pcGrid"),
  map: $("networkMap"),
  svg: $("lanSvg"),
  total: $("totalCount"),
  infected: $("infectedCount"),
  secure: $("secureCount"),
  events: $("eventCount"),
  progress: $("progress"),
  percent: $("infectedPercent"),
  networkStatus: $("networkStatus"),
  subtitle: $("networkSubtitle"),
  infoTitle: $("infoTitle"),
  infoDescription: $("infoDescription"),
  infoCategory: $("infoCategory"),
  infoSpread: $("infoSpread"),
  infoPrevention: $("infoPrevention"),
  start: $("startBtn"),
  restart: $("restartBtn"),
  change: $("changeBtn"),
  hint: $("controlHint"),
  log: $("eventLog"),
  clearLog: $("clearLogBtn"),
  toast: $("toast")
};

let currentThreat = "virus";
let infected = new Set();
let hostPC = null;
let running = false;
let completed = false;
let token = 0;
let eventCount = 0;
let eventHistory = [];
let activeTimers = new Set();
let toastTimer;

function wait(ms, runToken) {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      activeTimers.delete(timer);
      resolve(runToken === token);
    }, ms);
    activeTimers.add(timer);
  });
}

function cancelTimers() {
  activeTimers.forEach(clearTimeout);
  activeTimers.clear();
}

function pcName(n) {
  return `PC-${String(n).padStart(2, "0")}`;
}

// Distinct monitor icon for every virtual workstation.
function monitorIcon() {
  return `
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="30" height="22" rx="2"
        fill="currentColor" opacity=".95"/>
      <path d="M8 7H32V23H8Z" fill="#9feaff" opacity=".25"/>
      <path d="M20 26V31M13 32H27"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="11" y="34" width="18" height="2.5" rx="1.2"
        fill="currentColor" opacity=".8"/>
    </svg>`;
}

function createPCs() {
  ui.grid.innerHTML = "";

  for (let pc = 1; pc <= TOTAL_PCS; pc++) {
    const card = document.createElement("div");
    card.className = "pc-card online";
    card.dataset.pc = pc;

    const screen = document.createElement("div");
    screen.className = "pc-screen";
    screen.innerHTML = monitorIcon();

    const name = document.createElement("div");
    name.className = "pc-name";
    name.textContent = pcName(pc);

    const state = document.createElement("div");
    state.className = "pc-state";
    state.textContent = "ONLINE";

    card.append(screen, name, state);
    card.setAttribute("role", "img");
    card.setAttribute("aria-label", `${pcName(pc)}, online`);

    ui.grid.appendChild(card);
  }

  requestAnimationFrame(drawLAN);
}

function getPC(pc) {
  return ui.grid.querySelector(`[data-pc="${pc}"]`);
}

// Connect each PC to its right-hand and lower neighbor.
// This produces a connected 4-column by 3-row LAN layout.
function drawLAN() {
  const mapRect = ui.map.getBoundingClientRect();
  if (!mapRect.width || !mapRect.height) return;

  ui.svg.setAttribute(
    "viewBox", `0 0 ${mapRect.width} ${mapRect.height}`
  );
  ui.svg.innerHTML = "";

  const connections = [];

  for (let pc = 1; pc <= TOTAL_PCS; pc++) {
    const col = (pc - 1) % 4;
    const row = Math.floor((pc - 1) / 4);

    if (col < 3) connections.push([pc, pc + 1]);
    if (row < 2) connections.push([pc, pc + 4]);
  }

  connections.forEach(([from, to]) => {
    const a = getPC(from);
    const b = getPC(to);
    if (!a || !b) return;

    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();

    const x1 = ar.left + ar.width / 2 - mapRect.left;
    const y1 = ar.top + ar.height / 2 - mapRect.top;
    const x2 = br.left + br.width / 2 - mapRect.left;
    const y2 = br.top + br.height / 2 - mapRect.top;

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg", "line"
    );

    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.dataset.from = from;
    line.dataset.to = to;
    line.classList.add("lan-line");

    ui.svg.appendChild(line);
  });

  updateLAN();
}

function updateLAN(spreadingPC = null) {
  ui.svg.querySelectorAll(".lan-line").forEach(line => {
    const a = Number(line.dataset.from);
    const b = Number(line.dataset.to);

    line.classList.remove("spreading", "infected-link");

    if (infected.has(a) && infected.has(b)) {
      line.classList.add("infected-link");
    }

    // Animate LAN connections attached to the most recently
    // affected PC during the propagation sequence.
    if (
      spreadingPC !== null &&
      (a === spreadingPC || b === spreadingPC)
    ) {
      line.classList.add("spreading");
    }
  });
}

function setPCState(pc, state) {
  const card = getPC(pc);
  if (!card) return;

  card.classList.remove("online", "infected", "host");
  card.classList.add(state);

  const label = card.querySelector(".pc-state");

  const labels = {
    online: "ONLINE",
    infected: "INFECTED",
    host: "HOST"
  };

  label.textContent = labels[state];
  card.setAttribute("aria-label", `${pcName(pc)}, ${labels[state]}`);
}

function updateStats() {
  const count = infected.size;
  const percentage = Math.round(count / TOTAL_PCS * 100);

  ui.total.textContent = TOTAL_PCS;
  ui.infected.textContent = `${count} / ${TOTAL_PCS}`;
  ui.secure.textContent = TOTAL_PCS - count;
  ui.events.textContent = eventCount;
  ui.progress.style.width = `${percentage}%`;
  ui.percent.textContent = `${percentage}% affected`;
}

function setNetworkStatus(message, state = "") {
  ui.networkStatus.textContent = message;
  ui.networkStatus.style.color =
    state === "infected" ? "#ff4d7d" :
    state === "running" ? "#00e8f5" :
    state === "host" ? "#ffd000" : "#00e8f5";
}

function updateThreatInfo(key) {
  currentThreat = key;
  const threat = threats[key];

  document.querySelectorAll(".threat").forEach(button => {
    const selected = button.dataset.threat === key;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  ui.infoTitle.textContent = threat.name;
  ui.infoDescription.textContent = threat.description;
  ui.infoCategory.textContent = threat.category;
  ui.infoSpread.textContent = threat.spread;
  ui.infoPrevention.textContent = threat.prevention;
}

function addEvent(title, message, type = "info") {
  eventCount++;

  eventHistory.unshift({
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }),
    title,
    message,
    type
  });

  if (eventHistory.length > 100) eventHistory.pop();

  renderEvents();
  updateStats();
}

function renderEvents() {
  ui.log.innerHTML = "";

  if (!eventHistory.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No events yet. Start a simulation.";
    ui.log.appendChild(empty);
    return;
  }

  eventHistory.forEach(item => {
    const row = document.createElement("div");
    row.className = "event";

    const time = document.createElement("div");
    time.className = "event-time";
    time.textContent = item.time;

    const content = document.createElement("div");
    const title = document.createElement("div");
    title.className = "event-title";
    title.textContent = item.title;

    if (item.type === "warning") {
      const badge = document.createElement("em");
      badge.textContent = "ALERT";
      title.appendChild(badge);
    }

    const message = document.createElement("p");
    message.textContent = item.message;

    content.append(title, message);
    row.append(time, content);
    ui.log.appendChild(row);
  });
}

function toast(message) {
  clearTimeout(toastTimer);
  ui.toast.textContent = message;
  ui.toast.classList.add("show");

  toastTimer = setTimeout(() => {
    ui.toast.classList.remove("show");
  }, 2400);
}

function resetSimulation(clearHistory = true) {
  token++;
  cancelTimers();

  running = false;
  completed = false;
  infected.clear();
  hostPC = null;

  for (let pc = 1; pc <= TOTAL_PCS; pc++) {
    setPCState(pc, "online");
  }

  ui.start.disabled = false;
  ui.start.textContent = "▶  Start Simulation";
  ui.hint.textContent = "Choose a threat, then start the simulation.";
  setNetworkStatus("● READY TO SIMULATE");

  if (clearHistory) {
    eventHistory = [];
    eventCount = 0;
    renderEvents();
  }

  updateStats();
  requestAnimationFrame(() => {
    drawLAN();
  });
}

function selectThreat(key) {
  if (!threats[key]) return;

  resetSimulation(true);
  updateThreatInfo(key);
  toast(`${threats[key].name} selected`);
}

function randomPC() {
  return Math.floor(Math.random() * TOTAL_PCS) + 1;
}

async function infectPC(pc, runToken, source = false) {
  if (runToken !== token) return false;

  infected.add(pc);
  setPCState(pc, "infected");
  updateStats();
  updateLAN(pc);

  addEvent(
    source ? "Initial infection detected" : "LAN infection detected",
    `${pcName(pc)} marked infected in the browser simulation.`,
    "warning"
  );

  return true;
}

async function startSimulation() {
  if (running) return;

  if (completed) resetSimulation(true);

  running = true;
  completed = false;

  const runToken = ++token;
  const selectedThreat = currentThreat;

  ui.start.disabled = true;
  ui.start.textContent = "◌  Simulation Running";
  ui.hint.textContent = "Simulating threat activity...";
  setNetworkStatus("● INITIALIZING NETWORK", "running");

  addEvent(
    "Simulation started",
    `${threats[selectedThreat].name} visual scenario initialized.`
  );

  const valid = await wait(450, runToken);
  if (!valid) return;

  if (selectedThreat === "virus") {
    // Random host PC is selected automatically.
    // Host stays yellow and is excluded from infection.
    hostPC = randomPC();
    setPCState(hostPC, "host");

    setNetworkStatus(
      `HOST = ${pcName(hostPC)} · SPREADING TO 11 PCs`,
      "host"
    );

    addEvent(
      "Host PC selected",
      `${pcName(hostPC)} is the randomly selected host and will remain secure.`
    );

    const targets = [];
    for (let pc = 1; pc <= TOTAL_PCS; pc++) {
      if (pc !== hostPC) targets.push(pc);
    }

    // Start with nearby PCs, then spread through the whole grid.
    const order = targets.sort((a, b) => {
      const distanceA =
        Math.abs(((a - 1) % 4) - ((hostPC - 1) % 4)) +
        Math.abs(Math.floor((a - 1) / 4) -
                 Math.floor((hostPC - 1) / 4));

      const distanceB =
        Math.abs(((b - 1) % 4) - ((hostPC - 1) % 4)) +
        Math.abs(Math.floor((b - 1) / 4) -
                 Math.floor((hostPC - 1) / 4));

      return distanceA - distanceB;
    });

    for (let i = 0; i < order.length; i++) {
      const ok = await wait(260, runToken);
      if (!ok) return;

      await infectPC(order[i], runToken);
      if (runToken !== token) return;
    }

    // Reassert host state after the full spread.
    setPCState(hostPC, "host");

    addEvent(
      "Virus spread completed",
      `11 PCs infected. ${pcName(hostPC)} remains the secure host.`
    );

    setNetworkStatus(
      `✓ VIRUS SPREAD COMPLETED · HOST ${pcName(hostPC)}`,
      "host"
    );
  }

  if (selectedThreat === "worm") {
    hostPC = null;

    setNetworkStatus("● WORM SPREAD IN PROGRESS", "running");

    addEvent(
      "Worm propagation started",
      "All 12 virtual PCs will be marked infected in sequence."
    );

    // Shuffle the order so the spread begins at a random workstation.
    const order = Array.from(
      { length: TOTAL_PCS }, (_, i) => i + 1
    );
    order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < order.length; i++) {
      const ok = await wait(300, runToken);
      if (!ok) return;

      await infectPC(order[i], runToken, i === 0);
      if (runToken !== token) return;
    }

    addEvent(
      "LAN spread completed",
      "All 12 virtual PCs are marked infected."
    );

    setNetworkStatus("✓ ALL 12 PCs INFECTED · LAN SPREAD COMPLETE", "infected");
  }

  if (selectedThreat === "trojan") {
    hostPC = null;

    const target = randomPC();

    setNetworkStatus("● TROJAN SCENARIO IN PROGRESS", "running");

    addEvent(
      "Trojan scenario started",
      "One random virtual workstation will be marked infected."
    );

    const ok = await wait(750, runToken);
    if (!ok) return;

    await infectPC(target, runToken, true);
    if (runToken !== token) return;

    addEvent(
      "Trojan simulation completed",
      `${pcName(target)} is infected. The other 11 PCs remain online.`
    );

    setNetworkStatus(`✓ ONLY ${pcName(target)} INFECTED`, "infected");
  }

  if (runToken !== token) return;

  running = false;
  completed = true;

  ui.start.disabled = false;
  ui.start.textContent = "↻  Run Again";
  ui.hint.textContent =
    "Simulation complete. Restart to clear the current states.";

  updateStats();
  updateLAN();
  toast("Simulation completed");
}

function restartSimulation() {
  resetSimulation(true);
  setNetworkStatus("● READY TO SIMULATE");
  addEvent(
    "Network reset",
    "All 12 virtual PCs have returned to their online state."
  );
  toast("Network reset successfully");
}

function changeThreat() {
  const modes = ["virus", "worm", "trojan"];
  const next = (modes.indexOf(currentThreat) + 1) % modes.length;
  selectThreat(modes[next]);
}

document.querySelectorAll(".threat").forEach(button => {
  button.addEventListener("click", () => {
    selectThreat(button.dataset.threat);
  });
});

ui.start.addEventListener("click", startSimulation);
ui.restart.addEventListener("click", restartSimulation);
ui.change.addEventListener("click", changeThreat);

ui.clearLog.addEventListener("click", () => {
  eventHistory = [];
  eventCount = 0;
  renderEvents();
  updateStats();
  toast("Event log cleared");
});

window.addEventListener("resize", () => {
  requestAnimationFrame(drawLAN);
});

if ("ResizeObserver" in window) {
  const observer = new ResizeObserver(() => drawLAN());
  observer.observe(ui.map);
}

$("year").textContent = new Date().getFullYear();

createPCs();
renderEvents();
updateStats();
updateThreatInfo("virus");
