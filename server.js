const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 1233);
const FLAG = process.env.FLAG || "flag{plain_item_found}";
const PUBLIC_DIR = path.join(__dirname, "public");
const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");

const items = [
  {
    value: "Neymar",
    ability: "Elite dribbling, flair, playmaking, and creative finishing.",
    image: "/assets/players/neymar.jpg",
  },
  {
    value: "Kylian Mbappe",
    ability: "Explosive pace, sharp dribbling, and clinical finishing.",
    image: "/assets/players/kylian-mbappe.jpg",
  },
  {
    value: "Cristiano Ronaldo",
    ability: "Powerful goalscoring, aerial threat, speed, and two-footed attack.",
    image: "/assets/players/cristiano-ronaldo.jpg",
  },
  {
    value: "Lionel Messi",
    ability: "Close-control dribbling, vision, passing, and precise finishing.",
    image: "/assets/players/lionel-messi.jpg",
  },
  {
    value: "Erling Haaland",
    ability: "Speed, strength, positioning, and ruthless box finishing.",
    image: "/assets/players/erling-haaland.jpg",
  },
  {
    value: "Lamine Yamal",
    ability: "Flair, chance creation, elite dribbling, and curling shots.",
    image: "/assets/players/lamine-yamal.jpg",
  },
];

const contentTypes = {
  ".svg": "image/svg+xml; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".wav": "audio/wav",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSelectedItem(itemQuery) {
  return items.find((entry) => entry.value.toLowerCase() === itemQuery.toLowerCase());
}

function renderPopup(itemQuery = "") {
  if (!itemQuery) {
    return "";
  }

  if (itemQuery === "flag") {
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Flag">
      <div class="popup success">
        <a class="close" href="/" data-close-popup aria-label="Close">x</a>
        <h2>Flag Item</h2>
        <p>Flag: <strong>${escapeHtml(FLAG)}</strong></p>
      </div>
    </div>`;
  }

  const item = getSelectedItem(itemQuery);
  if (item) {
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(item.value)} ability">
      <div class="popup">
        <a class="close" href="/" data-close-popup aria-label="Close">x</a>
        <img class="popup-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.value)} image">
        <h2>${escapeHtml(item.value)}</h2>
        <p>${escapeHtml(item.ability)}</p>
      </div>
    </div>`;
  }

  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Unknown item">
    <div class="popup muted-popup">
      <a class="close" href="/" data-close-popup aria-label="Close">x</a>
      <h2>Unknown Item</h2>
      <p>This name has no visible ability.</p>
    </div>
  </div>`;
}

function renderPage(itemQuery = "") {
  const popup = renderPopup(itemQuery.trim());

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>World Cup Player Challenge</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #111315;
      --panel: #181c20;
      --panel-2: #20262b;
      --line: #343d45;
      --text: #eef2f3;
      --muted: #9ca8ae;
      --accent: #58d68d;
      --warn: #f2c94c;
      --danger: #e85959;
    }

    * {
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      background:
        linear-gradient(rgba(255, 255, 255, 0.18), rgba(8, 32, 24, 0.2)),
        url("/assets/backgrounds/world-cup-2026-bright.svg") center / cover no-repeat fixed;
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
      overflow-x: hidden;
    }

    main {
      width: min(720px, calc(100vw - 42px));
      padding: 22px 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 26px;
    }

    .box {
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.72);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.18);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16), 0 16px 26px rgba(0, 0, 0, 0.28);
      cursor: pointer;
      text-decoration: none;
      transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
    }

    .box:hover,
    .box:focus-visible {
      border-color: var(--warn);
      transform: translateY(-2px);
      outline: none;
    }

    .box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(1.08) contrast(1.03);
    }

    .overlay {
      position: fixed;
      inset: 0;
      z-index: 10;
      display: grid;
      place-items: center;
      padding: 18px;
      background: rgba(0, 0, 0, 0.68);
    }

    .popup {
      position: relative;
      width: min(430px, calc(100vw - 36px));
      padding: 26px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(24, 28, 32, 0.96);
      color: var(--text);
      text-align: center;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
    }

    .popup-image {
      width: min(230px, 72vw);
      aspect-ratio: 1;
      object-fit: cover;
      margin-bottom: 12px;
      border: 1px solid rgba(238, 242, 243, 0.18);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
    }

    .popup h2 {
      margin: 0 0 10px;
      font-size: 24px;
      letter-spacing: 0;
      text-transform: capitalize;
    }

    .popup p {
      margin: 0;
      font-size: 17px;
      line-height: 1.45;
    }

    .success {
      border-color: rgba(88, 214, 141, 0.8);
      color: var(--accent);
    }

    .muted-popup {
      color: var(--muted);
    }

    .close {
      position: absolute;
      top: 10px;
      right: 12px;
      color: var(--muted);
      font-size: 22px;
      line-height: 1;
      text-decoration: none;
    }

    .close:hover,
    .close:focus-visible {
      color: var(--danger);
      outline: none;
    }

    @media (max-width: 680px) {
      main {
        width: min(460px, calc(100vw - 28px));
      }

      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

    }
  </style>
</head>
<body>
  <!-- When you click one of six images, look at url please -->
  <main>
    <section class="grid" aria-label="Footballer choices">
      ${items
        .map(
          (item) =>
            `<a class="box" href="/?name=${encodeURIComponent(item.value)}" data-name="${escapeHtml(item.value)}" aria-label="${escapeHtml(item.value)}">
              <img src="${escapeHtml(item.image)}" alt="">
            </a>`
        )
        .join("")}
    </section>
  </main>
  ${popup}
  <audio id="bgMusic" src="/assets/audio/y-que-fue.mp3" autoplay loop preload="auto"></audio>
  <script src="/assets/app.js" defer></script>
</body>
</html>`;
}

function servePlayerApi(url, res) {
  const name = (url.searchParams.get("name") || "").trim();
  const item = getSelectedItem(name);

  if (!item) {
    res.writeHead(404, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(item));
}

function serveStaticAsset(url, res) {
  const requestedPath = decodeURIComponent(url.pathname.replace(/^\/assets\//, ""));
  const assetPath = path.normalize(path.join(ASSETS_DIR, requestedPath));

  if (!assetPath.startsWith(ASSETS_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(assetPath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypes[path.extname(assetPath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/player") {
    servePlayerApi(url, res);
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    serveStaticAsset(url, res);
    return;
  }

  if (url.pathname !== "/") {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(renderPage(url.searchParams.get("name") || ""));
});

server.listen(PORT, () => {
  console.log(`Challenge running at http://localhost:${PORT}`);
});
