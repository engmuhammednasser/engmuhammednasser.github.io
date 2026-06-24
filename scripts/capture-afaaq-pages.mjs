import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const root = process.cwd();
const outputDirectory = path.join(root, "projects", "afaaq-developments", "full-page");
const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "afaaq-capture-"));
const port = 9333;

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
];

const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!browserPath) {
  throw new Error("No supported Chromium browser was found for capturing Afaaq screenshots.");
}

const pages = [
  ["01-home", "https://afaaqdevelopments.com/"],
  ["02-about-us", "https://afaaqdevelopments.com/about-us-2/"],
  ["03-amorada-park-view", "https://afaaqdevelopments.com/amorada-park-view-2/"],
  ["04-amorada-new-cairo", "https://afaaqdevelopments.com/amorada-new-cairo/"],
  ["05-amorada-hub", "https://afaaqdevelopments.com/amorada-hub/"],
  ["06-press-media", "https://afaaqdevelopments.com/press-media/"],
  ["07-contact-us", "https://afaaqdevelopments.com/contact-us/"]
];

fs.mkdirSync(outputDirectory, { recursive: true });

for (const file of fs.readdirSync(outputDirectory)) {
  if (/^\d{2}-.*\.(?:jpe?g|png)$/i.test(file) || file === "manifest.json") {
    fs.rmSync(path.join(outputDirectory, file));
  }
}

const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--disable-features=Translate,MediaRouter",
    "--disable-background-networking",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    "about:blank"
  ],
  { windowsHide: true, stdio: "ignore" }
);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForBrowser() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {}
    await sleep(150);
  }
  throw new Error("Timed out waiting for Chromium to become available.");
}

const target = await waitForBrowser();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitForPage(url) {
  await send("Page.navigate", { url });
  for (let attempt = 0; attempt < 220; attempt += 1) {
    await sleep(125);
    const state = await evaluate("document.readyState");
    if (state === "complete") break;
  }
  await sleep(2200);
}

async function preparePage() {
  return evaluate(`(async () => {
    const previousStyle = document.querySelector("style[data-capture-style='true']");
    if (previousStyle) previousStyle.remove();

    const style = document.createElement("style");
    style.dataset.captureStyle = "true";
    style.textContent = [
      "html{scroll-behavior:auto!important}",
      "*,*::before,*::after{transition-duration:.001s!important;animation-duration:.001s!important;animation-delay:0s!important;caret-color:transparent!important}",
      ".grecaptcha-badge,.grecaptcha-logo,.grecaptcha-error,.dialog-widget,.modal,.popup,.pum-overlay,.pum-container,.fancybox__container{display:none!important}",
      ".elementor-invisible,.wpb_animate_when_almost_visible,.wpb_start_animation{opacity:1!important;visibility:visible!important;transform:none!important}",
      ".mfp-wrap,.mfp-bg{display:none!important}",
      ".elementor-sticky--active{position:static!important;top:auto!important}"
    ].join("");
    document.head.appendChild(style);

    const labels = [
      "accept", "accept all", "allow all", "got it", "close", "ok", "agree",
      "قبول", "موافق", "إغلاق", "اغلاق", "حسنا"
    ];

    for (const element of document.querySelectorAll("button, a, [role='button']")) {
      const text = (element.textContent || element.getAttribute("aria-label") || "").trim().toLowerCase();
      if (!text) continue;
      if (labels.includes(text) && element.offsetParent !== null) {
        try { element.click(); } catch {}
      }
    }

    for (const image of document.querySelectorAll("img[loading='lazy']")) {
      image.loading = "eager";
    }

    let previousHeight = 0;
    for (let pass = 0; pass < 4; pass += 1) {
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 720) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      window.scrollTo(0, height);
      await new Promise((resolve) => setTimeout(resolve, 700));
      const nextHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      if (nextHeight === previousHeight || Math.abs(nextHeight - height) < 20) break;
      previousHeight = nextHeight;
    }

    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      title: document.title,
      finalUrl: location.href
    };
  })()`);
}

async function captureTiledJpeg(width, height, destination) {
  const tileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "afaaq-tiles-"));
  const tileHeight = 1000;

  try {
    let tileIndex = 0;
    for (let y = 0; y < height; y += tileHeight) {
      const currentHeight = Math.min(tileHeight, height - y);
      const screenshot = await send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 88,
        fromSurface: true,
        captureBeyondViewport: true,
        clip: { x: 0, y, width, height: currentHeight, scale: 1 }
      });

      fs.writeFileSync(
        path.join(tileDirectory, `${String(tileIndex).padStart(3, "0")}.jpg`),
        Buffer.from(screenshot.data, "base64")
      );
      tileIndex += 1;
    }

    const powershell = `
Add-Type -AssemblyName System.Drawing
$tiles = Get-ChildItem -LiteralPath $env:TILE_DIR -Filter *.jpg | Sort-Object Name
$canvas = [System.Drawing.Bitmap]::new([int]$env:IMAGE_WIDTH, [int]$env:IMAGE_HEIGHT)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::White)
$offsetY = 0
foreach ($tile in $tiles) {
  $image = [System.Drawing.Image]::FromFile($tile.FullName)
  $graphics.DrawImageUnscaled($image, 0, $offsetY)
  $offsetY += $image.Height
  $image.Dispose()
}
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]84)
$canvas.Save($env:IMAGE_OUTPUT, $codec, $parameters)
$parameters.Dispose()
$graphics.Dispose()
$canvas.Dispose()
`;

    const result = spawnSync("powershell", ["-NoProfile", "-Command", powershell], {
      windowsHide: true,
      encoding: "utf8",
      env: {
        ...process.env,
        TILE_DIR: tileDirectory,
        IMAGE_WIDTH: String(width),
        IMAGE_HEIGHT: String(height),
        IMAGE_OUTPUT: destination
      }
    });

    if (result.status !== 0) {
      throw new Error(result.stderr || "Failed to stitch screenshot tiles.");
    }
  } finally {
    fs.rmSync(tileDirectory, { recursive: true, force: true });
  }
}

function cropCoverFromHomepage(sourcePath, destinationPath) {
  const powershell = `
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile($env:SOURCE_IMAGE)
$cropWidth = [Math]::Min(1440, $source.Width)
$cropHeight = [Math]::Min(900, $source.Height)
$x = [int][Math]::Max(0, ($source.Width - $cropWidth) / 2)
$y = 0
$bitmap = [System.Drawing.Bitmap]::new($cropWidth, $cropHeight)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $cropWidth, $cropHeight), [System.Drawing.Rectangle]::new($x, $y, $cropWidth, $cropHeight), [System.Drawing.GraphicsUnit]::Pixel)
$bitmap.Save($env:DEST_IMAGE, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
$source.Dispose()
`;

  const result = spawnSync("powershell", ["-NoProfile", "-Command", powershell], {
    windowsHide: true,
    encoding: "utf8",
    env: {
      ...process.env,
      SOURCE_IMAGE: sourcePath,
      DEST_IMAGE: destinationPath
    }
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "Failed to generate Afaaq cover image.");
  }
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false
});

const manifest = [];

try {
  for (let index = 0; index < pages.length; index += 1) {
    const [name, url] = pages[index];
    const filename = `${name}.jpg`;
    const destination = path.join(outputDirectory, filename);
    process.stdout.write(`[${index + 1}/${pages.length}] ${name} ... `);

    try {
      await waitForPage(url);
      const pageInfo = await preparePage();
      const metrics = await send("Page.getLayoutMetrics");
      const content = metrics.cssContentSize;
      const width = Math.ceil(Math.min(1440, content.width));
      const height = Math.ceil(content.height);

      if (height > 10000) {
        await captureTiledJpeg(width, height, destination);
      } else {
        const screenshot = await send("Page.captureScreenshot", {
          format: "jpeg",
          quality: 84,
          fromSurface: true,
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width, height, scale: 1 }
        });
        fs.writeFileSync(destination, Buffer.from(screenshot.data, "base64"));
      }

      const size = fs.statSync(destination).size;
      manifest.push({
        order: index + 1,
        name,
        file: filename,
        requestedUrl: url,
        finalUrl: pageInfo.finalUrl,
        title: pageInfo.title,
        width,
        height,
        bytes: size
      });

      console.log(`${width}x${height}, ${(size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      manifest.push({
        order: index + 1,
        name,
        file: null,
        requestedUrl: url,
        error: error.message
      });
      console.log(`FAILED: ${error.message}`);
    }
  }

  const homepage = manifest.find((page) => page.name === "01-home" && page.file);
  if (homepage) {
    cropCoverFromHomepage(
      path.join(outputDirectory, homepage.file),
      path.join(root, "projects", "afaaq-developments", "cover.png")
    );
  }
} finally {
  fs.writeFileSync(
    path.join(outputDirectory, "manifest.json"),
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        browserPath,
        viewportWidth: 1440,
        scope: "Seven primary English pages from Afaaq Developments main navigation.",
        pages: manifest
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  socket.close();
  browser.kill();
  await sleep(400);

  try {
    fs.rmSync(profileDirectory, { recursive: true, force: true });
  } catch {}
}

const successful = manifest.filter((item) => item.file).length;
const failed = manifest.length - successful;
console.log(`Captured ${successful} pages; ${failed} failed.`);
