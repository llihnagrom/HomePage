const STORAGE_KEY = "local-homepage-links";
const SETTINGS_KEY = "local-homepage-settings";
const APP_VERSION = document.querySelector('meta[name="app-version"]')?.content || "2026-04-27";
const UPDATE_CONFIG = {
  repository: "llihnagrom/HomePage",
  branch: "main"
};

const DEFAULT_COLOR = "#4d7fff";
const FOLDER_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%23f5c451' d='M6 16a6 6 0 0 1 6-6h14l6 7h20a6 6 0 0 1 6 6v25a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z'/%3E%3Cpath fill='%23ffd978' d='M6 25h52v23a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z'/%3E%3C/svg%3E";
const APP_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='44' height='44' x='10' y='10' rx='12' fill='%2384d7ff'/%3E%3Cpath fill='%230b1020' d='M23 21h18v5H28v4h11v5H28v8h-5z'/%3E%3C/svg%3E";

const DEFAULT_LINKS = [
  { id: crypto.randomUUID(), name: "Gmail", url: "https://mail.google.com", category: "Mail", color: "#5b8cff" },
  { id: crypto.randomUUID(), name: "YouTube", url: "https://www.youtube.com", category: "Media", color: "#ff6b6b" },
  { id: crypto.randomUUID(), name: "Google Drive", url: "https://drive.google.com", category: "Work", color: "#4ec995" },
  { id: crypto.randomUUID(), name: "GitHub", url: "https://github.com", category: "Code", color: "#8e7dff" },
  { id: crypto.randomUUID(), name: "Reddit", url: "https://www.reddit.com", category: "Community", color: "#ff8b4d" },
  { id: crypto.randomUUID(), name: "Wikipedia", url: "https://www.wikipedia.org", category: "Reference", color: "#7ec8ff" }
];

const DEFAULT_SETTINGS = {
  background: "#0b1020",
  accent: "#72e2ae",
  panel: "#0f1a34",
  pageWidth: 1280,
  gapX: 18,
  gapY: 18,
  tabScale: 1,
  categories: [
    { name: "Mail", color: "#5b8cff" },
    { name: "Media", color: "#ff6b6b" },
    { name: "Work", color: "#4ec995" },
    { name: "Code", color: "#8e7dff" },
    { name: "Community", color: "#ff8b4d" },
    { name: "Reference", color: "#7ec8ff" }
  ]
};

function clampTabScale(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_SETTINGS.tabScale;
  }

  return Math.min(1, Math.max(0.5, value));
}

const linkGrid = document.querySelector("#link-grid");
const tileTemplate = document.querySelector("#tile-template");
const importItemTemplate = document.querySelector("#import-item-template");

const importButton = document.querySelector("#import-button");
const listViewButton = document.querySelector("#list-view-button");
const categoriesButton = document.querySelector("#categories-button");
const settingsButton = document.querySelector("#settings-button");
const checkUpdatesButton = document.querySelector("#check-updates-button");
const updatePanel = document.querySelector("#update-panel");
const updateTitle = document.querySelector("#update-title");
const updateMessage = document.querySelector("#update-message");
const downloadUpdateButton = document.querySelector("#download-update-button");
const bookmarkFileInput = document.querySelector("#bookmark-file");
const listCsvFileInput = document.querySelector("#list-csv-file");
const topMenu = document.querySelector(".top-menu");
const clockTime = document.querySelector("#clock-time");
const clockDate = document.querySelector("#clock-date");

const linkDialog = document.querySelector("#link-dialog");
const linkDialogTitle = document.querySelector("#link-dialog-title");
const linkForm = document.querySelector("#link-form");
const linkNameInput = document.querySelector("#link-name");
const linkUrlInput = document.querySelector("#link-url");
const linkCategoryInput = document.querySelector("#link-category");

const settingsDialog = document.querySelector("#settings-dialog");
const settingsForm = document.querySelector("#settings-form");
const resetSettingsButton = document.querySelector("#reset-settings");
const settingsReadout = document.querySelector("#settings-readout");
const settingBackground = document.querySelector("#setting-background");
const settingAccent = document.querySelector("#setting-accent");
const settingPanel = document.querySelector("#setting-panel");
const settingWidth = document.querySelector("#setting-width");
const settingGapX = document.querySelector("#setting-gap-x");
const settingGapY = document.querySelector("#setting-gap-y");
const settingTabScale = document.querySelector("#setting-tab-scale");
const categoriesDialog = document.querySelector("#categories-dialog");
const categoriesForm = document.querySelector("#categories-form");
const categoryList = document.querySelector("#category-list");
const newCategoryNameInput = document.querySelector("#new-category-name");
const newCategoryColorInput = document.querySelector("#new-category-color");
const addCategoryButton = document.querySelector("#add-category");

const importDialog = document.querySelector("#import-dialog");
const importForm = document.querySelector("#import-form");
const importList = document.querySelector("#import-list");
const selectAllImportsButton = document.querySelector("#select-all-imports");
const clearImportsButton = document.querySelector("#clear-imports");

const listViewDialog = document.querySelector("#list-view-dialog");
const listViewForm = document.querySelector("#list-view-form");
const listViewRows = document.querySelector("#list-view-rows");
const listAddRowButton = document.querySelector("#list-add-row");
const listImportCsvButton = document.querySelector("#list-import-csv");
const listExportCsvButton = document.querySelector("#list-export-csv");
const iconDialog = document.querySelector("#icon-dialog");
const iconForm = document.querySelector("#icon-form");
const iconPreview = document.querySelector("#icon-preview");
const iconUrlInput = document.querySelector("#icon-url");
const iconFileInput = document.querySelector("#icon-file");
const iconSelectFileButton = document.querySelector("#icon-select-file");
const iconResetButton = document.querySelector("#icon-reset");

let links = loadLinks();
let settings = loadSettings();
let editingId = null;
let importCandidates = [];
let draggedId = null;
let listViewDraft = [];
let editingIconId = null;
let pendingIconValue = "";

function loadLinks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LINKS));
    return [...DEFAULT_LINKS];
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      const validLinks = parsed.filter(isValidLink);
      if (validLinks.length === parsed.length) {
        return validLinks.map(normalizeLinkRecord);
      }
    }
  } catch (error) {
    console.warn("Unable to load saved links. Using defaults instead.", error);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LINKS));
  return [...DEFAULT_LINKS];
}

function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return structuredClone(DEFAULT_SETTINGS);
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      background: parsed.background || DEFAULT_SETTINGS.background,
      accent: parsed.accent || DEFAULT_SETTINGS.accent,
      panel: parsed.panel || DEFAULT_SETTINGS.panel,
      pageWidth: Number(parsed.pageWidth) || DEFAULT_SETTINGS.pageWidth,
      gapX: Number(parsed.gapX) || DEFAULT_SETTINGS.gapX,
      gapY: Number(parsed.gapY) || DEFAULT_SETTINGS.gapY,
      tabScale: clampTabScale(Number(parsed.tabScale)),
      categories: Array.isArray(parsed.categories) && parsed.categories.length
        ? parsed.categories.filter(isValidCategory).map(normalizeCategoryRecord)
        : [...DEFAULT_SETTINGS.categories]
    };
  } catch (error) {
    console.warn("Unable to load settings. Using defaults instead.", error);
    return structuredClone(DEFAULT_SETTINGS);
  }
}

function isValidLink(item) {
  return item
    && typeof item.id === "string"
    && typeof item.name === "string"
    && typeof item.url === "string";
}

function isValidCategory(item) {
  return item
    && typeof item.name === "string"
    && typeof item.color === "string";
}

function normalizeLinkRecord(item) {
  return {
    id: item.id,
    name: item.name.trim() || "Untitled",
    url: item.url,
    category: typeof item.category === "string" ? item.category.trim() : "",
    color: typeof item.color === "string" && item.color ? item.color : DEFAULT_COLOR,
    customIcon: typeof item.customIcon === "string" ? item.customIcon : ""
  };
}

function normalizeCategoryRecord(item) {
  return {
    name: item.name.trim(),
    color: item.color || DEFAULT_COLOR
  };
}

function saveLinks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function createEmptyLink() {
  return {
    id: crypto.randomUUID(),
    name: "",
    url: "",
    category: "",
    color: DEFAULT_COLOR,
    customIcon: ""
  };
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (isWindowsPath(trimmed)) {
    return windowsPathToFileUrl(trimmed);
  }

  const withProtocol = /^[a-z][a-z\d+\-.]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return new URL(withProtocol).toString();
}

function isWindowsPath(value) {
  return /^[a-z]:[\\/]/i.test(value) || /^\\\\[^\\]+\\[^\\]+/.test(value);
}

function encodeUrlPath(path) {
  return path
    .split("/")
    .map((segment, index) => (index === 0 && /^[a-z]:$/i.test(segment) ? segment : encodeURIComponent(segment)))
    .join("/");
}

function windowsPathToFileUrl(value) {
  const normalized = value.replaceAll("\\", "/");

  if (normalized.startsWith("//")) {
    const parts = normalized.slice(2).split("/");
    const host = parts.shift();
    if (!host || !parts.length) {
      throw new Error("Invalid folder path");
    }
    return new URL(`file://${host}/${encodeUrlPath(parts.join("/"))}`).toString();
  }

  return new URL(`file:///${encodeUrlPath(normalized)}`).toString();
}

function isFileLink(url) {
  return /^file:/i.test(url);
}

function isAppFileLink(url) {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    return /\.(exe|lnk|url|appref-ms)$/i.test(path);
  } catch {
    return false;
  }
}

function getTileHref(url) {
  if (isFileLink(url || "")) {
    return `homepage-launch://open?target=${encodeURIComponent(url)}`;
  }
  return url;
}

function shortHost(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "file:") {
      return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname || url);
    }
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function faviconUrl(url) {
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
}

function getLinkIconSrc(link) {
  if (!link.customIcon && isFileLink(link.url || "")) {
    return isAppFileLink(link.url) ? APP_ICON : FOLDER_ICON;
  }
  return link.customIcon || faviconUrl(link.url || "https://example.com");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((char) => char + char).join("")
    : value;

  const int = Number.parseInt(normalized, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}

function getCategoryColor(categoryName, fallbackColor = DEFAULT_COLOR) {
  const match = settings.categories.find((category) => category.name === categoryName);
  return match?.color || fallbackColor;
}

function getConfiguredUpdateSource() {
  if (UPDATE_CONFIG.repository) {
    return {
      repository: UPDATE_CONFIG.repository,
      branch: UPDATE_CONFIG.branch || "main"
    };
  }

  const githubPagesMatch = window.location.hostname.match(/^([a-z\d-]+)\.github\.io$/i);
  if (!githubPagesMatch) {
    return null;
  }

  const owner = githubPagesMatch[1];
  const repo = window.location.pathname.split("/").filter(Boolean)[0] || `${owner}.github.io`;
  return {
    repository: `${owner}/${repo}`,
    branch: UPDATE_CONFIG.branch || "main"
  };
}

function compareVersion(left, right) {
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function setUpdateState(title, message, downloadUrl = "") {
  if (!updatePanel || !updateTitle || !updateMessage || !downloadUpdateButton) {
    return;
  }

  updatePanel.hidden = false;
  updateTitle.textContent = title;
  updateMessage.textContent = message;
  downloadUpdateButton.hidden = !downloadUrl;
  downloadUpdateButton.onclick = downloadUrl
    ? () => window.open(downloadUrl, "_blank", "noopener")
    : null;
}

async function getDefaultBranch(repository, fallbackBranch) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}`, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });

    if (!response.ok) {
      return fallbackBranch;
    }

    const repo = await response.json();
    return repo.default_branch || fallbackBranch;
  } catch {
    return fallbackBranch;
  }
}

async function checkForUpdates({ silent = false } = {}) {
  const source = getConfiguredUpdateSource();
  if (!source) {
    if (silent) {
      return;
    }

    setUpdateState(
      "Update source not set",
      "Add your GitHub repository name to UPDATE_CONFIG.repository in script.js."
    );
    return;
  }

  if (!silent) {
    setUpdateState("Checking for updates", "Looking at GitHub for the newest version.");
  }

  try {
    const branch = await getDefaultBranch(source.repository, source.branch);
    const rawUrl = `https://raw.githubusercontent.com/${source.repository}/${branch}/index.html?cache=${Date.now()}`;
    const response = await fetch(rawUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const html = await response.text();
    const versionMatch = html.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i);
    const latestVersion = versionMatch?.[1];

    if (!latestVersion) {
      setUpdateState(
        "GitHub copy is not versioned yet",
        "Upload this updated local copy to GitHub once. After that, future update checks can compare versions."
      );
      return;
    }

    if (compareVersion(APP_VERSION, latestVersion) < 0) {
      const downloadUrl = `https://github.com/${source.repository}/archive/refs/heads/${branch}.zip`;
      setUpdateState(
        "Update available",
        `This copy is ${APP_VERSION}. GitHub has ${latestVersion}.`,
        downloadUrl
      );
      return;
    }

    if (!silent) {
      setUpdateState("Up to date", `This copy is ${APP_VERSION}.`);
    }
  } catch (error) {
    console.warn("Unable to check for updates.", error);
    if (silent) {
      return;
    }

    setUpdateState(
      "Could not check for updates",
      "GitHub may be unavailable, the repository may be private, or the repository setting may need updating."
    );
  }
}

function renderCategoryOptions() {
  const currentValue = linkCategoryInput.value;
  linkCategoryInput.textContent = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "None";
  linkCategoryInput.append(emptyOption);

  settings.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    linkCategoryInput.append(option);
  });

  linkCategoryInput.value = settings.categories.some((category) => category.name === currentValue) ? currentValue : "";
}

function renderCategorySettings() {
  categoryList.textContent = "";

  if (!settings.categories.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No categories yet. Add one below.";
    categoryList.append(emptyState);
    return;
  }

  settings.categories.forEach((category) => {
    const row = document.createElement("div");
    row.className = "category-row";

    const label = document.createElement("div");
    label.innerHTML = `<span class="category-swatch" style="background:${escapeHtml(category.color)}"></span>${escapeHtml(category.name)}`;

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = category.color;
    colorInput.addEventListener("input", () => {
      settings.categories = settings.categories.map((item) => (
        item.name === category.name ? { ...item, color: colorInput.value } : item
      ));
      saveSettings();
      applySettings();
      renderLinks();
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "toolbar-button subtle";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      settings.categories = settings.categories.filter((item) => item.name !== category.name);
      links = links.map((link) => (
        link.category === category.name ? { ...link, category: "" } : link
      ));
      saveSettings();
      saveLinks();
      applySettings();
      renderLinks();
    });

    row.append(label, colorInput, removeButton);
    categoryList.append(row);
  });
}

function categorySelectMarkup(selectedValue = "") {
  const options = [
    '<option value="">None</option>',
    ...settings.categories.map((category) => (
      `<option value="${escapeHtml(category.name)}"${category.name === selectedValue ? " selected" : ""}>${escapeHtml(category.name)}</option>`
    ))
  ];

  return options.join("");
}

function applySettings() {
  document.documentElement.style.setProperty("--bg", settings.background);
  document.documentElement.style.setProperty("--accent", settings.accent);
  document.documentElement.style.setProperty("--panel", settings.panel);
  document.documentElement.style.setProperty("--panel-rgb", hexToRgb(settings.panel));
  document.documentElement.style.setProperty("--page-width", `${settings.pageWidth}px`);
  document.documentElement.style.setProperty("--gap-x", `${settings.gapX}px`);
  document.documentElement.style.setProperty("--gap-y", `${settings.gapY}px`);
  document.documentElement.style.setProperty("--tile-scale", settings.tabScale);

  settingBackground.value = settings.background;
  settingAccent.value = settings.accent;
  settingPanel.value = settings.panel;
  settingWidth.value = String(settings.pageWidth);
  settingGapX.value = String(settings.gapX);
  settingGapY.value = String(settings.gapY);
  settingTabScale.value = String(settings.tabScale);
  settingsReadout.textContent = `Width ${settings.pageWidth}px, horizontal gap ${settings.gapX}px, vertical gap ${settings.gapY}px, tab scale ${settings.tabScale.toFixed(2)}x`;

  renderCategoryOptions();
  renderCategorySettings();
}

function closeAllMenus() {
  document.querySelectorAll(".tile-menu[open]").forEach((menu) => {
    menu.removeAttribute("open");
  });

  if (topMenu?.open) {
    topMenu.removeAttribute("open");
  }
}

function updateClock() {
  const now = new Date();
  const timeParts = now
    .toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
    .replace(/\s?[AP]M$/i, "");

  clockTime.textContent = timeParts;
  clockDate.textContent = now.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function renderLinks() {
  linkGrid.textContent = "";

  if (!links.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No links yet. Use the plus tile or import bookmarks to get started.";
    linkGrid.append(emptyState);
  }

  links.forEach((link) => {
    const fragment = tileTemplate.content.cloneNode(true);
    const tile = fragment.querySelector(".tile");
    const tileLink = fragment.querySelector(".tile-link");
    const editButton = fragment.querySelector(".edit");
    const deleteButton = fragment.querySelector(".delete");
    const menu = fragment.querySelector(".tile-menu");

    tile.dataset.id = link.id;
    tile.style.setProperty("--tile-color", getCategoryColor(link.category, link.color || DEFAULT_COLOR));
    tile.draggable = true;

    tileLink.href = getTileHref(link.url);
    tileLink.innerHTML = [
      '<div class="tile-top">',
      `<img class="favicon" src="${escapeHtml(getLinkIconSrc(link))}" alt="">`,
      '<div class="tile-copy">',
      `<strong>${escapeHtml(link.name)}</strong>`,
      "</div>",
      "</div>"
    ].join("");

    tile.addEventListener("dragstart", handleDragStart);
    tile.addEventListener("dragover", handleDragOver);
    tile.addEventListener("drop", handleDrop);
    tile.addEventListener("dragend", handleDragEnd);
    tile.addEventListener("dragleave", () => tile.classList.remove("drag-over"));

    editButton.addEventListener("click", () => {
      closeAllMenus();
      openLinkDialog("edit", link.id);
    });

    deleteButton.addEventListener("click", () => {
      closeAllMenus();
      deleteLink(link.id);
    });

    menu.addEventListener("toggle", () => {
      if (menu.open) {
        document.querySelectorAll(".tile-menu").forEach((otherMenu) => {
          if (otherMenu !== menu) {
            otherMenu.removeAttribute("open");
          }
        });
      }
    });

    linkGrid.append(fragment);
  });

  linkGrid.append(createAddTile());
}

function renderListViewRows() {
  listViewRows.textContent = "";

  if (!listViewDraft.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No links yet. Add one from here or from the tile view.";
    listViewRows.append(emptyState);
    return;
  }

  listViewDraft.forEach((link) => {
    const row = document.createElement("div");
    row.className = "list-view-row";
    row.dataset.id = link.id;
    row.innerHTML = [
      `<div class="list-icon-cell" title="Double-click to edit icon"><img class="list-favicon" src="${escapeHtml(getLinkIconSrc(link))}" alt=""></div>`,
      `<input type="text" class="list-input" data-field="name" placeholder="Title" value="${escapeHtml(link.name)}">`,
      `<input type="text" class="list-input" data-field="url" placeholder="https://example.com, I:\\Folder, or C:\\App\\app.exe" value="${escapeHtml(link.url)}">`,
      `<select class="list-input" data-field="category">${categorySelectMarkup(link.category)}</select>`,
      '<button type="button" class="toolbar-button subtle list-delete">Delete</button>'
    ].join("");

    const nameInput = row.querySelector('[data-field="name"]');
    const urlInput = row.querySelector('[data-field="url"]');
    const categoryInput = row.querySelector('[data-field="category"]');
    const iconCell = row.querySelector(".list-icon-cell");
    const icon = row.querySelector(".list-favicon");
    const deleteButton = row.querySelector(".list-delete");

    nameInput.addEventListener("input", () => {
      updateListDraftRow(link.id, { name: nameInput.value });
    });

    urlInput.addEventListener("input", () => {
      updateListDraftRow(link.id, { url: urlInput.value });
      const currentLink = listViewDraft.find((item) => item.id === link.id) || link;
      icon.src = getLinkIconSrc({ ...currentLink, url: urlInput.value });
      urlInput.setCustomValidity("");
    });

    categoryInput.addEventListener("input", () => {
      updateListDraftRow(link.id, { category: categoryInput.value });
    });

    deleteButton.addEventListener("click", () => {
      listViewDraft = listViewDraft.filter((item) => item.id !== link.id);
      renderListViewRows();
    });

    iconCell.addEventListener("dblclick", () => {
      openIconDialog(link.id);
    });

    listViewRows.append(row);
  });
}

function updateListDraftRow(id, changes) {
  listViewDraft = listViewDraft.map((item) => (
    item.id === id ? { ...item, ...changes } : item
  ));
}

function syncListRowIcon(id) {
  const record = listViewDraft.find((item) => item.id === id);
  const icon = listViewRows.querySelector(`[data-id="${id}"] .list-favicon`);

  if (record && icon) {
    icon.src = getLinkIconSrc(record);
  }
}

function openIconDialog(id) {
  const record = listViewDraft.find((item) => item.id === id);
  if (!record) {
    return;
  }

  editingIconId = id;
  pendingIconValue = record.customIcon || "";
  iconUrlInput.value = record.customIcon || "";
  iconUrlInput.setCustomValidity("");
  iconPreview.src = getLinkIconSrc(record);
  iconDialog.showModal();
}

function openListViewDialog() {
  listViewDraft = links.map((link) => ({ ...link }));
  renderListViewRows();
  listViewDialog.showModal();
}

function collectListViewRows() {
  const rows = [...listViewRows.querySelectorAll(".list-view-row")];
  const collected = [];

  for (const row of rows) {
    const id = row.dataset.id || crypto.randomUUID();
    const nameInput = row.querySelector('[data-field="name"]');
    const urlInput = row.querySelector('[data-field="url"]');
    const categoryInput = row.querySelector('[data-field="category"]');
    const name = nameInput.value.trim();
    const urlValue = urlInput.value.trim();
    const category = categoryInput.value.trim();

    if (!name && !urlValue && !category) {
      continue;
    }

    if (!name) {
      nameInput.setCustomValidity("Please add a title.");
      nameInput.reportValidity();
      return null;
    }

    let normalizedUrl = "";
    try {
      normalizedUrl = normalizeUrl(urlValue);
      urlInput.setCustomValidity("");
    } catch {
      urlInput.setCustomValidity("Please enter a valid URL, folder path, or app path.");
      urlInput.reportValidity();
      return null;
    }

    collected.push(normalizeLinkRecord({
      id,
      name,
      url: normalizedUrl,
      category,
      color: getCategoryColor(category, DEFAULT_COLOR),
      customIcon: listViewDraft.find((item) => item.id === id)?.customIcon || ""
    }));
  }

  return collected;
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function exportLinksCsv(records) {
  const lines = [
    ["Icon", "Title", "URL", "Category"],
    ...records.map((record) => [
      getLinkIconSrc(record),
      record.name,
      record.url,
      record.category || ""
    ])
  ];

  const csv = lines.map((line) => line.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "homepage-links.csv";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function parseCsvRows(content) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) {
    rows.push(row);
  }

  return rows;
}

function csvHeaderKey(value) {
  return String(value ?? "").trim().toLowerCase().replace(/^\ufeff/, "");
}

function parseLinksCsv(content) {
  const rows = parseCsvRows(content);
  if (!rows.length) {
    return [];
  }

  const firstRow = rows[0].map(csvHeaderKey);
  const headerIndex = {
    icon: firstRow.findIndex((header) => ["icon", "icon url", "custom icon"].includes(header)),
    name: firstRow.findIndex((header) => ["title", "name"].includes(header)),
    url: firstRow.findIndex((header) => ["url", "link"].includes(header)),
    category: firstRow.findIndex((header) => header === "category")
  };
  const hasHeader = headerIndex.name >= 0 || headerIndex.url >= 0 || headerIndex.icon >= 0 || headerIndex.category >= 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const getCell = (row, field, fallbackIndex) => row[headerIndex[field] >= 0 ? headerIndex[field] : fallbackIndex] || "";

  return dataRows.reduce((records, row) => {
    const icon = getCell(row, "icon", 0).trim();
    const name = getCell(row, "name", 1).trim();
    const urlValue = getCell(row, "url", 2).trim();
    const category = getCell(row, "category", 3).trim();

    if (!name && !urlValue && !category && !icon) {
      return records;
    }

    try {
      const normalizedUrl = normalizeUrl(urlValue);
      records.push(normalizeLinkRecord({
        id: crypto.randomUUID(),
        name: name || shortHost(normalizedUrl),
        url: normalizedUrl,
        category,
        color: getCategoryColor(category, DEFAULT_COLOR),
        customIcon: icon
      }));
    } catch {
      console.warn("Skipped CSV row with an invalid URL.", row);
    }

    return records;
  }, []);
}

function addMissingCategoriesFromLinks(records) {
  const existingNames = new Set(settings.categories.map((category) => category.name.toLowerCase()));
  const additions = [];

  records.forEach((record) => {
    const categoryName = record.category.trim();
    if (!categoryName || existingNames.has(categoryName.toLowerCase())) {
      return;
    }

    existingNames.add(categoryName.toLowerCase());
    additions.push({ name: categoryName, color: DEFAULT_COLOR });
  });

  if (!additions.length) {
    return;
  }

  settings.categories = [...settings.categories, ...additions];
  saveSettings();
  renderCategoryOptions();
  renderCategorySettings();
}

function createAddTile() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "add-tile";
  button.innerHTML = '<span class="plus-mark">+</span><strong>Add link</strong>';
  button.addEventListener("click", () => openLinkDialog("add"));
  return button;
}

function addLink(link) {
  links = [...links, normalizeLinkRecord(link)];
  saveLinks();
  renderLinks();
}

function updateLink(id, changes) {
  links = links.map((link) => (
    link.id === id
      ? normalizeLinkRecord({ ...link, ...changes })
      : link
  ));
  saveLinks();
  renderLinks();
}

function deleteLink(id) {
  links = links.filter((link) => link.id !== id);
  saveLinks();
  renderLinks();
}

function openLinkDialog(mode, id = null) {
  editingId = mode === "edit" ? id : null;
  const current = links.find((link) => link.id === id);

  renderCategoryOptions();
  linkDialogTitle.textContent = mode === "edit" ? "Edit link" : "Add link";
  linkNameInput.value = current?.name || "";
  linkUrlInput.value = current?.url || "";
  linkCategoryInput.value = current?.category || "";
  linkDialog.showModal();
}

function handleDragStart(event) {
  draggedId = event.currentTarget.dataset.id;
  event.currentTarget.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedId);
}

function handleDragOver(event) {
  event.preventDefault();
  if (!draggedId || draggedId === event.currentTarget.dataset.id) {
    return;
  }
  event.currentTarget.classList.add("drag-over");
}

function handleDrop(event) {
  event.preventDefault();
  const targetId = event.currentTarget.dataset.id;
  event.currentTarget.classList.remove("drag-over");

  if (!draggedId || draggedId === targetId) {
    return;
  }

  const fromIndex = links.findIndex((link) => link.id === draggedId);
  const toIndex = links.findIndex((link) => link.id === targetId);

  if (fromIndex < 0 || toIndex < 0) {
    return;
  }

  const reordered = [...links];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  links = reordered;
  saveLinks();
  renderLinks();
}

function handleDragEnd(event) {
  draggedId = null;
  event.currentTarget.classList.remove("dragging");
  document.querySelectorAll(".tile.drag-over").forEach((tile) => tile.classList.remove("drag-over"));
}

function parseBookmarksFile(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const anchors = [...doc.querySelectorAll("a[href]")];

  return anchors
    .map((anchor) => {
      const href = anchor.getAttribute("href") || "";
      const name = anchor.textContent?.trim() || shortHost(href) || "Untitled";
      return {
        id: crypto.randomUUID(),
        name,
        url: href,
        category: "",
        color: DEFAULT_COLOR
      };
    })
    .filter((item) => {
      try {
        item.url = normalizeUrl(item.url);
        return true;
      } catch {
        return false;
      }
    });
}

function renderImportCandidates() {
  importList.textContent = "";

  if (!importCandidates.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No valid bookmarks were found in that file.";
    importList.append(emptyState);
    return;
  }

  importCandidates.forEach((item) => {
    const fragment = importItemTemplate.content.cloneNode(true);
    const checkbox = fragment.querySelector(".import-check");
    const name = fragment.querySelector(".import-name");
    const url = fragment.querySelector(".import-url");

    checkbox.dataset.id = item.id;
    checkbox.checked = item.selected;
    name.textContent = item.name;
    url.textContent = shortHost(item.url);

    checkbox.addEventListener("change", () => {
      const match = importCandidates.find((candidate) => candidate.id === item.id);
      if (match) {
        match.selected = checkbox.checked;
      }
    });

    importList.append(fragment);
  });
}

function importSelectedLinks() {
  const seenUrls = new Set(links.map((link) => link.url));
  const selected = importCandidates
    .filter((candidate) => candidate.selected)
    .filter((candidate) => {
      if (seenUrls.has(candidate.url)) {
        return false;
      }
      seenUrls.add(candidate.url);
      return true;
    });

  if (!selected.length) {
    return;
  }

  links = [
    ...links,
    ...selected.map((item) => normalizeLinkRecord(item))
  ];
  saveLinks();
  renderLinks();
}

linkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const action = event.submitter?.value;

  if (action !== "save") {
    linkDialog.close();
    return;
  }

  try {
    const record = {
      id: editingId || crypto.randomUUID(),
      name: linkNameInput.value.trim(),
      url: normalizeUrl(linkUrlInput.value),
      category: linkCategoryInput.value.trim()
    };

    if (!record.name) {
      linkNameInput.setCustomValidity("Please add a name.");
      linkNameInput.reportValidity();
      return;
    }

    linkNameInput.setCustomValidity("");

    if (editingId) {
      updateLink(editingId, record);
    } else {
      addLink(record);
    }
    linkDialog.close();
  } catch {
    linkUrlInput.setCustomValidity("Please enter a valid URL, folder path, or app path.");
    linkUrlInput.reportValidity();
  }
});

linkNameInput.addEventListener("input", () => {
  linkNameInput.setCustomValidity("");
});

linkUrlInput.addEventListener("input", () => {
  linkUrlInput.setCustomValidity("");
});

newCategoryNameInput.addEventListener("input", () => {
  newCategoryNameInput.setCustomValidity("");
});

function updateLiveSettings() {
  settings = {
    ...settings,
    background: settingBackground.value,
    accent: settingAccent.value,
    panel: settingPanel.value,
    pageWidth: Number(settingWidth.value),
    gapX: Number(settingGapX.value),
    gapY: Number(settingGapY.value),
    tabScale: clampTabScale(Number(settingTabScale.value))
  };
  applySettings();
  saveSettings();
}

[settingBackground, settingAccent, settingPanel, settingWidth, settingGapX, settingGapY, settingTabScale].forEach((input) => {
  input.addEventListener("input", updateLiveSettings);
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  settingsDialog.close();
});

categoriesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  categoriesDialog.close();
});

resetSettingsButton.addEventListener("click", () => {
  settings = structuredClone(DEFAULT_SETTINGS);
  applySettings();
  saveSettings();
  renderLinks();
});

addCategoryButton.addEventListener("click", () => {
  const name = newCategoryNameInput.value.trim();
  const color = newCategoryColorInput.value || DEFAULT_COLOR;

  if (!name) {
    newCategoryNameInput.setCustomValidity("Please add a category name.");
    newCategoryNameInput.reportValidity();
    return;
  }

  if (settings.categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
    newCategoryNameInput.setCustomValidity("That category already exists.");
    newCategoryNameInput.reportValidity();
    return;
  }

  settings.categories = [...settings.categories, { name, color }];
  newCategoryNameInput.value = "";
  newCategoryColorInput.value = DEFAULT_COLOR;
  saveSettings();
  applySettings();
  renderLinks();
});

bookmarkFileInput.addEventListener("change", async () => {
  const file = bookmarkFileInput.files?.[0];
  if (!file) {
    return;
  }

  const content = await file.text();
  importCandidates = parseBookmarksFile(content).map((item) => ({ ...item, selected: true }));
  renderImportCandidates();
  importDialog.showModal();
  bookmarkFileInput.value = "";
});

selectAllImportsButton.addEventListener("click", () => {
  importCandidates = importCandidates.map((item) => ({ ...item, selected: true }));
  renderImportCandidates();
});

clearImportsButton.addEventListener("click", () => {
  importCandidates = importCandidates.map((item) => ({ ...item, selected: false }));
  renderImportCandidates();
});

importForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const action = event.submitter?.value;

  if (action === "import") {
    importSelectedLinks();
  }

  importDialog.close();
});

settingsButton.addEventListener("click", () => {
  if (topMenu?.open) {
    topMenu.removeAttribute("open");
  }
  applySettings();
  settingsDialog.showModal();
});

categoriesButton.addEventListener("click", () => {
  if (topMenu?.open) {
    topMenu.removeAttribute("open");
  }
  renderCategorySettings();
  categoriesDialog.showModal();
});

listViewButton.addEventListener("click", () => {
  if (topMenu?.open) {
    topMenu.removeAttribute("open");
  }
  openListViewDialog();
});

importButton.addEventListener("click", () => {
  if (topMenu?.open) {
    topMenu.removeAttribute("open");
  }
  bookmarkFileInput.click();
});

checkUpdatesButton?.addEventListener("click", () => {
  if (topMenu?.open) {
    topMenu.removeAttribute("open");
  }
  checkForUpdates();
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialogId = button.getAttribute("data-close-dialog");
    const dialog = dialogId ? document.getElementById(dialogId) : null;
    dialog?.close();
  });
});

listAddRowButton.addEventListener("click", () => {
  listViewDraft = [...listViewDraft, createEmptyLink()];
  renderListViewRows();
});

listImportCsvButton.addEventListener("click", () => {
  listCsvFileInput.click();
});

listCsvFileInput.addEventListener("change", async () => {
  const file = listCsvFileInput.files?.[0];
  if (!file) {
    return;
  }

  const importedRows = parseLinksCsv(await file.text());
  listCsvFileInput.value = "";

  if (!importedRows.length) {
    return;
  }

  addMissingCategoriesFromLinks(importedRows);
  listViewDraft = [...listViewDraft, ...importedRows];
  renderListViewRows();
});

listExportCsvButton.addEventListener("click", () => {
  const rows = collectListViewRows();
  if (rows) {
    exportLinksCsv(rows);
  }
});

listViewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const action = event.submitter?.value;

  if (action !== "save") {
    listViewDialog.close();
    return;
  }

  const rows = collectListViewRows();
  if (!rows) {
    return;
  }

  links = rows;
  saveLinks();
  renderLinks();
  listViewDialog.close();
});

iconSelectFileButton.addEventListener("click", () => {
  iconFileInput.click();
});

iconFileInput.addEventListener("change", async () => {
  const file = iconFileInput.files?.[0];
  if (!file) {
    return;
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  pendingIconValue = String(dataUrl);
  iconUrlInput.value = "";
  iconPreview.src = pendingIconValue;
  iconFileInput.value = "";
});

iconResetButton.addEventListener("click", () => {
  pendingIconValue = "";
  iconUrlInput.value = "";
  iconUrlInput.setCustomValidity("");
  const record = listViewDraft.find((item) => item.id === editingIconId);
  if (record) {
    iconPreview.src = getLinkIconSrc({ ...record, customIcon: "" });
  }
});

iconUrlInput.addEventListener("input", () => {
  pendingIconValue = iconUrlInput.value.trim();
  iconUrlInput.setCustomValidity("");
  const record = listViewDraft.find((item) => item.id === editingIconId);
  if (record) {
    iconPreview.src = pendingIconValue || getLinkIconSrc({ ...record, customIcon: "" });
  }
});

iconForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!editingIconId) {
    iconDialog.close();
    return;
  }

  const iconValue = pendingIconValue.trim();
  if (iconValue && !iconValue.startsWith("data:")) {
    try {
      new URL(iconValue);
      iconUrlInput.setCustomValidity("");
    } catch {
      iconUrlInput.setCustomValidity("Please enter a valid image URL.");
      iconUrlInput.reportValidity();
      return;
    }
  }

  updateListDraftRow(editingIconId, { customIcon: iconValue });
  syncListRowIcon(editingIconId);
  iconDialog.close();
});

iconDialog.addEventListener("close", () => {
  editingIconId = null;
  pendingIconValue = "";
  iconUrlInput.setCustomValidity("");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".tile-menu") && !event.target.closest(".top-menu")) {
    closeAllMenus();
  }
});

linkDialog.addEventListener("close", () => {
  editingId = null;
  linkUrlInput.setCustomValidity("");
  linkNameInput.setCustomValidity("");
});

applySettings();
updateClock();
setInterval(updateClock, 1000);
renderLinks();
checkForUpdates({ silent: true });
