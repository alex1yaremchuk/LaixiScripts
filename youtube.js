let DEBUG = true;
if (DEBUG) {
  console.show();
} // плавающая консоль

("ui");
auto.waitFor(); // ждём включения службы доступности

// === настройки ===
const PKG = "com.google.android.youtube";
const OPEN_TIMEOUT = 15000; // максимум 15с ждём старт Ютуба
const FIND_TIMEOUT = 8000; // сколько ждать элементы меню "Создать", "Загрузить видео"

// ==== вспомогалки ====
function sleepShort(ms) {
  sleep(ms || 500);
}

function tapCenter(node) {
  if (!node) return false;
  let b = node.bounds();
  click(b.centerX(), b.centerY());
  return true;
}

function findOneOf(fns, timeout) {
  let end = Date.now() + (timeout || FIND_TIMEOUT);
  while (Date.now() < end) {
    for (let fn of fns) {
      let n = fn();
      if (n) return n;
    }
    sleep(300);
  }
  return null;
}

function tryClickOneOf(fns, timeout) {
  let n = findOneOf(fns, timeout);
  if (n) return tapCenter(n);
  return false;
}

// === шаг 1: запускаем YouTube ===
if (!app.launchPackage(PKG)) {
  toastLog("Не смог запустить YouTube, пробую через название...");
  if (!launchApp("YouTube") && !launchApp("Ютуб")) {
    toastLog("YouTube не найден. Установлен ли он?");
    exit();
  }
}
toastLog("Открываю YouTube…");

// ждём, пока действительно открылся
waitForActivity(null, OPEN_TIMEOUT);

toastLog("YouTube Открылся!");

// === шаг 2: нажать кнопку «Создать» (иконка +) ===
// Пробуем разные варианты: content-desc, id, текст.
let clickedCreate = tryClickOneOf(
  [
    () =>
      descMatches(/Create|Создать/i)
        .clickable()
        .findOne(50),
    () =>
      idMatches(/fab|create|upload|button_create/i)
        .clickable()
        .findOne(50),
    () =>
      textMatches(/Create|Создать/i)
        .clickable()
        .findOne(50),
    () =>
      className("android.widget.ImageView")
        .descMatches(/\+|Create|Создать/i)
        .clickable()
        .findOne(50),
    () =>
      className("android.widget.FrameLayout")
        .descMatches(/Create|Создать/i)
        .findOne(50),
  ],
  FIND_TIMEOUT,
);

if (!clickedCreate) {
  toastLog(
    "Не нашёл кнопку «Создать» (+). Проверь, что YouTube открыт на главной.",
  );
  exit();
}
toastLog("Открыл меню «Создать».");
sleepShort(700);

// === шаг 3: выбрать «Загрузить видео» ===
let clickedUpload = tryClickOneOf(
  [
    () =>
      textMatches(/Upload a video|Загрузить видео/i)
        .clickable()
        .findOne(50),
    () =>
      descMatches(/Upload a video|Загрузить видео/i)
        .clickable()
        .findOne(50),
    // иногда пункты меню приходят как дочерние; попробуем по contains:
    () => textContains("Upload").clickable().findOne(50),
    () => textContains("Загруз").clickable().findOne(50),
  ],
  FIND_TIMEOUT,
);

if (!clickedUpload) {
  toastLog(
    "Не нашёл пункт «Загрузить видео». Возможно, открыт другой аккаунт/экран.",
  );
  exit();
}

toastLog("Открыт экран выбора видео для загрузки ✅");
