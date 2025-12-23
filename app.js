document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("itemList");
  const memo = document.getElementById("memo");
  const date = document.getElementById("date");
  const itemName = document.getElementById("itemName");

  const addBtn = document.getElementById("addBtn");
  const editBtn = document.getElementById("editBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  let currentKey = null;

  // =========================
  // 選択処理（WinForms風）
  // =========================
  function selectItem(li) {
    document.querySelectorAll("#itemList li").forEach(x => x.classList.remove("selected"));
    li.classList.add("selected");
    currentKey = li.dataset.key;
    load();
  }

  // =========================
  // 項目操作
  // =========================
  function addItem() {
  if (!itemName.value.trim()) return;

  const key = "item_" + Date.now();

  const data = { 
    name: itemName.value.trim(), 
    memo: "", 
    date: "" 
  };
  localStorage.setItem(key, JSON.stringify(data));

  const li = createListItem(key, data);
  list.appendChild(li);          // DOM に追加
  updateListText(key, data);     // 文字を反映

  list.appendChild(li);
  selectItem(li);
  itemName.value = "";
  sortByDate();
}

  function editItem() {
    if (!currentKey || !itemName.value.trim()) return;

    const data = JSON.parse(localStorage.getItem(currentKey)) || {};
    data.name = itemName.value.trim();
    localStorage.setItem(currentKey, JSON.stringify(data));
    updateListText(currentKey, data);
  }

  function deleteItem() {
    if (!currentKey) return;

    localStorage.removeItem(currentKey);

    const li = document.querySelector(`li[data-key="${currentKey}"]`);
    if (li) li.remove();

    currentKey = null;

    const first = list.querySelector("li");
    if (first) selectItem(first);
    else {
      memo.value = "";
      date.value = "";
      itemName.value = "";
    }
  }

  // =========================
  // 保存・読み込み
  // =========================
  function save() {
    if (!currentKey) return;

    const data = {
      name: itemName.value.trim(),
      memo: memo.value,
      date: date.value || ""
    };
    localStorage.setItem(currentKey, JSON.stringify(data));
    updateListText(currentKey, data);
    sortByDate();
  }

  function load() {
    if (!currentKey) return;

    const data = JSON.parse(localStorage.getItem(currentKey)) || {};
    itemName.value = data.name || "";
    memo.value = data.memo || "";
    date.value = data.date || "";
  }

  // =========================
  // リスト表示
  // =========================
 function createListItem(key, data) {
  const li = document.createElement("li");
  li.dataset.key = key;
  li.onclick = () => selectItem(li);
  // updateListText(key, data); ←ここでは呼ばない
  return li;
}


function updateListText(key, data) {
  const li = document.querySelector(`li[data-key="${key}"]`);
  if (!li) return;

  li.textContent = "";

  const nameSpan = document.createElement("span");
  nameSpan.className = "name";
  nameSpan.textContent = data.name?.trim() || "";  // ← デフォルト文字は削除
  li.appendChild(nameSpan);

  if (data.date?.trim()) {
    const dateSpan = document.createElement("span");
    dateSpan.className = "date";
    dateSpan.textContent = data.date;
    li.appendChild(dateSpan);
  }
}

  // =========================
  // 日付順ソート（空は最後）
  // =========================
  function sortByDate() {
    const items = Array.from(list.children);

    items.sort((a, b) => {
      const da = a.querySelector(".date")?.textContent || "";
      const db = b.querySelector(".date")?.textContent || "";

      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;

      return new Date(da) - new Date(db);
    });

    list.innerHTML = "";
    items.forEach(li => list.appendChild(li));

    if (!currentKey && list.firstChild) selectItem(list.firstChild);
  }

  // =========================
  // イベント登録
  // =========================
  addBtn.onclick = addItem;
  editBtn.onclick = editItem;
  deleteBtn.onclick = deleteItem;
  memo.addEventListener("input", save);
  date.addEventListener("change", save);

  // =========================
  // 起動時読み込み
  // =========================
function loadAllItems() {
  list.innerHTML = "";
  currentKey = null;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith("item_")) continue;

    let data;
    try { data = JSON.parse(localStorage.getItem(key)); }
    catch { continue; }

    const li = createListItem(key, data);
list.appendChild(li);          // まず DOM に追加
updateListText(key, data);     // その後で文字を反映
  }

  sortByDate();

  // ← 最初の項目を選択して右側に表示
  const first = list.querySelector("li");
  if (first) selectItem(first);
}


  loadAllItems();
});
