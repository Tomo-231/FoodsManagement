console.log("localStorage keys:", Object.keys(localStorage));

const list = document.getElementById("itemList");
const memo = document.getElementById("memo");
const date = document.getElementById("date");
const itemName = document.getElementById("itemName");

const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");

/* =========================
   項目操作
========================= */
function addItem() {
  if (!itemName.value) return;

  const key = "item_" + Date.now();

  const data = {
    name: itemName.value,
    memo: "",
    date: ""
  };

  localStorage.setItem(key, JSON.stringify(data));

  const option = document.createElement("option");
  option.value = key;
  option.dataset.date = "";
  option.text = data.name;

  list.appendChild(option);

  list.value = key;
  load();

  itemName.value = "";
  sortByDate();
}

function editItem() {
  const option = list.selectedOptions[0];
  if (!option || !itemName.value) return;

  const data = JSON.parse(localStorage.getItem(option.value)) || {};
  data.name = itemName.value;

  localStorage.setItem(option.value, JSON.stringify(data));
  option.text = data.name;
  updateOptionText(option);
}

function deleteItem() {
  const option = list.selectedOptions[0];
  if (!option) return;

  localStorage.removeItem(option.value);
  option.remove();

  if (list.options.length > 0) {
    list.selectedIndex = 0;
    load();
  } else {
    memo.value = "";
    date.value = "";
    itemName.value = "";
  }
}

/* =========================
   保存・読み込み
========================= */
function save() {
  const option = list.selectedOptions[0];
  if (!option) return;

  const data = {
    name: option.text.split(" | ")[0],
    memo: memo.value,
    date: date.value || ""
  };

  option.dataset.date = data.date;
  localStorage.setItem(option.value, JSON.stringify(data));

  updateOptionText(option);
  sortByDate();
}

function load() {
  const option = list.selectedOptions[0];
  if (!option) return;

  const data = JSON.parse(localStorage.getItem(option.value)) || {};

  memo.value = data.memo || "";
  date.value = data.date || "";
  itemName.value = "";
}

/* =========================
   表示更新
========================= */
function updateOptionText(option) {
  const name = option.text.split(" | ")[0];
  const d = option.dataset.date;
  option.text = d ? `${name} | ${d}` : name;
}

/* =========================
   日付順ソート（空は最後）
========================= */
function sortByDate() {
  const options = Array.from(list.options);

  options.sort((a, b) => {
    if (!a.dataset.date && !b.dataset.date) return 0;
    if (!a.dataset.date) return 1;
    if (!b.dataset.date) return -1;
    return new Date(a.dataset.date) - new Date(b.dataset.date);
  });

  list.innerHTML = "";
  options.forEach(o => list.appendChild(o));

  if (list.options.length > 0) {
    list.selectedIndex = 0;
    load();
  }
}

/* =========================
   イベント
========================= */
addBtn.onclick = addItem;
editBtn.onclick = editItem;
deleteBtn.onclick = deleteItem;

memo.addEventListener("input", save);
date.addEventListener("change", save);
list.addEventListener("change", load);

/* =========================
   起動時
========================= */
window.onload = loadAllItems;

function loadAllItems() {
  list.innerHTML = "";

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith("item_")) continue;

    let data;
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch {
      continue;
    }

    const option = document.createElement("option");
    option.value = key;
    option.dataset.date = data.date || "";
    option.text = data.name || "（名称未設定）";

    updateOptionText(option);
    list.appendChild(option);
  }

  sortByDate();
}
