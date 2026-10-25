/* ============================================================
   CLUD WEATHER — общий погодный фон
   Использование:  WeatherFX.set('snow')  |  WeatherFX.fromCode(73)
   Типы: sunny, cloudy, rain, snow, thunder
   ============================================================ */
(function () {
  'use strict';

  var root, sky, layers = {}, current = null, flashTimer = null, built = {};
  var small = window.innerWidth < 768;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function el(cls, parent) {
    var d = document.createElement('div');
    d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  function init() {
    if (root) return;
    sky = document.getElementById('sky');
    if (!sky) {
      sky = document.createElement('div');
      sky.id = 'sky';
      sky.className = 'sky';
      document.body.insertBefore(sky, document.body.firstChild);
    }
    // старые контейнеры частиц (если остались на странице) — не нужны
    var old = document.getElementById('particles');
    if (old) old.innerHTML = '';

    root = document.createElement('div');
    root.id = 'wfx';
    ['sun', 'clouds', 'rain', 'snow', 'flash'].forEach(function (n) {
      layers[n] = el('wfx-layer wfx-' + n, root);
    });
    sky.insertAdjacentElement('afterend', root);
  }

  /* ---- генераторы ---- */
  function buildSun() {
    var l = layers.sun;
    el('wfx-sunwash', l);
    var s = el('wfx-sun', l);
    el('wfx-sun-glow', s);
    el('wfx-sun-rays', s);
    el('wfx-sun-core', s);
  }

  function buildClouds() {
    var l = layers.clouds;
    for (var i = 0; i < 9; i++) {
      var c = el('wfx-cloud', l);
      var w = rnd(150, 340);
      c.style.width = w + 'px';
      c.style.height = (w * 0.34) + 'px';
      c.style.top = rnd(2, 42) + '%';
      c.style.animationDuration = rnd(60, 130) + 's';
      c.style.animationDelay = '-' + rnd(0, 120) + 's';
      c.style.opacity = rnd(0.55, 1);
    }
  }

  function buildRain() {
    var l = layers.rain, n = small ? 90 : 170;
    for (var i = 0; i < n; i++) {
      var d = el('wfx-drop', l);
      var far = Math.random() < 0.4;                 // два плана глубины
      d.style.left = rnd(0, 100) + '%';
      d.style.height = (far ? rnd(10, 18) : rnd(20, 36)) + 'px';
      d.style.opacity = far ? rnd(0.2, 0.4) : rnd(0.45, 0.85);
      d.style.animationDuration = (far ? rnd(0.9, 1.3) : rnd(0.5, 0.8)) + 's';
      d.style.animationDelay = '-' + rnd(0, 2) + 's';
    }
    el('wfx-mist', l);
  }

  function buildSnow() {
    var l = layers.snow, n = small ? 70 : 140;
    for (var i = 0; i < n; i++) {
      var f = el('wfx-flake', l);
      var size = rnd(3, 9);
      f.style.left = rnd(0, 100) + '%';
      f.style.width = size + 'px';
      f.style.height = size + 'px';
      f.style.opacity = size > 6 ? rnd(0.8, 1) : rnd(0.4, 0.8);
      f.style.animationDuration = rnd(7, 16) + 's';
      f.style.animationDelay = '-' + rnd(0, 16) + 's';
      var inner = document.createElement('i');
      inner.style.animationDuration = rnd(2, 5) + 's';
      inner.style.animationDelay = '-' + rnd(0, 4) + 's';
      f.appendChild(inner);
    }
    el('wfx-snowground', l);
  }

  function ensure(name) {
    if (built[name]) return;
    built[name] = true;
    if (name === 'sun') buildSun();
    else if (name === 'clouds') buildClouds();
    else if (name === 'rain') buildRain();
    else if (name === 'snow') buildSnow();
    else if (name === 'flash') el('wfx-flash', layers.flash);
  }

  /* ---- молния ---- */
  function scheduleFlash() {
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      var f = layers.flash.firstChild;
      if (f && current === 'thunder') {
        f.classList.remove('go');
        void f.offsetWidth;
        f.classList.add('go');
      }
      if (current === 'thunder') scheduleFlash();
    }, rnd(2500, 7000));
  }

  /* ---- публичный API ---- */
  function set(type) {
    init();
    if (['sunny', 'cloudy', 'rain', 'snow', 'thunder'].indexOf(type) < 0) type = 'cloudy';
    current = type;
    clearTimeout(flashTimer);

    sky.className = 'sky ' + type;
    root.setAttribute('data-type', type);

    var on = {
      sun:    type === 'sunny',
      clouds: true,
      rain:   type === 'rain' || type === 'thunder',
      snow:   type === 'snow',
      flash:  type === 'thunder'
    };
    Object.keys(on).forEach(function (k) {
      if (on[k]) ensure(k);
      layers[k].classList.toggle('on', on[k]);
    });
    if (type === 'thunder') scheduleFlash();
  }

  function typeFromCode(code) {
    code = Number(code);
    if (code === 0 || code === 1) return 'sunny';
    if (code >= 95) return 'thunder';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    return 'cloudy';
  }

  window.WeatherFX = {
    set: set,
    fromCode: function (code) { set(typeFromCode(code)); },
    typeFromCode: typeFromCode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { if (!current) set('cloudy'); });
  } else if (!current) {
    set('cloudy');
  }
})();

/* ---- Мобильная нижняя панель: делим «эмодзи + текст» на две строки ---- */
(function () {
  var short = { 'index.html': 'Главная', 'map.html': 'Карта', 'local.html': 'Я здесь', 'weekly.html': 'Неделя' };
  function build() {
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      if (a.querySelector('.ni')) return;
      var txt = a.textContent.trim();
      var m = txt.match(/^(\S+)\s+(.*)$/);
      if (!m) return;
      var href = (a.getAttribute('href') || '').split('/').pop();
      a.innerHTML = '<span class="ni">' + m[1] + '</span><span class="nl">' + m[2] + '</span><span class="ns">' + (short[href] || m[2]) + '</span>';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
