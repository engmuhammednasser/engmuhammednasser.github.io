(function () {
  "use strict";

  if (window.__portfolioInteractiveBackgroundLoaded) return;
  window.__portfolioInteractiveBackgroundLoaded = true;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktopPointer = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
  var activeCleanup = null;
  var activeHero = null;
  var globalMoodCleanup = null;
  var globalMoodElement = null;
  var polishedMain = null;
  var polishedPath = "";
  var scheduled = false;

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
    if (globalMoodElement && globalMoodElement.isConnected) return;
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

    var pointerGlow = ambient.querySelector(".portfolio-pointer-glow");
    var target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.34 };
    var current = { x: target.x, y: target.y };
    var frame = 0;

    function onPointerMove(event) {
      if (!desktopPointer.matches || reducedMotion.matches) return;
      target.x = event.clientX;
      target.y = event.clientY;
      ambient.classList.add("portfolio-ambient-pointer-active");
      if (!frame) frame = requestAnimationFrame(animatePointer);
    }

    function animatePointer() {
      frame = 0;
      if (!desktopPointer.matches || reducedMotion.matches) return;
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;
      pointerGlow.style.transform =
        "translate3d(" + (current.x - 190) + "px," + (current.y - 190) + "px,0)";
      if (Math.abs(target.x - current.x) >= 0.1 || Math.abs(target.y - current.y) >= 0.1) {
        frame = requestAnimationFrame(animatePointer);
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    globalMoodCleanup = function () {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      ambient.remove();
      globalMoodElement = null;
      globalMoodCleanup = null;
    };
  }

  function polishPage() {
    document.body.classList.add("portfolio-polished");
    var main = document.querySelector("main");
    if (!main || (main === polishedMain && window.location.pathname === polishedPath)) return;
    polishedMain = main;
    polishedPath = window.location.pathname;

    if (!isHomePage()) {
      var title = main.querySelector("h1");
      if (title) {
        title.classList.add("portfolio-page-title");
        var intro = title.closest("header, section");
        if (intro) intro.classList.add("portfolio-page-intro");
      }
    }

    main.querySelectorAll("[class]").forEach(function (element) {
      var className = element.getAttribute("class") || "";
      var isRounded = /\brounded-(?:xl|2xl|3xl)\b/.test(className);
      var isBordered = /\bborder\b/.test(className);
      var isSurface =
        className.indexOf("bg-[#111827]") !== -1 ||
        className.indexOf("bg-[#0B1020]") !== -1 ||
        className.indexOf("bg-[#0D1526]") !== -1;
      if (isRounded && isBordered && isSurface) element.classList.add("portfolio-surface");
    });

    main.querySelectorAll("a[class], button[class]").forEach(function (element) {
      var className = element.getAttribute("class") || "";
      if (
        className.indexOf("bg-[#38BDF8]") !== -1 ||
        className.indexOf("bg-[#22C55E]") !== -1 ||
        (className.indexOf("rounded-xl") !== -1 && className.indexOf("font-bold") !== -1)
      ) {
        element.classList.add("portfolio-action");
      }
    });
  }

  function mountGrainient(hero) {
    var canvas = document.createElement("canvas");
    canvas.className = "portfolio-grainient";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);

    var legacyGlow = Array.prototype.find.call(hero.children, function (child) {
      return child !== canvas && child.classList.contains("absolute") && child.className.indexOf("blur-") !== -1;
    });
    if (legacyGlow) legacyGlow.setAttribute("data-portfolio-legacy-glow", "");

    var gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: "low-power"
      }) ||
      canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: "low-power"
      });

    if (!gl) {
      canvas.classList.add("portfolio-grainient-fallback");
      return function () {
        canvas.remove();
      };
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
      canvas.classList.add("portfolio-grainient-fallback");
      return function () {
        canvas.remove();
      };
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
    var visible = true;
    var frame = 0;
    var lastFrame = 0;
    var start = performance.now();
    var mobile = !desktopPointer.matches;

    function resize() {
      var rect = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25);
      var width = Math.max(1, Math.round(rect.width * dpr));
      var height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function onPointerMove(event) {
      if (mobile) return;
      var rect = hero.getBoundingClientRect();
      pointerTarget.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointerTarget.y = Math.max(0, Math.min(1, 1 - (event.clientY - rect.top) / rect.height));
    }

    function render(now) {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      var interval = mobile ? 50 : 33;
      if (now - lastFrame < interval) return;
      lastFrame = now;
      resize();
      pointer.x += (pointerTarget.x - pointer.x) * 0.045;
      pointer.y += (pointerTarget.y - pointer.y) * 0.045;
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(timeLocation, (now - start) / 1000);
      gl.uniform1f(motionLocation, reducedMotion.matches ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    var intersectionObserver = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    });
    intersectionObserver.observe(hero);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    resize();
    frame = requestAnimationFrame(render);

    return function () {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      canvas.remove();
    };
  }

  function mountSplashCursor() {
    if (!desktopPointer.matches || reducedMotion.matches) return function () {};

    var canvas = document.createElement("canvas");
    canvas.className = "portfolio-splash-cursor";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d", { alpha: true });
    var particles = [];
    var frame = 0;
    var previous = null;
    var lastMove = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(event) {
      var now = performance.now();
      if (now - lastMove < 12) return;
      lastMove = now;
      var dx = previous ? event.clientX - previous.x : 0;
      var dy = previous ? event.clientY - previous.y : 0;
      previous = { x: event.clientX, y: event.clientY };
      var speed = Math.min(28, Math.hypot(dx, dy));
      for (var index = 0; index < 3; index += 1) {
        var angle = Math.random() * Math.PI * 2;
        var spread = 3 + Math.random() * 10;
        particles.push({
          x: event.clientX + Math.cos(angle) * spread,
          y: event.clientY + Math.sin(angle) * spread,
          vx: dx * (0.025 + Math.random() * 0.02) + Math.cos(angle) * 0.22,
          vy: dy * (0.025 + Math.random() * 0.02) + Math.sin(angle) * 0.22,
          life: 1,
          decay: 0.018 + Math.random() * 0.015,
          radius: 9 + speed * 0.4 + Math.random() * 13,
          hue: Math.random() > 0.78 ? 145 : 195 + Math.random() * 12
        });
      }
      if (particles.length > 150) particles.splice(0, particles.length - 150);
    }

    function draw() {
      frame = requestAnimationFrame(draw);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (!particles.length || document.hidden) return;
      context.globalCompositeOperation = "lighter";
      for (var index = particles.length - 1; index >= 0; index -= 1) {
        var particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.life -= particle.decay;
        particle.radius *= 0.994;
        if (particle.life <= 0.02) {
          particles.splice(index, 1);
          continue;
        }
        var gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );
        gradient.addColorStop(0, "hsla(" + particle.hue + ", 92%, 64%, " + particle.life * 0.2 + ")");
        gradient.addColorStop(0.35, "hsla(" + particle.hue + ", 90%, 56%, " + particle.life * 0.11 + ")");
        gradient.addColorStop(1, "hsla(" + particle.hue + ", 90%, 46%, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalCompositeOperation = "source-over";
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", spawn, { passive: true });
    frame = requestAnimationFrame(draw);

    return function () {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", spawn);
      canvas.remove();
    };
  }

  function mount() {
    mountGlobalMood();
    polishPage();

    var hero = isHomePage() ? document.querySelector("main > div > section:first-child") : null;
    if (activeCleanup && activeHero === hero && hero && hero.isConnected) return;

    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
      activeHero = null;
    }
    if (!hero || !hero.querySelector("h1")) return;

    activeHero = hero;
    hero.classList.add("portfolio-hero-effect");
    var cleanupGrainient = mountGrainient(hero);
    var cleanupSplash = mountSplashCursor();

    activeCleanup = function () {
      cleanupGrainient();
      cleanupSplash();
      hero.classList.remove("portfolio-hero-effect");
      var legacyGlow = hero.querySelector("[data-portfolio-legacy-glow]");
      if (legacyGlow) legacyGlow.removeAttribute("data-portfolio-legacy-glow");
      activeHero = null;
    };
  }

  function scheduleMount() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      mount();
    });
  }

  var observer = new MutationObserver(scheduleMount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", scheduleMount);
  desktopPointer.addEventListener("change", function () {
    if (activeCleanup) activeCleanup();
    activeCleanup = null;
    activeHero = null;
    scheduleMount();
  });
  reducedMotion.addEventListener("change", function () {
    if (activeCleanup) activeCleanup();
    activeCleanup = null;
    activeHero = null;
    scheduleMount();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleMount, { once: true });
  } else {
    scheduleMount();
  }
})();
