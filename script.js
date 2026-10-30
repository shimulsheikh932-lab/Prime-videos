/* ============================================================
   REDIRECT SYSTEM — SCRIPT
   ------------------------------------------------------------
   নিচের CONFIG অংশেই সব বদলাবেন — কোডের বাকি অংশ ধরার দরকার নেই।
   ============================================================ */

/* ---------- ১) CONFIG ---------- */

// GIF ইমেজ লিংক — নিজের GIF লিংক পেস্ট করুন (যত খুশি যোগ করতে পারেন)।
// নিচের gifs/ ফোল্ডারের ডেমোগুলো চলছে; নিজের লিংক বসালে এগুলো মুছে দিন।
var GIF_URLS = [
  "gifs/gif-star.gif",
  "gifs/gif-heart.gif",
  "gifs/gif-bolt.gif",
  "gifs/gif-ball.gif",
  "gifs/gif-ring.gif",
  "gifs/gif-sparkle.gif",
  "gifs/gif-flame.gif",
  "gifs/gif-smiley.gif"
];

// Redirect লিংক লিস্ট — প্রতিবার (প্রতি visit-এ) একটা করে link select হয়ে
// external browser-এ খুলবে। নতুন লিংক যোগ করলে সেটাও rotation-এ ঢুকে যাবে।
var TARGET_LINKS = [
  "https://urlbit.pro/ieqcF",
  "https://urlbit.pro/NvDcW",
  "https://urlbit.pro/MTfmH",
  "https://urlbit.pro/dyNiO"
];

// কত সেকেন্ড পরে redirect হবে
var REDIRECT_SECONDS = 5;

// পেজ জুড়ে কতগুলো ছোট GIF ভাসবে
var PARTICLE_COUNT = 44;

/* ---------- ২) REDIRECT LOGIC ---------- */

var IN_APP_UA = /FBAN|FBAV|FB_IAB|FB4A|Instagram|musical_ly|tiktok|Line\//i;

function isInAppBrowser(ua) {
  ua = ua || navigator.userAgent;
  return IN_APP_UA.test(ua);
}

function isAndroid(ua) {
  ua = ua || navigator.userAgent;
  return /android/i.test(ua);
}

function isIOS(ua) {
  ua = ua || navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ নিজেকে Macintosh হিসেবে report করে, কিন্তু touch point থাকে
  return /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
}

// Android intent URL — Chrome-এ খুলবে, Chrome না থাকলে fallback browser-এ
function buildAndroidIntentUrl(target) {
  var withoutScheme = target.replace(/^https?:\/\//i, "");
  return "intent://" + withoutScheme +
    "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" +
    encodeURIComponent(target) + ";end";
}

// Best-effort "in-app browser থেকে বের হওয়া" redirect
function openInExternalBrowser(target) {
  try {
    if (isAndroid()) {
      window.location.replace(isInAppBrowser() ? buildAndroidIntentUrl(target) : target);
      return;
    }
    if (isIOS() && isInAppBrowser()) {
      var anchor = document.createElement("a");
      anchor.href = target;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(function () { window.location.href = target; }, 1500);
      return;
    }
    window.location.replace(target);
  } catch (err) {
    window.location.href = target;
  }
}

/* ---------- ৩) LINK ROTATION (প্রতিবার একটা করে) ---------- */

var STORAGE_KEY = "redirect-cycle-index";

function readCycleIndex() {
  try {
    var raw = window.localStorage.getItem(STORAGE_KEY);
    var parsed = raw === null ? 0 : Number(raw);
    if (isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  } catch (err) { /* storage না থাকলে 0 থেকে শুরু */ }
  return 0;
}

function selectTargetLink(index) {
  var len = TARGET_LINKS.length;
  return TARGET_LINKS[((index % len) + len) % len];
}

function storeNextCycleIndex(current) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String((current + 1) % TARGET_LINKS.length));
  } catch (err) { /* private mode — প্রতিবার প্রথম লিংক থেকে শুরু হবে */ }
}

/* ---------- ৪) FLOATING GIF PARTICLES ---------- */

// Deterministic PRNG — প্রতিবার একই রকম layout দেয়
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles() {
  var rand = mulberry32(20261030);
  var drifts = ["drift-a", "drift-b", "drift-c"];
  var list = [];
  for (var i = 0; i < PARTICLE_COUNT; i++) {
    list.push({
      src: GIF_URLS[i % GIF_URLS.length],
      size: 22 + Math.round(rand() * 34),
      left: rand() * 92,
      top: rand() * 92,
      drift: drifts[Math.floor(rand() * drifts.length)],
      duration: 2.6 + rand() * 2.4,
      delay: -rand() * 3,
      opacity: 0.55 + rand() * 0.45
    });
  }
  return list;
}

function renderParticles() {
  if (!GIF_URLS.length) return;
  var holder = document.getElementById("particles");
  var html = "";
  var particles = buildParticles();
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    html += '<img src="' + p.src + '" alt="" width="' + p.size + '" height="' + p.size +
      '" style="left:' + p.left + "%;top:" + p.top + "%;width:" + p.size + "px;height:" + p.size +
      "px;opacity:" + p.opacity.toFixed(2) +
      ";animation:" + p.drift + " " + p.duration.toFixed(2) + "s ease-in-out " + p.delay.toFixed(2) + 's infinite" />';
  }
  holder.innerHTML = html;
}

/* ---------- ৫) COUNTDOWN + AUTO REDIRECT ---------- */

(function main() {
  // Countdown ring-এর animation duration config অনুযায়ী সেট করা
  document.documentElement.style.setProperty("--redirect-seconds", REDIRECT_SECONDS + "s");

  renderParticles();

  var current = readCycleIndex();
  var link = selectTargetLink(current);
  storeNextCycleIndex(current); // পরের visit-এর জন্য পরের লিংক সেভ

  var secondsLeft = REDIRECT_SECONDS;
  var countdownEl = document.getElementById("countdown");
  var fallbackEl = document.getElementById("fallback");
  var openNowBtn = document.getElementById("openNow");

  openNowBtn.addEventListener("click", function () {
    openInExternalBrowser(link);
  });

  countdownEl.textContent = String(secondsLeft);
  setTimeout(function () {
    openInExternalBrowser(link);
    fallbackEl.classList.remove("hidden");
  }, REDIRECT_SECONDS * 1000);

  var tick = setInterval(function () {
    secondsLeft = Math.max(0, secondsLeft - 1);
    countdownEl.textContent = String(secondsLeft);
    if (secondsLeft === 0) clearInterval(tick);
  }, 1000);
})();
