const STORAGE_GOAL = "calorieTracker_goal";
const STORAGE_ENTRIES = "calorieTracker_entries";
const STORAGE_LAST_ENTRY = "calorieTracker_lastEntry";

const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snacks"];

// Load from external food-database.js (window.FOOD_DATABASE); fallback to empty array
const FOOD_DATABASE = Array.isArray(window.FOOD_DATABASE) ? window.FOOD_DATABASE : [];

function dateToKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

function getSelectedDate() {
  const input = document.getElementById("log-date");
  const val = input?.value;
  if (val) return val;
  const today = new Date();
  return dateToKey(today);
}

function loadGoal() {
  const saved = localStorage.getItem(STORAGE_GOAL);
  const input = document.getElementById("daily-goal");
  if (saved) input.value = saved;
  input.addEventListener("change", () => {
    const v = input.value.trim();
    if (v) localStorage.setItem(STORAGE_GOAL, v);
    updateSummary();
  });
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_ENTRIES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries));
}

function getEntriesForDate(dateKey) {
  const all = loadEntries();
  return Array.isArray(all[dateKey]) ? all[dateKey] : [];
}

function setEntriesForDate(dateKey, entries) {
  const all = loadEntries();
  all[dateKey] = entries;
  saveEntries(all);
}

function getGoal() {
  const v = document.getElementById("daily-goal").value.trim();
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function loadLastEntry() {
  try {
    const raw = localStorage.getItem(STORAGE_LAST_ENTRY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLastEntry(entry) {
  localStorage.setItem(STORAGE_LAST_ENTRY, JSON.stringify(entry));
}

function updateSummary() {
  const dateKey = getSelectedDate();
  const entries = getEntriesForDate(dateKey);
  const totalCal = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const totalProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
  const goal = getGoal();

  document.getElementById("consumed").textContent = totalCal;
  document.getElementById("remaining").textContent =
    goal != null ? Math.max(0, goal - totalCal) : "—";
  document.getElementById("protein-total").textContent = totalProtein + " g";

  const fill = document.getElementById("progress-fill");
  if (goal != null && goal > 0) {
    const pct = Math.min(100, (totalCal / goal) * 100);
    fill.style.width = pct + "%";
  } else {
    fill.style.width = "0%";
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderEntries() {
  const dateKey = getSelectedDate();
  const entries = getEntriesForDate(dateKey);
  const container = document.getElementById("entries-by-meal");
  const section = document.querySelector(".entries-section");
  const heading = document.getElementById("entries-heading");

  heading.textContent = formatDayOfWeek(dateKey) + " — Entries";

  container.innerHTML = "";
  if (entries.length === 0) {
    section.classList.remove("has-entries");
    updateSummary();
    return;
  }
  section.classList.add("has-entries");

  const byMeal = {};
  MEAL_ORDER.forEach((m) => (byMeal[m] = []));
  entries.forEach((e) => {
    const meal = e.mealType && MEAL_ORDER.includes(e.mealType) ? e.mealType : "snacks";
    byMeal[meal].push(e);
  });

  MEAL_ORDER.forEach((mealType) => {
    const list = byMeal[mealType];
    if (list.length === 0) return;

    const group = document.createElement("div");
    group.className = "meal-group";
    group.innerHTML = `<h3 class="meal-group-title">${MEAL_LABELS[mealType]}</h3><ul></ul>`;
    const ul = group.querySelector("ul");

    list.forEach((entry, index) => {
      const globalIndex = entries.indexOf(entry);
      const li = document.createElement("li");
      const proteinText = entry.protein != null && entry.protein > 0 ? `${entry.protein} g protein · ` : "";
      li.innerHTML = `
        <div class="entry-info">
          <span class="entry-name">${escapeHtml(entry.name || "Unknown")}</span>
          <span class="entry-meta">${proteinText}${entry.calories || 0} cal</span>
        </div>
        <span class="entry-calories">${entry.calories || 0} cal</span>
        <button type="button" class="delete-btn" data-index="${globalIndex}" aria-label="Remove entry">×</button>
      `;
      li.querySelector(".delete-btn").addEventListener("click", () => {
        const arr = getEntriesForDate(dateKey);
        arr.splice(globalIndex, 1);
        setEntriesForDate(dateKey, arr);
        renderEntries();
      });
      ul.appendChild(li);
    });

    container.appendChild(group);
  });

  updateSummary();
}

function initDatePicker() {
  const input = document.getElementById("log-date");
  const dayEl = document.getElementById("day-of-week");

  const today = new Date();
  const todayStr = dateToKey(today);
  if (!input.value) input.value = todayStr;
  dayEl.textContent = formatDayOfWeek(getSelectedDate());

  input.addEventListener("change", () => {
    dayEl.textContent = formatDayOfWeek(getSelectedDate());
    renderEntries();
  });
}

function applyLastEntry() {
  const last = loadLastEntry();
  if (!last) return;
  const nameInput = document.getElementById("food-name");
  const calInput = document.getElementById("food-calories");
  const proteinInput = document.getElementById("food-protein");
  if (last.name) nameInput.value = last.name;
  if (last.calories != null) calInput.value = String(last.calories);
  if (last.protein != null) proteinInput.value = String(last.protein);
  if (last.mealType) {
    const radio = document.querySelector(`input[name="meal-type"][value="${last.mealType}"]`);
    if (radio) radio.checked = true;
  }
}

let selectedFoodFromSearch = null;

function filterFoods(query) {
  const q = (query || "").trim().toLowerCase();
  const maxResults = 25;
  if (!q) return FOOD_DATABASE.slice(0, maxResults);
  return FOOD_DATABASE.filter((f) => f.name.toLowerCase().includes(q)).slice(0, maxResults);
}

function renderFoodResults(foods) {
  const list = document.getElementById("food-search-results");
  list.innerHTML = "";
  if (foods.length === 0) {
    list.hidden = true;
    return;
  }
  list.hidden = false;
  foods.forEach((food, index) => {
    const opt = document.createElement("div");
    opt.className = "food-search-item";
    opt.role = "option";
    opt.id = `food-opt-${index}`;
    opt.textContent = food.name;
    opt.dataset.index = String(FOOD_DATABASE.indexOf(food));
    opt.addEventListener("click", () => selectFoodFromSearch(food));
    list.appendChild(opt);
  });
}

function selectFoodFromSearch(food) {
  selectedFoodFromSearch = food;
  const nameInput = document.getElementById("food-name");
  const searchInput = document.getElementById("food-search");
  const amountRow = document.getElementById("food-amount-row");
  const amountInput = document.getElementById("food-amount");
  const unitSelect = document.getElementById("food-unit");

  nameInput.value = food.name;
  searchInput.value = "";
  document.getElementById("food-search-results").hidden = true;
  amountRow.hidden = false;
  amountInput.value = "";
  unitSelect.value = food.unit;
  amountInput.focus();
  updateCaloriesAndProteinFromAmount();
}

function updateCaloriesAndProteinFromAmount() {
  if (!selectedFoodFromSearch) return;
  const amountInput = document.getElementById("food-amount");
  const unitSelect = document.getElementById("food-unit");
  const calInput = document.getElementById("food-calories");
  const proteinInput = document.getElementById("food-protein");

  const amount = parseFloat(amountInput.value, 10);
  const unit = unitSelect.value;
  const food = selectedFoodFromSearch;
  if (!Number.isFinite(amount) || amount <= 0) {
    calInput.value = "";
    proteinInput.value = "";
    return;
  }
  const factor = amount / 100;
  const calories = Math.round(food.caloriesPer100 * factor);
  const protein = Math.round(food.proteinPer100 * factor * 10) / 10;
  calInput.value = String(calories);
  proteinInput.value = String(protein);
}

function clearSelectedFood() {
  selectedFoodFromSearch = null;
  document.getElementById("food-amount-row").hidden = true;
  document.getElementById("food-amount").value = "";
}

function initFoodSearch() {
  const searchInput = document.getElementById("food-search");
  const resultsEl = document.getElementById("food-search-results");
  const amountInput = document.getElementById("food-amount");
  const unitSelect = document.getElementById("food-unit");

  searchInput.addEventListener("input", () => {
    const foods = filterFoods(searchInput.value);
    renderFoodResults(foods);
  });
  searchInput.addEventListener("focus", () => {
    const foods = filterFoods(searchInput.value);
    renderFoodResults(foods);
  });
  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      resultsEl.hidden = true;
    }, 200);
  });

  amountInput.addEventListener("input", updateCaloriesAndProteinFromAmount);
  unitSelect.addEventListener("change", updateCaloriesAndProteinFromAmount);

  document.getElementById("food-name").addEventListener("input", () => {
    if (selectedFoodFromSearch && document.getElementById("food-name").value !== selectedFoodFromSearch.name) {
      clearSelectedFood();
    }
  });
}

document.getElementById("add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("food-name");
  const calInput = document.getElementById("food-calories");
  const proteinInput = document.getElementById("food-protein");
  const name = nameInput.value.trim();
  const calories = parseInt(calInput.value, 10);
  const protein = parseInt(proteinInput.value, 10) || 0;
  const mealType = document.querySelector('input[name="meal-type"]:checked')?.value || "snacks";

  if (!name || !Number.isFinite(calories) || calories < 0) return;

  const dateKey = getSelectedDate();
  const entries = getEntriesForDate(dateKey);
  entries.push({ name, calories, protein, mealType });
  setEntriesForDate(dateKey, entries);

  saveLastEntry({ name, calories, protein, mealType });

  nameInput.value = "";
  calInput.value = "";
  proteinInput.value = "";
  clearSelectedFood();
  applyLastEntry();
  renderEntries();
});

loadGoal();
initDatePicker();
initFoodSearch();
applyLastEntry();
renderEntries();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
