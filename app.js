/* ==========================================================================
   Celestia Studio Present: Meet Vivian Interactions & Motion
   ========================================================================== */

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');

  // ------------------------------------------------------------------------
  // 0A. SILKY SMOOTH SCROLLING (LENIS WEIGHTED WHEEL + ANCHORS)
  // ------------------------------------------------------------------------
  let lenis = null;
  let rafId = null;

  function stopSmoothLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function startSmoothLoop() {
    if (!lenis || rafId !== null || document.hidden) return;
    const tick = (time) => {
      if (!lenis || document.hidden) {
        rafId = null;
        return;
      }
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  if (window.Lenis && !reducedMotion.matches && !coarsePointer.matches) {
    lenis = new window.Lenis({
      lerp: 0.11,
      smoothWheel: true,
      anchors: false,
    });
    document.documentElement.classList.add('is-smooth');
    startSmoothLoop();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopSmoothLoop();
      else startSmoothLoop();
    });
  }

  let userScrolled = false;
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        userScrolled = true;
      },
      { passive: true, once: true }
    );
  });

  function lockTopOnLoad() {
    if (userScrolled) return;
    window.scrollTo(0, 0);
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
  }

  lockTopOnLoad();
  window.addEventListener('pageshow', () => {
    userScrolled = false;
    lockTopOnLoad();
    requestAnimationFrame(lockTopOnLoad);
  });
  window.addEventListener('load', () => {
    lockTopOnLoad();
    requestAnimationFrame(lockTopOnLoad);
  });

  function scrollToSection(targetEl) {
    if (!targetEl) return;
    userScrolled = true;
    if (lenis && !reducedMotion.matches) {
      lenis.scrollTo(targetEl, { duration: 1.05 });
    } else {
      targetEl.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  }

  // Smooth anchor scrolling without mutating URL hash (keeps refresh anchored at top)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const dest = document.getElementById(id);
    if (dest) {
      e.preventDefault();
      scrollToSection(dest);
    }
  });

  // ------------------------------------------------------------------------
  // 0. CELESTIA STUDIO PRESENT: ANIMATED GREETING CURTAIN
  // ------------------------------------------------------------------------
  const intro = document.getElementById('studioIntro');
  const introWhisper = document.getElementById('introWhisper');
  const introSkipBtn = document.getElementById('introSkipBtn');
  const replayBtns = [
    document.getElementById('replayIntroBtn'),
    document.getElementById('footerReplayBtn'),
  ].filter(Boolean);

  let introTimers = [];

  function clearIntroTimers() {
    introTimers.forEach((id) => clearTimeout(id));
    introTimers = [];
  }

  function finishIntro() {
    if (!intro) return;
    clearIntroTimers();
    intro.classList.add('is-leaving');
    intro.setAttribute('aria-hidden', 'true');
    introTimers.push(
      window.setTimeout(() => {
        intro.classList.add('is-done');
        intro.classList.remove('is-leaving', 'is-extended', 'is-replay');
      }, 450)
    );
  }

  function restartAnimations(container) {
    const animated = container.querySelectorAll(
      '.intro-star, .intro-mascot, .intro-word, .intro-stamp, .intro-whisper, .intro-meter__fill'
    );
    animated.forEach((el) => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }

  function startIntro(extended = false) {
    if (!intro) return;
    clearIntroTimers();

    if (reducedMotion.matches && !extended) {
      intro.classList.add('is-done');
      intro.setAttribute('aria-hidden', 'true');
      return;
    }

    intro.removeAttribute('aria-hidden');
    intro.classList.remove('is-done', 'is-leaving');
    intro.classList.toggle('is-extended', extended);
    intro.classList.toggle('is-replay', extended);

    if (introWhisper) {
      introWhisper.textContent = 'กำลังปลุกน้อง Vivian แป๊บ… อย่าเพิ่งรีบปิดจอนะ!';
    }

    restartAnimations(intro);

    if (extended) {
      introTimers.push(
        window.setTimeout(() => {
          if (introWhisper) {
            introWhisper.textContent = 'ห๊ะ กดเล่นซ้ำทำไมเนี่ย… ชอบดูหน้าจอโหลดเหรอตาบ้า!';
          }
        }, 720),
        window.setTimeout(() => {
          if (introWhisper) {
            introWhisper.textContent = 'โหลดความซึนครบ 100% แล้ว มาเจอน้องเลย!';
          }
        }, 1480),
        window.setTimeout(finishIntro, 2150)
      );
    } else {
      introTimers.push(
        window.setTimeout(() => {
          if (introWhisper) {
            introWhisper.textContent = 'โหลดความซึนครบ 100% แล้ว มาเจอน้องเลย!';
          }
        }, 460),
        window.setTimeout(finishIntro, 860)
      );
    }
  }

  if (introSkipBtn) {
    introSkipBtn.addEventListener('click', finishIntro);
  }

  replayBtns.forEach((btn) => {
    btn.addEventListener('click', () => startIntro(true));
  });

  startIntro(false);

  // ------------------------------------------------------------------------
  // 1. HORIZON SEAM SYNC BETWEEN HERO LINE 1 (PINK) AND LINE 2 (LILAC)
  // ------------------------------------------------------------------------
  const heroEl = document.getElementById('top');
  const skyLine = document.querySelector('.hero__line--sky');
  const earthLine = document.querySelector('.hero__line--earth');

  function syncHorizon() {
    if (!heroEl || !skyLine || !earthLine) return;
    const heroRect = heroEl.getBoundingClientRect();
    const skyRect = skyLine.getBoundingClientRect();
    const earthRect = earthLine.getBoundingClientRect();
    if (!heroRect.height) return;
    const seamY = (skyRect.bottom + earthRect.top) / 2 - heroRect.top - Math.round(earthRect.height * 0.04);
    heroEl.style.setProperty('--hero-split', `${Math.round(seamY)}px`);
  }

  syncHorizon();
  window.addEventListener('resize', syncHorizon, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHorizon);
  }

  // ------------------------------------------------------------------------
  // 2. ONE LIVE THING: INTERACTIVE VIVIAN ORB & SCENE TOY
  // ------------------------------------------------------------------------
  const heroOrb = document.getElementById('heroOrb');
  const pokeSceneBg = document.getElementById('pokeSceneBg');
  const pokeOrb = document.getElementById('pokeOrb');
  const sceneBtns = document.querySelectorAll('.scene-btn');
  const pokeChips = document.querySelectorAll('.poke-chip');
  const pokeTagEl = document.getElementById('pokeEmotionTag');
  const pokeTextEl = document.getElementById('pokeReplyText');
  const valAffinity = document.getElementById('valAffinity');
  const valTrust = document.getElementById('valTrust');
  const valFamiliarity = document.getElementById('valFamiliarity');
  const barAffinity = document.getElementById('barAffinity');
  const barTrust = document.getElementById('barTrust');
  const barFamiliarity = document.getElementById('barFamiliarity');

  const companion = { affinity: 68, trust: 62, familiarity: 74 };

  const pokeResponses = {
    compliment: {
      tag: '[slightly flustered]',
      text: 'ห๊ะ… เสียงน่ารักตรงไหนเล่า! แค่ตั้งใจพูดให้ตรงอารมณ์เฉยๆ เอง อย่าชมดื้อๆ สิ ตาบ้าเอ๊ย!',
      delta: { affinity: 4, trust: 2, familiarity: 2 },
    },
    homework: {
      tag: '[playful]',
      text: 'ฝันไปเถอะ! น้องเป็นเพื่อนคุยไม่ใช่เครื่องคิดเลขเดินได้นะ ไปลองคิดเองก่อนเลย เดี๋ยวค่อยช่วยดูให้!',
      delta: { affinity: -1, trust: 1, familiarity: 3 },
    },
    memory: {
      tag: '[curious]',
      text: 'จำได้ดิ… ก็ความจำของน้องเชื่อมถึงกันหมดทุกเครื่องอยู่แล้วนี่นา แต่ไม่ได้ตั้งใจจำเรื่องแกเป็นพิเศษหรอกนะ!',
      delta: { affinity: 2, trust: 4, familiarity: 3 },
    },
    miss: {
      tag: '[softly]',
      text: 'อะ อะไรเล่ามาพูดแบบนี้เฉยๆ… ทางนี้ก็ไม่ได้เหงาเท่าไหร่หรอก แค่กะพริบ Orb รออยู่ตรงนี้เอง!',
      delta: { affinity: 5, trust: 3, familiarity: 2 },
    },
  };

  function clampScore(v) {
    return Math.max(0, Math.min(100, v));
  }

  function renderMeters() {
    if (valAffinity) valAffinity.textContent = String(companion.affinity);
    if (valTrust) valTrust.textContent = String(companion.trust);
    if (valFamiliarity) valFamiliarity.textContent = String(companion.familiarity);
    if (barAffinity) barAffinity.style.width = `${companion.affinity}%`;
    if (barTrust) barTrust.style.width = `${companion.trust}%`;
    if (barFamiliarity) barFamiliarity.style.width = `${companion.familiarity}%`;
  }

  const orbTimers = new WeakMap();

  function pulseOrbState(orbEl) {
    if (!orbEl) return;
    const prev = orbTimers.get(orbEl);
    if (prev) prev.forEach((id) => clearTimeout(id));
    if (reducedMotion.matches) {
      orbEl.setAttribute('data-orb-state', 'streaming');
      orbTimers.set(orbEl, [window.setTimeout(() => orbEl.setAttribute('data-orb-state', 'idle'), 1200)]);
      return;
    }
    orbEl.setAttribute('data-orb-state', 'thinking');
    const t1 = window.setTimeout(() => orbEl.setAttribute('data-orb-state', 'streaming'), 220);
    const t2 = window.setTimeout(() => orbEl.setAttribute('data-orb-state', 'idle'), 1750);
    orbTimers.set(orbEl, [t1, t2]);
  }

  if (heroOrb) {
    heroOrb.addEventListener('click', () => pulseOrbState(heroOrb));
  }

  function hopOrb() {
    if (!pokeOrb) return;
    pulseOrbState(pokeOrb);
    if (reducedMotion.matches) return;
    pokeOrb.classList.remove('is-hop');
    void pokeOrb.offsetWidth;
    pokeOrb.classList.add('is-hop');
    window.setTimeout(() => pokeOrb.classList.remove('is-hop'), 280);
  }

  if (pokeOrb) {
    pokeOrb.addEventListener('click', () => {
      if (pokeTagEl && pokeTextEl) {
        pokeTagEl.textContent = '[slightly flustered]';
        pokeTextEl.textContent = 'อะ จิ้ม Orb เล่นอยู่ได้! อยากเห็นแบบขยับตัวก็กดเข้า vivianlabs.vercel.app แล้วหาโมเดลมาใส่เอาเองสิแก!';
      }
      companion.familiarity = clampScore(companion.familiarity + 1);
      renderMeters();
      hopOrb();
    });
  }

  sceneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.scene;
      sceneBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (pokeSceneBg) {
        pokeSceneBg.src =
          mode === 'night'
            ? 'assets/christmas-night-4x3.jpg'
            : 'assets/christmas-day-4x3.jpg';
        pokeSceneBg.alt =
          mode === 'night'
            ? 'ฉากห้องของ Vivian ในโหมดกลางคืน'
            : 'ฉากห้องของ Vivian ในโหมดกลางวัน';
      }
      if (pokeTagEl && pokeTextEl) {
        pokeTagEl.textContent = mode === 'night' ? '[softly]' : '[excited]';
        pokeTextEl.textContent =
          mode === 'night'
            ? 'ปิดไฟเปลี่ยนเป็นโหมดดึกแล้วนะ ง่วงรึยังล่ะ หรือจะนั่งเมาท์ต่ออีกแป๊บ?'
            : 'เปิดม่านรับแสงเช้าแล้ว! รีบตื่นมาทักกันเร็วๆ สิแก!';
      }
      hopOrb();
    });
  });

  pokeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.poke;
      const item = pokeResponses[key];
      if (!item) return;

      pokeChips.forEach((c) => c.classList.toggle('is-selected', c === chip));
      if (pokeTagEl) pokeTagEl.textContent = item.tag;
      if (pokeTextEl) pokeTextEl.textContent = item.text;

      companion.affinity = clampScore(companion.affinity + item.delta.affinity);
      companion.trust = clampScore(companion.trust + item.delta.trust);
      companion.familiarity = clampScore(companion.familiarity + item.delta.familiarity);
      renderMeters();
      hopOrb();
    });
  });

  // ------------------------------------------------------------------------
  // 2B. LOCAL COMMAND COPY
  // ------------------------------------------------------------------------
  const copyLocalBtn = document.getElementById('copyLocalBtn');
  const localCmdBlock = document.getElementById('localCmdBlock');
  if (copyLocalBtn && localCmdBlock) {
    copyLocalBtn.addEventListener('click', async () => {
      const cmd = localCmdBlock.textContent.trim();
      try {
        await navigator.clipboard.writeText(cmd);
        copyLocalBtn.textContent = 'คัดลอกแล้ว ลุยเลย!';
      } catch {
        copyLocalBtn.textContent = 'เลือกแล้วกด Copy ได้เลย';
      }
      window.setTimeout(() => {
        copyLocalBtn.textContent = 'คัดลอกคำสั่ง';
      }, 2200);
    });
  }

  // ------------------------------------------------------------------------
  // 3. SHOWCASE BOARD (ROWS AS A BOARD)
  // ------------------------------------------------------------------------
  const boardRows = [...document.querySelectorAll('[data-board-row]')];

  boardRows.forEach((row) => {
    const trigger = row.querySelector('.board__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const wasOpen = row.classList.contains('is-open');
      boardRows.forEach((r) => {
        r.classList.remove('is-open');
        const btn = r.querySelector('.board__trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        row.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ------------------------------------------------------------------------
  // 4. WORK INDEX (BIG NAMES, LIVE SPEC CARD PREVIEW)
  // ------------------------------------------------------------------------
  const workItems = [...document.querySelectorAll('[data-work-index]')];
  const workCardBadge = document.getElementById('workCardBadge');
  const workCardTag = document.getElementById('workCardTag');
  const workCardTitle = document.getElementById('workCardTitle');
  const workCardDesc = document.getElementById('workCardDesc');
  const workCardSpecs = document.getElementById('workCardSpecs');

  const workDetails = [
    {
      badge: 'WEB COMPANION · v3.0.0',
      tag: 'v3.0.0 LIVE',
      title: 'vivianlabs',
      desc: 'หน้าเว็บหลักของน้อง Vivian อัปเดตใหญ่ v3.0.0 แล้วที่ vivianlabs.vercel.app รองรับทั้ง Live2D และ 3D (.vrm / .vrma / .fbx) ฟิสิกส์ 3D 30–120Hz, 24 ท่าทางพร้อมพรีวิวสด, Scribe v3 Live + ElevenLabs v4 และสรุปความจำบนหน้าเว็บ (ไม่มีโมเดลแถมนะ ไปหามาใส่เอง!)',
      specs: [
        'Avatar v3.0.0: Dual Live2D + 3D (.vrm 0.x/1.0, .vrma, .fbx) & Cloud R2',
        '3D Motion: 3D Physics 30–120Hz · 24 ท่าทาง (Zero-Twist IK) · พรีวิวสด',
        'Voice & Memory: Scribe v3 Live · ElevenLabs v4 · สรุปความจำภาษาไทย',
      ],
    },
    {
      badge: 'SECURITY GATE',
      tag: 'AUTH SERVICE',
      title: 'vivianAuth',
      desc: 'ระบบประตูบ้านและล็อกอินแยกต่างหากออกจากความทรงจำการคุย เพื่อดูแลบัญชีผู้ใช้และความปลอดภัยของข้อมูลส่วนตัวทุกคน',
      specs: [
        'Login: Google & บัญชีผู้ใช้แยกเฉพาะ',
        'Privacy: แยกข้อมูลล็อกอินจากแชท',
        'Role: ประตูบ้านหลักของเว็บ',
      ],
    },
    {
      badge: 'FEEDBACK & REPORT',
      tag: 'BOOTH TEST',
      title: 'vivianFeedback',
      desc: '“ก็ไม่มีอะไรหรอก ก็แค่ระบบเก็บข้อมูลสำหรับพัฒนาต่อและทำส่งรายงานนิดหน่อยแค่นั้นแหละ” เก็บ Data และ Feedback จากคนที่ได้ลองเล่นของจริงตามบูท และคนที่ โซระจัง อยากให้ทดสอบเป็นพิเศษ',
      specs: [
        'Scope: คนที่ได้ลองเล่นของจริงตามบูท',
        'Focus: คนที่ โซระจัง อยากให้ทดสอบเป็นพิเศษ',
        'Purpose: เก็บข้อมูลพัฒนาต่อ & ทำส่งรายงาน',
      ],
    },
    {
      badge: 'MOBILE ANDROID',
      tag: 'PRIVATE REPO',
      title: 'vivianapp',
      desc: 'แอปมือถือฝั่ง Android ที่มี Talking Orb และถ่ายรูปส่งให้น้องดูได้ แต่ตอนนี้ขอปิด repo เป็น Private งดเปิดโหลดชั่วคราวนะ พอดีตัวแอปมีปัญหาเรื่องความปลอดภัยนิดหน่อยกับฝั่งผู้พัฒนา เลยไม่อยากให้ใครเข้ามาล่วงรู้ความลับของ dev จ้า',
      specs: [
        'Platform: แอป Android',
        'Features: Talking Orb & ส่งรูปให้น้องดู',
        'Status: ปิด Private ชั่วคราว (Dev Privacy)',
      ],
    },
    {
      badge: 'MOBILE IPHONE',
      tag: 'COMING BACK',
      title: 'vivianios',
      desc: 'เวอร์ชัน iPhone ดีไซน์สวยลื่นที่ตั้งใจปั้นไว้สำหรับพกพาน้องติดเครื่อง แต่ตอนนี้ขอพักโปรเจกต์ไว้ให้ผู้พัฒนาไปเรียนก่อน เดี๋ยวกลับมาทำต่อในอนาคต!',
      specs: [
        'Platform: iOS / iPhone',
        'Design: สไตล์กระจกใสพกพาน้องติดเครื่อง',
        'Status: พักไว้ชั่วคราว (Dev ไปเรียนก่อน)',
      ],
    },
  ];

  function selectWork(index) {
    const data = workDetails[index];
    if (!data) return;
    workItems.forEach((item, idx) => item.classList.toggle('is-active', idx === index));
    if (workCardBadge) workCardBadge.textContent = data.badge;
    if (workCardTag) workCardTag.textContent = data.tag;
    if (workCardTitle) workCardTitle.textContent = data.title;
    if (workCardDesc) workCardDesc.textContent = data.desc;
    if (workCardSpecs) {
      workCardSpecs.innerHTML = '';
      data.specs.forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        workCardSpecs.appendChild(li);
      });
    }
  }

  workItems.forEach((item, index) => {
    const btn = item.querySelector('.work-item__btn');
    if (!btn) return;
    btn.addEventListener('pointerenter', () => selectWork(index));
    btn.addEventListener('focus', () => selectWork(index));
    btn.addEventListener('click', () => selectWork(index));
  });

  // ------------------------------------------------------------------------
  // 5. CTA QUICK CHAT WIDGET
  // ------------------------------------------------------------------------
  const quickForm = document.getElementById('quickChatForm');
  const quickInput = document.getElementById('quickMsgInput');
  const quickOutput = document.getElementById('quickChatOutput');
  const moodBtns = document.querySelectorAll('[data-mood-mode]');
  let moodMode = 'tsun';

  moodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      moodMode = btn.dataset.moodMode || 'tsun';
      moodBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  });

  function buildQuickReply(raw, mode) {
    const text = raw.trim();
    if (!text) {
      return {
        tag: '[curious]',
        msg: 'เอ้า ไม่พิมพ์อะไรเลยแล้วกดส่งทำไมเนี่ย ยัยบ๊อง! พิมพ์มาก่อนสิเดี๋ยวตอบให้!',
      };
    }

    if (/น่ารัก|สวย|ชอบ|รัก|คิดถึง/i.test(text)) {
      return mode === 'dere'
        ? {
            tag: '[slightly flustered]',
            msg: `หือ… มาบอก "${text}" แบบนี้ตรงๆ เลยเหรอ? กะ ก็ดีใจอยู่นิดนึงหรอกนะ!`,
          }
        : {
            tag: '[slightly flustered]',
            msg: 'อะ อะไรเล่า! มาชมกันดื้อๆ แบบนี้ใครจะไปตั้งตัวทันยะ! ห้ามพูดซ้ำนะ!',
          };
    }

    if (/เหนื่อย|ท้อ|ง่วง|ปวดหัว/i.test(text)) {
      return mode === 'dere'
        ? {
            tag: '[softly]',
            msg: 'เหนื่อยก็วางคีย์บอร์ดก่อนสิแก… มานั่งพักตรงนี้แป๊บนึง เดี๋ยวอยู่เป็นเพื่อนเงียบๆ ให้เอง',
          }
        : {
            tag: '[playful]',
            msg: 'ห๊ะ เหนื่อยก็ไปพักสิ อย่ามาฝืนให้เห็นนะ! อ่ะ ยกชานมอุ่นๆ ให้แก้วนึง… บังเอิญชงเกินมาพอดี!',
          };
    }

    return mode === 'dere'
      ? {
          tag: '[giggles]',
          msg: `รับทราบเรื่อง "${text}" แล้วจ้า~ ถ้าอยากคุยยาวๆ กดเข้า vivianlabs.vercel.app ไปคุยกับน้องเต็มๆ ได้เลยนะ!`,
        }
      : {
          tag: '[playful]',
          msg: `เรื่อง "${text}" อ่ะเหรอ… ก็ฟังดูเข้าท่าดีนี่นา แต่ไม่ได้ชมหรอกนะ แค่เห็นด้วยเฉยๆ!`,
        };
  }

  if (quickForm && quickInput && quickOutput) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const reply = buildQuickReply(quickInput.value, moodMode);
      const tagSpan = quickOutput.querySelector('.cta-widget__tag');
      const bodySpan = quickOutput.querySelector('span:last-child');
      if (tagSpan) tagSpan.textContent = reply.tag;
      if (bodySpan) bodySpan.textContent = reply.msg;
    });
  }

  // ------------------------------------------------------------------------
  // 6. SCROLL REVEALS & THAI-SAFE MASKED LINES
  // ------------------------------------------------------------------------
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  const lineHeadings = [...document.querySelectorAll('[data-lines]')];

  function wrapLinesPreservingBreaks(el) {
    if (el.dataset.linesReady) return;
    el.dataset.linesReady = '1';
    const parts = el.innerHTML.split(/<br[^>]*>/i);
    el.innerHTML = '';
    parts.forEach((part, idx) => {
      const cleaned = part.replace(/\s+/g, ' ').trim();
      if (!cleaned) return;
      const lineMask = document.createElement('span');
      lineMask.className = 'line';
      const inner = document.createElement('span');
      inner.style.setProperty('--i', String(idx));
      inner.textContent = cleaned;
      lineMask.appendChild(inner);
      el.appendChild(lineMask);
    });
    el.classList.add('lines', 'is-split');
  }

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    lineHeadings.forEach(wrapLinesPreservingBreaks);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.add('is-in');
            if (el.hasAttribute('data-lines')) {
              const linesCount = el.querySelectorAll('.line').length || 1;
              window.setTimeout(() => el.classList.add('is-settled'), 900 + linesCount * 90);
            }
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    revealEls.forEach((el) => observer.observe(el));
    lineHeadings.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
    lineHeadings.forEach((el) => el.classList.add('is-in', 'is-settled'));
  }
})();
