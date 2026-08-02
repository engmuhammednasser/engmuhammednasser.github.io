(function () {
  "use strict";

  if (window.__portfolioInteractiveBackgroundLoaded) return;
  window.__portfolioInteractiveBackgroundLoaded = true;

  function createMediaQuery(query) {
    if (typeof window.matchMedia === "function") return window.matchMedia(query);
    return {
      matches: false,
      addEventListener: function () {},
      removeEventListener: function () {},
      addListener: function () {},
      removeListener: function () {}
    };
  }

  function listenToMediaQuery(query, listener) {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
      return function () {
        query.removeEventListener("change", listener);
      };
    }
    if (typeof query.addListener === "function") {
      query.addListener(listener);
      return function () {
        query.removeListener(listener);
      };
    }
    return function () {};
  }

  function createRuntimePolicy() {
    var reducedMotionQuery = createMediaQuery("(prefers-reduced-motion: reduce)");
    var desktopQuery = createMediaQuery("(min-width: 1024px)");
    var finePointerQuery = createMediaQuery("(pointer: fine)");
    var hoverQuery = createMediaQuery("(hover: hover)");
    var mediaQueries = [reducedMotionQuery, desktopQuery, finePointerQuery, hoverQuery];

    function hasWebGLApi() {
      return Boolean(window.WebGLRenderingContext || window.WebGL2RenderingContext);
    }

    function read() {
      var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      var isDesktop = desktopQuery.matches && viewportWidth >= 1024;
      var hasFinePointer = finePointerQuery.matches;
      var hasHover = hoverQuery.matches;
      var motionAllowed = !reducedMotionQuery.matches;
      var pageVisible = document.visibilityState !== "hidden";

      return {
        reducedMotion: !motionAllowed,
        motionAllowed: motionAllowed,
        desktop: isDesktop,
        finePointer: hasFinePointer,
        hover: hasHover,
        pageVisible: pageVisible,
        viewportWidth: viewportWidth,
        webglAvailable: hasWebGLApi(),
        pointerEffectsAllowed: isDesktop && hasFinePointer && hasHover && motionAllowed,
        heroWebGLAllowed:
          isDesktop && hasFinePointer && hasHover && motionAllowed && pageVisible && hasWebGLApi()
      };
    }

    function subscribe(listener) {
      var previous = read();
      var cleanups = mediaQueries.map(function (query) {
        return listenToMediaQuery(query, notify);
      });

      function notify() {
        var next = read();
        listener(next, previous);
        previous = next;
      }

      document.addEventListener("visibilitychange", notify);
      cleanups.push(function () {
        document.removeEventListener("visibilitychange", notify);
      });

      return function () {
        cleanups.forEach(function (cleanup) {
          cleanup();
        });
      };
    }

    return {
      read: read,
      subscribe: subscribe,
      canUsePointerEffects: function () {
        return read().pointerEffectsAllowed;
      },
      canUseHeroWebGL: function () {
        return read().heroWebGLAllowed;
      },
      canUseHeroPointer: function () {
        var state = read();
        return state.pointerEffectsAllowed && state.pageVisible;
      }
    };
  }

  function createAnimationLoop(policy, callback) {
    var frame = 0;
    var running = false;
    var localVisible = true;
    var disposed = false;
    var unsubscribe = policy.subscribe(function (state) {
      if (!state.pageVisible || !localVisible) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      schedule();
    });

    function schedule() {
      if (
        frame ||
        !running ||
        disposed ||
        !localVisible ||
        !policy.read().pageVisible ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        return;
      }
      frame = window.requestAnimationFrame(tick);
    }

    function tick(now) {
      frame = 0;
      if (!running || disposed || !localVisible || !policy.read().pageVisible) return;
      try {
        callback(now);
      } catch (error) {
        console.warn("Portfolio decorative animation stopped:", error);
        destroy();
        return;
      }
      schedule();
    }

    function start() {
      running = true;
      schedule();
    }

    function setVisible(nextVisible) {
      localVisible = nextVisible;
      if (!localVisible && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      if (localVisible) schedule();
    }

    function stop() {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    }

    function destroy() {
      if (disposed) return;
      disposed = true;
      stop();
      unsubscribe();
    }

    return {
      start: start,
      stop: stop,
      setVisible: setVisible,
      destroy: destroy
    };
  }

  var policy = createRuntimePolicy();
  var activeCleanup = null;
  var activeHero = null;
  var globalMoodCleanup = null;
  var globalMoodElement = null;
  var globalMoodPointerEnabled = false;
  var scheduled = false;
  var idleHandle = 0;
  var policyCleanup = null;

  function isHomePage() {
    return /^\/(?:ar\/?)?$/.test(window.location.pathname);
  }

  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    var program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Shader linking failed");
    }
    return program;
  }

  function mountGlobalMood() {
    var pointerEnabled = policy.canUsePointerEffects();
    if (globalMoodElement && globalMoodElement.isConnected && globalMoodPointerEnabled === pointerEnabled) {
      return;
    }
    if (globalMoodCleanup) globalMoodCleanup();

    document.body.classList.add("portfolio-polished");
    var ambient = document.createElement("div");
    ambient.className = "portfolio-site-ambient";
    ambient.setAttribute("aria-hidden", "true");
    ambient.innerHTML =
      '<span class="portfolio-ambient-orb portfolio-ambient-orb-blue"></span>' +
      '<span class="portfolio-ambient-orb portfolio-ambient-orb-green"></span>' +
      '<span class="portfolio-ambient-grid"></span>' +
      '<span class="portfolio-pointer-glow"></span>';
    document.body.insertBefore(ambient, document.body.firstChild);
    globalMoodElement = ambient;
    globalMoodPointerEnabled = pointerEnabled;

    var pointerLoop = null;
    var onPointerMove = null;
    if (pointerEnabled) {
      var pointerGlow = ambient.querySelector(".portfolio-pointer-glow");
      var target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.34 };
      var current = { x: target.x, y: target.y };

      pointerLoop = createAnimationLoop(policy, function () {
        current.x += (target.x - current.x) * 0.075;
        current.y += (target.y - current.y) * 0.075;
        pointerGlow.style.transform =
          "translate3d(" + (current.x - 190) + "px," + (current.y - 190) + "px,0)";
        if (Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1) {
          pointerLoop.stop();
        }
      });

      onPointerMove = function (event) {
        if (!policy.canUseHeroPointer()) return;
        target.x = event.clientX;
        target.y = event.clientY;
        ambient.classList.add("portfolio-ambient-pointer-active");
        pointerLoop.start();
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    globalMoodCleanup = function () {
      if (pointerLoop) pointerLoop.destroy();
      if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
      ambient.remove();
      document.body.classList.remove("portfolio-polished");
      document.body.classList.remove("portfolio-page-hidden");
      globalMoodElement = null;
      globalMoodPointerEnabled = false;
      globalMoodCleanup = null;
    };
  }

  function polishPage() {
    document.body.classList.add("portfolio-polished");
    var main = document.querySelector("main");
    if (!main || isHomePage()) return;

    var title = main.querySelector("h1");
    if (!title) return;
    title.classList.add("portfolio-page-title");
    var intro = title.closest("header, section");
    if (intro) intro.classList.add("portfolio-page-intro");
  }

  function markLegacyGlow(hero) {
    var legacyGlow = Array.prototype.find.call(hero.children, function (child) {
      return child.classList && child.classList.contains("absolute") && child.className.indexOf("blur-") !== -1;
    });
    if (legacyGlow) legacyGlow.setAttribute("data-portfolio-legacy-glow", "");
    return legacyGlow;
  }

  function mountGrainient(hero) {
    var legacyGlow = markLegacyGlow(hero);

    function activateFallback(canvas) {
      if (canvas) canvas.remove();
      hero.classList.add("portfolio-grainient-fallback");
    }

    function cleanupFallback() {
      hero.classList.remove("portfolio-grainient-fallback");
      if (legacyGlow) legacyGlow.removeAttribute("data-portfolio-legacy-glow");
    }

    if (!policy.canUseHeroWebGL()) {
      activateFallback();
      return cleanupFallback;
    }

    var canvas = document.createElement("canvas");
    canvas.className = "portfolio-grainient";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);

    var gl = null;
    try {
      gl =
        canvas.getContext("webgl", {
          alpha: true,
          antialias: false,
          depth: false,
          powerPreference: "low-power",
          preserveDrawingBuffer: false
        }) ||
        canvas.getContext("experimental-webgl", {
          alpha: true,
          antialias: false,
          depth: false,
          powerPreference: "low-power",
          preserveDrawingBuffer: false
        });
    } catch (error) {
      console.warn("Interactive hero WebGL unavailable:", error);
    }

    if (!gl) {
      activateFallback(canvas);
      return cleanupFallback;
    }

    var vertex = [
      "attribute vec2 aPosition;",
      "varying vec2 vUv;",
      "void main(){",
      "  vUv = aPosition * 0.5 + 0.5;",
      "  gl_Position = vec4(aPosition, 0.0, 1.0);",
      "}"
    ].join("\n");

    var fragment = [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform vec2 uResolution;",
      "uniform vec2 uPointer;",
      "uniform float uTime;",
      "uniform float uMotion;",
      "float hash(vec2 p){",
      "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);",
      "}",
      "float noise(vec2 p){",
      "  vec2 i = floor(p);",
      "  vec2 f = fract(p);",
      "  f = f * f * (3.0 - 2.0 * f);",
      "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),",
      "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);",
      "}",
      "float fbm(vec2 p){",
      "  float value = 0.0;",
      "  float amplitude = 0.5;",
      "  for(int i = 0; i < 4; i++){",
      "    value += amplitude * noise(p);",
      "    p = p * 2.03 + 17.17;",
      "    amplitude *= 0.5;",
      "  }",
      "  return value;",
      "}",
      "void main(){",
      "  vec2 uv = vUv;",
      "  float aspect = uResolution.x / max(uResolution.y, 1.0);",
      "  vec2 centered = uv - 0.5;",
      "  centered.x *= aspect;",
      "  float t = uTime * 0.075 * uMotion;",
      "  vec2 warp = vec2(",
      "    fbm(centered * 2.15 + vec2(t, -t * 0.8)),",
      "    fbm(centered * 2.45 + vec2(-t * 0.65, t))",
      "  ) - 0.5;",
      "  vec2 fieldUv = centered + warp * 0.34;",
      "  float field = fbm(fieldUv * 2.15 + vec2(t * 0.8, -t));",
      "  float ribbon = smoothstep(-0.12, 0.7, field + fieldUv.y * 0.2);",
      "  vec3 dark = vec3(0.018, 0.031, 0.065);",
      "  vec3 blue = vec3(0.035, 0.52, 0.82);",
      "  vec3 cyan = vec3(0.22, 0.75, 0.97);",
      "  vec3 green = vec3(0.13, 0.66, 0.38);",
      "  vec3 color = mix(dark, blue, ribbon * 0.72);",
      "  color = mix(color, cyan, smoothstep(0.55, 0.92, field) * 0.34);",
      "  vec2 pointer = uPointer - 0.5;",
      "  pointer.x *= aspect;",
      "  float pointerGlow = exp(-3.6 * dot(centered - pointer, centered - pointer));",
      "  color += mix(blue, green, 0.28) * pointerGlow * 0.3;",
      "  float edge = 1.0 - smoothstep(0.48, 0.95, length(centered));",
      "  color *= 0.5 + edge * 0.62;",
      "  float grain = hash(gl_FragCoord.xy + uTime) - 0.5;",
      "  color += grain * 0.025;",
      "  gl_FragColor = vec4(color, 0.9);",
      "}"
    ].join("\n");

    var program;
    try {
      program = createProgram(gl, vertex, fragment);
    } catch (error) {
      console.warn("Interactive hero shader unavailable:", error);
      activateFallback(canvas);
      return cleanupFallback;
    }

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    var position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    var resolutionLocation = gl.getUniformLocation(program, "uResolution");
    var pointerLocation = gl.getUniformLocation(program, "uPointer");
    var timeLocation = gl.getUniformLocation(program, "uTime");
    var motionLocation = gl.getUniformLocation(program, "uMotion");
    var pointer = { x: 0.5, y: 0.46 };
    var pointerTarget = { x: 0.5, y: 0.46 };
    var heroRect = { left: 0, top: 0, width: 1, height: 1 };
    var visible = true;
    var lastFrame = 0;
    var start = performance.now();
    var loop = null;

    function resize() {
      var rect = hero.getBoundingClientRect();
      heroRect = rect;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      var width = Math.max(1, Math.round(rect.width * dpr));
      var height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function onPointerMove(event) {
      if (!policy.canUseHeroPointer() || !heroRect.width || !heroRect.height) return;
      pointerTarget.x = Math.max(0, Math.min(1, (event.clientX - heroRect.left) / heroRect.width));
      pointerTarget.y = Math.max(0, Math.min(1, 1 - (event.clientY - heroRect.top) / heroRect.height));
    }

    function render(now) {
      if (now - lastFrame < 33) return;
      lastFrame = now;
      resize();
      pointer.x += (pointerTarget.x - pointer.x) * 0.045;
      pointer.y += (pointerTarget.y - pointer.y) * 0.045;
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(timeLocation, (now - start) / 1000);
      gl.uniform1f(motionLocation, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function onContextLost(event) {
      event.preventDefault();
      console.warn("Interactive hero WebGL context lost; using static fallback.");
      if (loop) loop.stop();
      activateFallback(canvas);
    }

    var resizeObserver = null;
    if (typeof window.ResizeObserver === "function") {
      resizeObserver = new window.ResizeObserver(resize);
      resizeObserver.observe(hero);
    }
    var intersectionObserver = null;
    if (typeof window.IntersectionObserver === "function") {
      intersectionObserver = new window.IntersectionObserver(function (entries) {
        visible = Boolean(entries[0] && entries[0].isIntersecting);
        if (loop) loop.setVisible(visible);
      });
      intersectionObserver.observe(hero);
    }

    canvas.addEventListener("webglcontextlost", onContextLost, { passive: false });
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    resize();
    loop = createAnimationLoop(policy, render);
    loop.start();

    return function () {
      if (loop) loop.destroy();
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      hero.removeEventListener("pointermove", onPointerMove);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      canvas.remove();
      cleanupFallback();
    };
  }

  function teardownActive() {
    if (activeCleanup) activeCleanup();
    activeCleanup = null;
    activeHero = null;
  }

  function mount() {
    if (!document.body) return;
    document.body.classList.toggle("portfolio-page-hidden", !policy.read().pageVisible);
    mountGlobalMood();
    polishPage();

    var hero = isHomePage() ? document.querySelector("main > div > section:first-child") : null;
    if (activeCleanup && activeHero === hero && hero && hero.isConnected) return;
    teardownActive();
    if (!hero || !hero.querySelector("h1")) return;

    activeHero = hero;
    hero.classList.add("portfolio-hero-effect");
    var cleanupGrainient = mountGrainient(hero);
    activeCleanup = function () {
      cleanupGrainient();
      hero.classList.remove("portfolio-hero-effect");
      var legacyGlow = hero.querySelector("[data-portfolio-legacy-glow]");
      if (legacyGlow) legacyGlow.removeAttribute("data-portfolio-legacy-glow");
      activeHero = null;
    };
  }

  function cancelScheduledMount() {
    if (!scheduled) return;
    if (typeof window.cancelIdleCallback === "function" && idleHandle) {
      window.cancelIdleCallback(idleHandle);
    } else if (idleHandle) {
      window.clearTimeout(idleHandle);
    }
    scheduled = false;
    idleHandle = 0;
  }

  function scheduleMount() {
    if (scheduled) return;
    scheduled = true;
    var run = function () {
      scheduled = false;
      idleHandle = 0;
      mount();
    };
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      idleHandle = window.setTimeout(run, 0);
    }
  }

  function onPolicyChange(next, previous) {
    if (document.body) document.body.classList.toggle("portfolio-page-hidden", !next.pageVisible);
    var capabilityChanged =
      !previous ||
      next.reducedMotion !== previous.reducedMotion ||
      next.desktop !== previous.desktop ||
      next.finePointer !== previous.finePointer ||
      next.hover !== previous.hover ||
      next.webglAvailable !== previous.webglAvailable;
    if (capabilityChanged) teardownActive();
    scheduleMount();
  }

  function teardownRuntime() {
    cancelScheduledMount();
    teardownActive();
    if (globalMoodCleanup) globalMoodCleanup();
  }

  function restoreRuntime() {
    if (!policyCleanup) policyCleanup = policy.subscribe(onPolicyChange);
    scheduleMount();
  }

  function initialize() {
    if (policyCleanup) return;
    policyCleanup = policy.subscribe(onPolicyChange);
    window.addEventListener("pagehide", teardownRuntime, { passive: true });
    window.addEventListener("pageshow", restoreRuntime, { passive: true });
    scheduleMount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
