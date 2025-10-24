"ui";

var DEBUG = false;

if (DEBUG) {
  try {
    console.show();
    console.setExitOnClose(true);
    console.setTitle("YT uploader");
  } catch (e) {}
}

if (!auto.service) {
  toastLog("⚠️ Включи Laixi в Accessibility и перезапусти скрипт.");
  sleep(2000);
  exit();
}

auto.waitFor();

var PKG = "com.google.android.youtube";
var OPEN_DELAY_MS = 6000;
var CREATE_TIMEOUT = 12000;
var UPLOAD_TIMEOUT = 12000;
var POLL_INTERVAL_MS = 400;

// Переводи каждый шаг в true постепенно.

var CREATE_MATCHERS = [
  function () {
    return idMatches(/fab|create_button|create_icon|button_create/i).findOne(
      200,
    );
  },
  function () {
    return descMatches(
      /create|\u0441\u043E\u0437\u0434\u0430\u0442\u044C|crear|cr(?:e|\u00E9)er|crear contenido|schaffen|criar/i,
    ).findOne(200);
  },
  function () {
    return textMatches(
      /create|\u0441\u043E\u0437\u0434\u0430\u0442\u044C|crear|cr(?:e|\u00E9)er|create a short/i,
    ).findOne(200);
  },
  function () {
    return descContains("+").findOne(200);
  },
];

var UPLOAD_MATCHERS = [
  function () {
    return textMatches(
      /upload( (a )?video)?|\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0432\u0438\u0434\u0435\u043E|subir video|t(?:ai|\u1EA3i) video|t(?:e|\u00E9)l(?:e|\u00E9)charger|hochladen/i,
    ).findOne(200);
  },
  function () {
    return descMatches(
      /upload( (a )?video)?|\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0432\u0438\u0434\u0435\u043E|subir video|t(?:ai|\u1EA3i) video|hochladen/i,
    ).findOne(200);
  },
  function () {
    return idMatches(
      /upload|new_post|create_dialog_upload|create_dialog_shorts/i,
    ).findOne(200);
  },
  function () {
    return textContains("Upload").findOne(200);
  },
];

function runSteps() {
  toastLog("runSteps entered");
  try {
    toastLog("Before ensureYouTubeOpen()");
    ensureYouTubeOpen();
    toastLog("After ensureYouTubeOpen()");

    toastLog("Waiting for the app to load.");
    sleep(OPEN_DELAY_MS);

    toastLog("Looking for the create button (step 2).");
    var createClicked = clickAny(CREATE_MATCHERS, CREATE_TIMEOUT);
    toastLog("clickAny CREATE result=" + createClicked);
    sleep(700);

    toastLog("Looking for the upload option (step 3).");
    var uploadClicked = clickAny(UPLOAD_MATCHERS, UPLOAD_TIMEOUT);
    toastLog("clickAny UPLOAD result=" + uploadClicked);

    toastLog("Done: upload option pressed.");
  } catch (err) {
    var message = err && err.message ? err.message : err;
    toastLog("Error: " + message);
    if (DEBUG) {
      try {
        console.error(err);
      } catch (e) {}
    }
  } finally {
    finish();
  }
}

function finish() {
  toastLog("Script finished.");
  setTimeout(function () {
    exit();
  }, 300);
}

function ensureYouTubeOpen() {
  var currentPkg = currentPackage();
  toastLog("ensureYouTubeOpen start, currentPackage=" + currentPkg);
  if (currentPkg !== PKG) {
    toastLog("Trying to launch via adb shell am start.");
    var cmd = "am start -n " + PKG + "/com.google.android.youtube.HomeActivity";
    var result = shell(cmd);
    toastLog("am start exit=" + result.code);
    if (result.stdout) {
      toastLog("am start stdout: " + result.stdout);
    }
    if (result.stderr) {
      toastLog("am start stderr: " + result.stderr);
    }

    var detected = waitForPackage(PKG, 5000);
    if (detected) {
      toastLog("YouTube detected after am start.");
    } else {
      toastLog("YouTube still not in foreground, trying launchApp fallback.");
      var launched =
        safeLaunchByName("YouTube") ||
        safeLaunchByName("\u042e\u0442\u0443\u0431");
      toastLog("fallback launchApp result=" + launched);
      if (!launched) {
        toastLog("Open YouTube manually and rerun.");
      }
    }
  }
  sleep(3000);
}

function safeLaunchByName(name) {
  try {
    return launchApp(name);
  } catch (e) {
    return false;
  }
}

function clickAny(matchers, timeout) {
  var node = waitForNode(matchers, timeout || 0);
  if (!node) {
    return false;
  }
  return tryClickChain(node);
}

function waitForNode(matchers, timeout) {
  var deadline = Date.now() + Math.max(timeout, 0);
  while (Date.now() < deadline) {
    for (var i = 0; i < matchers.length; i++) {
      var found = null;
      try {
        found = matchers[i]();
      } catch (e) {
        found = null;
      }
      if (found) {
        return found;
      }
    }
    sleep(POLL_INTERVAL_MS);
  }
  return null;
}

function tryClickChain(node) {
  var current = node;
  for (var depth = 0; depth < 3 && current; depth++) {
    if (clickNode(current)) {
      return true;
    }
    current = current.parent ? current.parent() : null;
  }
  return false;
}

function clickNode(node) {
  if (!node) {
    return false;
  }
  try {
    if (node.click && node.click()) {
      return true;
    }
  } catch (e) {}
  try {
    var bounds = node.bounds();
    if (!bounds) {
      return false;
    }
    return click(bounds.centerX(), bounds.centerY());
  } catch (e) {
    return false;
  }
}

function waitForPackage(name, timeout) {
  var deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (currentPackage() === name) {
      return true;
    }
    sleep(300);
  }
  return false;
}

threads.start(function () {
  runSteps();
});
