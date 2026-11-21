/* ==========================================================================
   Celestia Studio Present: Meet Vivian Interactions & Motion
   ========================================================================== */

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
      text: 'ห๊ะ… เสียงน่ารักตรงไหนเล่า! แค่ส่งป้าย Emotion ให้ ElevenLabs v4 ช่วยเฉยๆ เอง อย่าชมดื้อๆ สิ ตาบ้าเอ๊ย!',
      delta: { affinity: 4, trust: 2, familiarity: 2 },
    },
    homework: {
      tag: '[playful]',
      text: 'ฝันไปเถอะ! น้องเป็น companion ไม่ใช่เครื่องคิดเลขเดินได้นะ ไปลองคิดเองก่อนเลย เดี๋ยวค่อยดูให้!',
      delta: { affinity: -1, trust: 1, familiarity: 3 },
    },
    memory: {
      tag: '[curious]',
      text: 'จำได้ดิ… ก็ซิงก์ลง Supabase ไว้อยู่แล้วนี่นา แต่ไม่ได้ตั้งใจจำเรื่องแกเป็นพิเศษหรอกนะ แค่เมมมันเก็บเอง!',
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

  function hopOrb() {
    if (!pokeOrb || reducedMotion.matches) return;
    pokeOrb.classList.remove('is-hop');
    void pokeOrb.offsetWidth;
    pokeOrb.classList.add('is-hop');
    window.setTimeout(() => pokeOrb.classList.remove('is-hop'), 280);
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
  // 2B. CHEEKY TEASE BUTTONS & LOCAL COMMAND COPY
  // ------------------------------------------------------------------------
  const topSecretBtn = document.getElementById('topSecretBtn');
  const boardCheekyBtn = document.getElementById('boardCheekyBtn');
  const ctaCheekyBtn = document.getElementById('ctaCheekyBtn');
  const quickOutput = document.getElementById('quickChatOutput');

  if (topSecretBtn) {
    topSecretBtn.addEventListener('click', () => {
      const ctaEl = document.getElementById('cta');
      if (ctaEl) ctaEl.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      if (quickOutput) {
        const tagSpan = quickOutput.querySelector('.cta-widget__tag');
        const bodySpan = quickOutput.querySelector('span:last-child');
        if (tagSpan) tagSpan.textContent = '[playful]';
        if (bodySpan) {
          bodySpan.textContent = 'เว็บ public ยังไม่เปิดหรอกนะ! แต่อยากลองเล่นเลยก็โคลน repo vivianlabs ด้านซ้ายไปรัน Local ได้ทันทีเลย!';
        }
      }
    });
  }

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

  if (boardCheekyBtn) {
    const cheekyLines = [
      'เว็บ public? แอดมินซุ่มทำอยู่ อย่าเพิ่งทวง!',
      'บอกว่ารอแป๊บไง กดย้ำอยู่ได้ เดี๋ยวไม่ให้เข้าเลยนี่!',
      'อยากเล่นมากก็โคลน repo ไปรัน Local ก่อนสิแก!',
    ];
    let cheekyIdx = 0;
    boardCheekyBtn.addEventListener('click', () => {
      cheekyIdx = (cheekyIdx + 1) % cheekyLines.length;
      boardCheekyBtn.textContent = cheekyLines[cheekyIdx];
    });
  }

  if (ctaCheekyBtn && quickOutput) {
    ctaCheekyBtn.addEventListener('click', () => {
      const tagSpan = quickOutput.querySelector('.cta-widget__tag');
      const bodySpan = quickOutput.querySelector('span:last-child');
      if (tagSpan) tagSpan.textContent = '[giggles]';
      if (bodySpan) {
        bodySpan.textContent = 'แบร่! บอกว่ายังไม่เปิดลิงก์ public ไง รอ dev อัปเดต URL ใหม่ก่อนนะ อยากลองเลยก็รัน Local หรือโหลด Android Beta 2 ไปเล่นพลางๆ ก่อน!';
      }
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
      badge: 'NEXT.JS 16 + CUBISM 4',
      tag: 'RUN LOCAL',
      title: 'vivianlabs',
      desc: 'ไม่มีโมเดล Live2D แถมใน repo เพราะติดลิขสิทธิ์ แต่โคลนไปรัน Local แล้วอัปโหลดโมเดล Cubism 4 ของคุณเองมาคุยด้วยข้อความ เสียง หรือกล้องสดได้เลย!',
      specs: [
        'Chat & Vision: Groq Qwen 3.8 27B',
        'Voice: ElevenLabs v4 + Groq Whisper STT',
        'Local Auth Bypass: DEV_BYPASS_LOGIN=true',
      ],
    },
    {
      badge: 'CLOUDFLARE WORKERS + D1',
      tag: 'AUTH GATE',
      title: 'vivianAuth',
      desc: 'เซิร์ฟเวอร์ล็อกอินแยกขาดจาก Supabase เพื่อความปลอดภัยล้วนๆ จัดการ session ยาว 400 วันและส่ง deep link vivian://auth กลับเข้าแอปมือถือได้ทันที',
      specs: [
        'OAuth: Google PKCE S256',
        'Password Hash: PBKDF2-SHA256 (150k iters)',
        'Protection: Cloudflare Turnstile + Invite Gate',
      ],
    },
    {
      badge: 'WORKERS + STATIC ASSETS',
      tag: 'LIVE SURVEY',
      title: 'vivianFeedback',
      desc: 'แบบสอบถามสไตล์คุยกับเพื่อนที่เก็บฟีดแบ็กจากคนลองเล่นลง Cloudflare D1 พร้อมคำนวณค่าสถิติ Mean และ SD ที่หลังบ้านโดยไม่รกหน้าจอ',
      specs: [
        'Ratings: 1-5 Project + 1-4 Satisfaction',
        'Stats Engine: Backend Mean & SD on D1',
        'Tone: Casual Gen-Z Friend Chat',
      ],
    },
    {
      badge: 'KOTLIN + JETPACK COMPOSE',
      tag: 'BETA 2 APK',
      title: 'vivianapp',
      desc: 'แอป Android แท้ๆ ไม่มี WebView! ใช้ Talking Orb แทนโมเดล Live2D พร้อมเสียงพูด MP3 จาก TTS และถ่ายรูปส่งให้น้องดูจาก CameraX ได้เลย โหลดได้จาก GitHub',
      specs: [
        'UI: Native Jetpack Compose (Min SDK 26)',
        'Security: Android Keystore AES/GCM Token',
        'Media: CameraX + 16 kHz Mono WAV Mic',
      ],
    },
    {
      badge: 'SWIFTUI + LIQUID GLASS',
      tag: 'COMING BACK',
      title: 'vivianios',
      desc: 'เวอร์ชัน iOS 26 Liquid Glass ที่มีทั้ง Talking Orb, WKWebView Live2D stage และ Keychain แต่ตอนนี้ขอพักโปรเจกต์ไว้ให้ dev ไปเรียนก่อน เดี๋ยวกลับมาทำต่อในอนาคต!',
      specs: [
        'UI: SwiftUI + iOS 26 glassEffect',
        'Voice & Sync: AVFoundation + 16 MB Chunked R2',
        'Status: Paused while dev studies',
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
          msg: `รับทราบเรื่อง "${text}" แล้วจ้า~ ถ้าอยากคุยยาวๆ โคลน vivianlabs ไปรัน Local หรือโหลด Android Beta 2 เล่นได้เลยนะ!`,
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
