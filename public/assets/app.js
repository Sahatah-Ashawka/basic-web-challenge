const bgMusic = document.getElementById("bgMusic");

function applyImageFallback(image) {
  const fallback = image.dataset.fallback;
  if (!fallback || image.dataset.fallbackApplied === "true") {
    return;
  }

  image.dataset.fallbackApplied = "true";
  image.src = fallback;
}

function watchImage(image) {
  image.addEventListener("error", () => applyImageFallback(image));

  if (image.complete && image.naturalWidth === 0) {
    applyImageFallback(image);
  }
}

document.querySelectorAll("img[data-fallback]").forEach(watchImage);

function removePopup() {
  document.querySelectorAll(".overlay").forEach((overlay) => overlay.remove());
}

function makeCloseButton() {
  const close = document.createElement("a");
  close.className = "close";
  close.href = "/";
  close.setAttribute("data-close-popup", "");
  close.setAttribute("aria-label", "Close");
  close.textContent = "x";
  return close;
}

function showPlayerPopup(player) {
  removePopup();

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", player.value + " ability");

  const popup = document.createElement("div");
  popup.className = "popup";

  const image = document.createElement("img");
  image.className = "popup-image";
  image.src = player.image;
  image.dataset.fallback = player.fallback;
  image.alt = player.value + " image";
  watchImage(image);

  const title = document.createElement("h2");
  title.textContent = player.value;

  const description = document.createElement("p");
  description.textContent = player.ability;

  popup.append(makeCloseButton(), image, title, description);
  overlay.append(popup);
  document.body.append(overlay);
}

function showUnknownPopup() {
  removePopup();

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Unknown name");

  const popup = document.createElement("div");
  popup.className = "popup muted-popup";

  const title = document.createElement("h2");
  title.textContent = "Unknown Name";

  const description = document.createElement("p");
  description.textContent = "This name has no visible ability.";

  popup.append(makeCloseButton(), title, description);
  overlay.append(popup);
  document.body.append(overlay);
}

async function fetchPlayer(name) {
  const response = await fetch("/api/player?name=" + encodeURIComponent(name), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function openNameWithoutReload(name) {
  history.pushState({ name }, "", "/?name=" + encodeURIComponent(name));
  const player = await fetchPlayer(name);

  if (player) {
    showPlayerPopup(player);
    return;
  }

  showUnknownPopup();
}

function closePopupWithoutReload() {
  removePopup();
  history.pushState({}, "", "/");
}

async function keepMusicPlaying() {
  try {
    bgMusic.loop = true;
    bgMusic.controls = false;
    bgMusic.volume = 1;
    await bgMusic.play();
  } catch {
    return;
  }
}

keepMusicPlaying();
window.addEventListener("load", keepMusicPlaying);
bgMusic.addEventListener("ended", () => {
  bgMusic.currentTime = 0;
  keepMusicPlaying();
});

document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close-popup]");
  if (close) {
    event.preventDefault();
    closePopupWithoutReload();
    return;
  }

  const box = event.target.closest(".box");
  if (!box) {
    return;
  }

  event.preventDefault();
  openNameWithoutReload(box.dataset.name);
});

window.addEventListener("popstate", async () => {
  const name = new URLSearchParams(window.location.search).get("name");
  if (!name) {
    removePopup();
    return;
  }

  const player = await fetchPlayer(name);
  if (player) {
    showPlayerPopup(player);
    return;
  }

  window.location.reload();
});
