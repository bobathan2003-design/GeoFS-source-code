(function () {
  "use strict";

  const SETTINGS_KEY = "geofsLauncherSettings";
  const defaultSettings = {
    assetOrigin: "https://www.geo-fs.com",
    ionToken: "",
  };

  const state = {
    initialized: false,
    started: false,
  };

  function $(selector) {
    return document.querySelector(selector);
  }

  function log(message) {
    const line = `[${new Date().toLocaleTimeString()}] ${message}`;
    const bootLog = $("#boot-log");
    if (bootLog) {
      bootLog.textContent += `${line}\n`;
      bootLog.scrollTop = bootLog.scrollHeight;
    }
    console.log(line);
  }

  function readSettings() {
    try {
      return Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {});
    } catch (error) {
      log(`Could not read launcher settings: ${error.message}`);
      return Object.assign({}, defaultSettings);
    }
  }

  function writeSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function normalizeOrigin(origin) {
    return origin.replace(/\/+$/, "");
  }

  function getSettingsFromForm() {
    return {
      assetOrigin: normalizeOrigin($("#asset-origin").value.trim() || defaultSettings.assetOrigin),
      ionToken: $("#ion-token").value.trim(),
    };
  }

  function showNotification(message) {
    const notification = $(".geofs-notification");
    if (!notification) return;
    notification.innerHTML = message;
    notification.classList.add("is-visible");
    window.clearTimeout(showNotification.timeout);
    showNotification.timeout = window.setTimeout(() => notification.classList.remove("is-visible"), 7000);
  }

  function configureGlobals(settings) {
    window.geofs = window.geofs || {};
    window.geofs.PRODUCTION = false;
    window.geofs.manualStart = true;
    window.geofs.autoStart = false;
    window.geofs.url = settings.assetOrigin;
    window.geofs.localUrl = `${settings.assetOrigin}/`;
    window.geofs.ionkey = settings.ionToken;
    window.geofs.userRecord = window.geofs.userRecord || { mutelist: [] };
    window.geofs.userRecord.mutelist = window.geofs.userRecord.mutelist || [];
    window.geofs.aircraftList = window.geofs.aircraftList || {
      1: { name: "Cessna 172", path: "/models/aircraft/c172/" },
    };
    window.geofs.buildingServer = window.geofs.buildingServer || `${settings.assetOrigin}/backend/buildings/`;
    window.geofs.multiplayerHost = window.geofs.multiplayerHost || "https://net.geo-fs.com:8080";
  }

  function installCompatibilityShims() {
    window.componentHandler = window.componentHandler || { upgradeDom: function () {} };
    window.fireBasicEvent = window.fireBasicEvent || function (eventName) {
      document.dispatchEvent(new CustomEvent(eventName));
    };

    if (window.jQuery) {
      window.jQuery.haring = window.jQuery.haring || {
        create: function (message) {
          showNotification(message);
        },
      };

      window.jQuery.fn.htmlView = window.jQuery.fn.htmlView || function (action, url) {
        log(`Skipped htmlView ${action || "call"}${url ? `: ${url}` : ""}`);
        return this;
      };
    }
  }

  function verifyRuntime() {
    const missing = [];
    if (!window.jQuery) missing.push("jQuery");
    if (!window.Cesium) missing.push("Cesium");
    if (!window.geofs) missing.push("GeoFS.js");
    if (missing.length) {
      throw new Error(`Missing required runtime dependency: ${missing.join(", ")}`);
    }
  }

  function initializeGeoFS() {
    if (state.initialized) return;
    verifyRuntime();
    installCompatibilityShims();
    log("Dispatching GeoFS deferredload event.");
    window.dispatchEvent(new Event("deferredload"));
    state.initialized = true;
    log("GeoFS initialized in manual-start mode.");
  }

  function startGeoFS() {
    const settings = getSettingsFromForm();
    writeSettings(settings);
    configureGlobals(settings);
    installCompatibilityShims();

    if (!settings.ionToken) {
      showNotification("Add a Cesium Ion token before starting. GeoFS uses Cesium terrain/imagery services.");
      log("Start blocked: missing Cesium Ion token.");
      return;
    }

    try {
      initializeGeoFS();
      if (!state.started) {
        log("Starting archived GeoFS.js.");
        window.geofs.start(1);
        state.started = true;
        $(".launcher-panel").classList.add("is-collapsed");
      }
    } catch (error) {
      log(`GeoFS failed to start: ${error.message}`);
      showNotification(`GeoFS failed to start: ${error.message}`);
    }
  }

  function bindUI() {
    const settings = readSettings();
    $("#asset-origin").value = settings.assetOrigin;
    $("#ion-token").value = settings.ionToken;
    configureGlobals(settings);
    installCompatibilityShims();

    $("#save-settings").addEventListener("click", function () {
      writeSettings(getSettingsFromForm());
      showNotification("GeoFS launcher settings saved.");
      log("Settings saved.");
    });

    $("#start-geofs").addEventListener("click", startGeoFS);
    $(".geofs-fly-button").addEventListener("click", startGeoFS);

    window.addEventListener("error", function (event) {
      log(`Runtime error: ${event.message}`);
    });

    window.addEventListener("unhandledrejection", function (event) {
      const reason = event.reason && event.reason.message ? event.reason.message : event.reason;
      log(`Unhandled promise rejection: ${reason}`);
    });

    document.addEventListener("geofsInitialized", function () {
      log("Received geofsInitialized.");
    });

    document.addEventListener("geofsStarted", function () {
      log("Received geofsStarted.");
    });

    log("Launcher ready. Paste a Cesium Ion token, then click Start GeoFS.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindUI);
  } else {
    bindUI();
  }
})();
