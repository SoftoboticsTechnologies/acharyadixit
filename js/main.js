/* Hero slider — fade transition, 4s autoplay, arrows, dots, keyboard,
   swipe, pause on hover/focus, explicit pause button, reduced-motion aware. */
(function () {
  'use strict';

  var root = document.querySelector('[data-slider]');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
  var prevBtn = root.querySelector('.slider-arrow--prev');
  var nextBtn = root.querySelector('.slider-arrow--next');
  var dotsWrap = root.querySelector('.slider-dots');
  var pauseBtn = root.querySelector('.slider-pause');
  var live = root.querySelector('.slider-live');

  var DELAY = 4000;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = 0;
  var timer = null;
  var hoverPaused = false;
  var userPaused = reduceMotion.matches;
  var dots = [];

  // Load the image for a slide (and its neighbour) on demand.
  function prime(i) {
    var img = slides[i] && slides[i].querySelector('img[data-src]');
    if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
  }

  slides.forEach(function (slide, i) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length);
    b.addEventListener('click', function () { go(i); restart(); });
    li.appendChild(b);
    dotsWrap.appendChild(li);
    dots.push(b);
  });

  function go(i) {
    var n = slides.length;
    i = (i + n) % n;
    prime(i);
    prime((i + 1) % n);
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].removeAttribute('aria-current');
    current = i;
    slides[current].classList.add('is-active');
    slides[current].removeAttribute('aria-hidden');
    dots[current].setAttribute('aria-current', 'true');
    if (live) live.textContent = 'Slide ' + (current + 1) + ' of ' + n;
  }

  function stop() { clearInterval(timer); timer = null; }
  function start() {
    stop();
    if (userPaused || hoverPaused || document.hidden) return;
    timer = setInterval(function () { go(current + 1); }, DELAY);
  }
  function restart() { start(); }

  function setUserPaused(v) {
    userPaused = v;
    pauseBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', v ? 'Play slideshow' : 'Pause slideshow');
    start();
  }

  prevBtn.addEventListener('click', function () { go(current - 1); restart(); });
  nextBtn.addEventListener('click', function () { go(current + 1); restart(); });
  pauseBtn.addEventListener('click', function () { setUserPaused(!userPaused); });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(current - 1); restart(); }
    else if (e.key === 'ArrowRight') { go(current + 1); restart(); }
  });

  root.addEventListener('mouseenter', function () { hoverPaused = true; stop(); });
  root.addEventListener('mouseleave', function () { hoverPaused = false; start(); });
  root.addEventListener('focusin', function () { hoverPaused = true; stop(); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) { hoverPaused = false; start(); }
  });
  document.addEventListener('visibilitychange', start);

  // Touch swipe
  var x0 = null;
  root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { go(dx < 0 ? current + 1 : current - 1); restart(); }
    x0 = null;
  });

  // Only autoplay while the slider is on screen (live site: playWhenVisible).
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.5 }).observe(root);
  }

  setUserPaused(userPaused);
  go(0);
  start();
})();

/* Header, mobile menu, scroll reveal, gallery lightbox, booking form. */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '919425725096';   // from the live site's Click-to-Chat settings

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('is-open', open);
    if (open) { mobileNav.removeAttribute('inert'); } else { mobileNav.setAttribute('inert', ''); }
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) { var first = mobileNav.querySelector('a'); if (first) first.focus(); }
  });
  mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 921) setMenu(false); });
  setMenu(false);

  /* ---------- Active nav link while scrolling ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a, .mobile-nav li a'));
  var sectionIds = ['top', 'about', 'gallery', 'contact'];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function markActive() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var activeId = 'top';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top + window.scrollY <= y) activeId = s.id; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) activeId = 'contact';
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + activeId;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  // Only the homepage uses in-page section links; other pages keep their static aria-current.
  if (!document.body.dataset.page) {   // homepage has no data-page
    window.addEventListener('scroll', markActive, { passive: true });
    markActive();
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Gallery lightbox ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery-item a'));
  var lb = document.getElementById('lightbox');
  if (links.length && lb) {
    var lbImg = lb.querySelector('.lightbox__img');
    var lbCount = lb.querySelector('.lightbox__count');
    var idx = 0;
    var lastFocus = null;

    function show(i) {
      idx = (i + links.length) % links.length;
      var a = links[idx];
      lbImg.src = a.getAttribute('href');
      lbImg.alt = a.querySelector('img').alt;
      lbCount.textContent = (idx + 1) + ' / ' + links.length;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    }
    function close() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, 300);
      if (lastFocus) lastFocus.focus();
    }

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') {   // keep focus inside the dialog
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) show(dx < 0 ? idx + 1 : idx - 1);
      tx = null;
    });
  }

  /* ---------- Booking / consultation forms ----------
     The live site's forms have no action or backend. Rather than fake a
     submission, a valid form opens WhatsApp chat with Acharya Ji's
     number (the same number the site's WhatsApp button uses), with the
     details pre-filled for the visitor to send. Any form marked
     data-booking-form gets this; a field is mandatory when the HTML
     marks it `required`. Error text lives in the element named by the
     field's aria-describedby. */
  var today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  var todayISO = today.toISOString().slice(0, 10);

  var REQUIRED_MSG = {
    name: 'Please enter your full name.',
    phone: 'Please enter your mobile number.',
    email: 'Please enter your email address.',
    city: 'Please enter your city.',
    service: 'Please select a pooja service.',
    date: 'Please choose a preferred date.',
    message: 'Please tell us about your requirement.'
  };
  var FORMAT = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
    phone: function (v) {
      var d = v.replace(/[\s\-()+]/g, '');
      return /^(91)?[6-9]\d{9}$/.test(d) || /^0[6-9]\d{9}$/.test(d) ? '' : 'Please enter a valid 10-digit mobile number.';
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
    date: function (v) { return v >= todayISO ? '' : 'Please choose today or a future date.'; }
  };
  var FIELDS = ['name', 'phone', 'email', 'city', 'service', 'date', 'message'];

  Array.prototype.forEach.call(document.querySelectorAll('form[data-booking-form]'), function (form) {
    var statusEl = form.querySelector('.form-status');
    var btn = form.querySelector('[type="submit"]');
    var fields = FIELDS.filter(function (n) { return form.elements[n]; });
    if (form.elements.date) form.elements.date.min = todayISO;

    function validate(name) {
      var el = form.elements[name];
      var v = el.value;
      var msg = '';
      if (!v.trim()) msg = el.required ? REQUIRED_MSG[name] : '';
      else if (FORMAT[name]) msg = FORMAT[name](v);
      var errId = el.getAttribute('aria-describedby');
      var err = errId && document.getElementById(errId);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    }
    fields.forEach(function (name) {
      var el = form.elements[name];
      el.addEventListener('blur', function () { if (el.value) validate(name); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validate(name); });
      el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') validate(name); });
    });

    function setStatus(kind, html) {
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
      statusEl.innerHTML = html;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      var firstBad = null;
      fields.forEach(function (name) {
        if (!validate(name) && !firstBad) firstBad = form.elements[name];
      });
      if (firstBad) {
        setStatus('error', 'Please correct the highlighted fields and try again.');
        firstBad.focus();
        return;
      }

      btn.disabled = true;
      btn.classList.add('is-loading');

      var f = form.elements;
      var val = function (n) { return f[n] ? f[n].value.trim() : ''; };
      var dateText = val('date') ? new Date(val('date') + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      var lines = [
        form.getAttribute('data-booking-form') === 'consultation'
          ? 'Namaste Acharya Ji, I would like to book a consultation.'
          : 'Namaste Acharya Ji, I would like to book a pooja.',
        '',
        'Name: ' + val('name'),
        'Mobile: ' + val('phone')
      ];
      if (val('email')) lines.push('Email: ' + val('email'));
      if (val('city')) lines.push('City: ' + val('city'));
      lines.push('Pooja: ' + val('service'));
      if (dateText) lines.push('Preferred date: ' + dateText);
      if (val('message')) lines.push('Requirement: ' + val('message'));

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');

      // window.open(..., 'noopener') returns null whether or not the tab opened,
      // so always give the visitor an explicit link as well.
      setTimeout(function () {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        setStatus('success', 'WhatsApp should now be open with your details — please press <strong>Send</strong> there to reach Acharya Ji. Didn’t open? <a href="' + url + '" target="_blank" rel="noopener">Open WhatsApp</a> or call <a href="tel:+919425725096">+91 9425725096</a>.');
        statusEl.focus();
      }, 600);
    });
  });
})();
