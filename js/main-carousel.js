(() => {
  const INIT_ATTR = 'data-nb3-inited';
  const SECTION_IDS = ['nbbio1','nbbio2','nbbio3']; // ✅ 세 섹션 모두 지원

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  SECTION_IDS.forEach((rootId) => {
    const root = document.getElementById(rootId);
    if (!root || root.getAttribute(INIT_ATTR) === '1') return;
    root.setAttribute(INIT_ATTR, '1');

    const slider  = root.querySelector(`#${rootId}Slider`);
    const wrapper = slider ? slider.querySelector('.nb3-slider-wrapper') : null;
    const prevBtn = root.querySelector(`#${rootId}Prev`);
    const nextBtn = root.querySelector(`#${rootId}Next`);
    if (!slider || !wrapper) return;

    // ===== 상태 =====
    let currentIndex = 0;
    let maxIndex = 0;
    let cardWidth = 0;
    let gap = 0;

    // 드래그/모멘텀 상태
    let isPointerDown = false;
    let dragStarted = false;
    let pressX = 0;
    let baseX = 0;
    let targetX = 0;
    let renderX = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;      // px/ms

    // ★ 클릭 억제 가드 (드래그 후 앵커 오동작 방지)
    let totalDrag = 0;
    let suppressClickUntil = 0;
    const CLICK_SUPPRESS_MS = 380;     // 드래그 직후 유령 클릭 방지 시간
    const CLICK_SUPPRESS_PX = 6;       // 미세 이동 허용치 (이하이면 클릭 허용)
    const DRAG_THRESHOLD = 8;          // 드래그 시작 임계값 (기존값 유지)

    // 자동 롤링(섹션별 독립)
    const AUTO_INTERVAL = 4000;
    let autoTimer = null;
    let resumeTimer = null;

    // 튜닝 상수
    const EDGE_RESIST = 0.4;
    const SPRING_STIFF = 0.08;
    const FRICTION_PER_MS = 0.0022;
    const MIN_SPEED = 0.04;
    const FOLLOW = 0.35;

    // 등장 페이드 once(섹션별)
    const fadeTargets = root.querySelectorAll('.nb3-fade-in, .nb3-card, .nb3-product-slide');

    // ===== 치수 =====
    function updateDimensions() {
      const cards = wrapper.querySelectorAll('.nb3-product-slide');
      const containerW = slider.clientWidth;

      if (cards.length) {
        const first = cards[0];
        cardWidth = first.getBoundingClientRect().width;

        const comp = getComputedStyle(wrapper);
        const parsedGap = parseFloat(comp.gap || comp.columnGap || '24') || 24;
        gap = parsedGap;

        // 좌우 padding 1.5rem*2 = 48px 고려
        const visible = Math.max(1, Math.floor((containerW - 48) / (cardWidth + gap)));
        maxIndex = Math.max(0, cards.length - visible);
      } else {
        cardWidth = 0; gap = 0; maxIndex = 0;
      }
    }

    const xForIndex = (i) => -i * (cardWidth + gap);

    function applyTransform(immediate = false) {
      if (immediate) {
        renderX = targetX;
        wrapper.style.transform = `translateX(${renderX}px)`;
        return;
      }
      renderX = lerp(renderX, targetX, FOLLOW);
      wrapper.style.transform = `translateX(${renderX}px)`;
    }

    function setIndex(index, animate = true) {
      currentIndex = clamp(index, 0, maxIndex);
      targetX = xForIndex(currentIndex);
      if (animate) {
        const t0 = now();
        const DUR = 550;
        const startX = renderX;
        const step = () => {
          const p = Math.min(1, (now() - t0) / DUR);
          const e = easeOutCubic(p);
          renderX = lerp(startX, targetX, e);
          wrapper.style.transform = `translateX(${renderX}px)`;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } else {
        applyTransform(true);
      }
    }

    function moveBy(delta) { setIndex(currentIndex + delta, true); }

    // ===== 자동 롤링 =====
    function autoStep() { setIndex(currentIndex >= maxIndex ? 0 : currentIndex + 1, true); }
    function startAuto(){ stopAuto(); autoTimer = setInterval(autoStep, AUTO_INTERVAL); }
    function stopAuto(){ if (autoTimer){ clearInterval(autoTimer); autoTimer = null; } }
    function pauseAuto(){ stopAuto(); if (resumeTimer){ clearTimeout(resumeTimer); resumeTimer = null; } }
    function resumeAutoLater(delay=6000){ if(resumeTimer) clearTimeout(resumeTimer); resumeTimer = setTimeout(startAuto, delay); }

    // 경계 저항
    function clampWithResistance(x){
      const min = xForIndex(maxIndex);
      const max = 0;
      if (x > max) return max + (x - max) * EDGE_RESIST;
      if (x < min) return min + (x - min) * EDGE_RESIST;
      return x;
    }

    // 스냅
    function snapToNearest(velocityHintPxMs=0){
      const step = cardWidth + gap;
      const rawIndex = step ? Math.round(-renderX / step) : 0;
      const bias = Math.abs(velocityHintPxMs) > 0.25 ? (velocityHintPxMs < 0 ? 1 : -1) : 0;
      const targetIndex = clamp(rawIndex + bias, 0, maxIndex);
      setIndex(targetIndex, true);
    }

    // ===== 포인터 이벤트 =====
    function onPointerDown(e){
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      slider.setPointerCapture?.(e.pointerId);

      isPointerDown = true;
      dragStarted = false;

      pressX = e.clientX;
      baseX = targetX;
      lastX = pressX;
      lastT = now();
      velocity = 0;
      totalDrag = 0;

      slider.classList.add('nb3-dragging');
      // 드래그 중 링크 선택 방지
      slider.style.userSelect = 'none';
      pauseAuto();
      e.preventDefault();
    }

    function onPointerMove(e){
      if (!isPointerDown) return;

      const curX = e.clientX;
      const t = now();

      if (!dragStarted && Math.abs(curX - pressX) > DRAG_THRESHOLD) {
        dragStarted = true;
      }
      if (!dragStarted) return;

      const dx = curX - pressX;
      totalDrag = Math.abs(dx); // ★ 총 이동 누적

      let desired = baseX + dx;
      desired = clampWithResistance(desired);
      targetX = desired;

      // 드래그 중 즉시 반영 → 튐 방지
      wrapper.style.transform = `translateX(${targetX}px)`;
      renderX = targetX;

      const dt = Math.max(1, t - lastT);
      const instV = (curX - lastX) / dt; // px/ms
      velocity = velocity * 0.65 + instV * 0.35;

      lastX = curX;
      lastT = t;

      // iOS에서 터치 스크롤 후 '유령 클릭' 방지: 이동 중에는 클릭 억제 타이머 갱신
      suppressClickUntil = now() + CLICK_SUPPRESS_MS;

      e.preventDefault();
    }

    function onPointerUp(e){
      if (!isPointerDown) return;
      isPointerDown = false;
      slider.classList.remove('nb3-dragging');
      slider.style.userSelect = ''; // 복원

      // 드래그가 거의 없고 클릭처럼 보이면 자동롤링만 재개
      if (!dragStarted || totalDrag <= CLICK_SUPPRESS_PX) {
        resumeAutoLater();
        // 드래그로 판단되지 않은 경우라도, 소량 이동 시 약간의 억제시간으로 실수 클릭 방지
        suppressClickUntil = now() + 180;
        e.preventDefault();
        return;
      }

      // 시간기반 관성
      const min = xForIndex(maxIndex);
      const max = 0;

      let animX = targetX;
      let v = velocity;
      let prevT = now();

      const momentum = () => {
        const t = now();
        const dt = t - prevT;
        prevT = t;

        v *= Math.exp(-FRICTION_PER_MS * dt); // 감쇠
        animX += v * dt;

        // 경계 스프링
        if (animX > max) { animX = lerp(animX, max, SPRING_STIFF * 1.5); v *= 0.5; }
        else if (animX < min) { animX = lerp(animX, min, SPRING_STIFF * 1.5); v *= 0.5; }

        targetX = animX;
        wrapper.style.transform = `translateX(${targetX}px)`;
        renderX = targetX;

        if (Math.abs(v) < MIN_SPEED) {
          snapToNearest(v);
          resumeAutoLater();
          return;
        }
        requestAnimationFrame(momentum);
      };
      requestAnimationFrame(momentum);

      // 드래그 후 일정 시간 동안 모든 클릭 억제 (모바일 유령 클릭 포함)
      suppressClickUntil = now() + CLICK_SUPPRESS_MS;

      e.preventDefault();
    }

    // ★ 드래그 후 클릭/탭으로 링크가 발동되지 않도록 전역 캡처 단계에서 방지
    //  - 슬라이더 내부의 어떤 요소(특히 <a>)에서 발생하는 click을 가로채어 조건부 차단
    const clickGuard = (e) => {
      const elapsed = now();
      const movedEnough = totalDrag > CLICK_SUPPRESS_PX || dragStarted;
      const stillSuppressed = elapsed < suppressClickUntil;
      if (movedEnough || stillSuppressed) {
        // a 요소 직접/상위 클릭 모두 차단
        const anchor = e.target.closest ? e.target.closest('a') : null;
        if (anchor && slider.contains(anchor)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
          // 드래그 종료 이후 첫 클릭만 억제하도록 리셋 (중복 차단 완화)
          dragStarted = false;
          return false;
        }
      }
      // 통과시켜도 됨
      return true;
    };
    // capture:true 로 클릭을 먼저 잡아서 차단 (모바일 유령 클릭 포함)
    slider.addEventListener('click', clickGuard, true);

    // 기존 드래그 후 클릭 방지(보완용, 유지)
    slider.addEventListener('click', (e) => {
      if (dragStarted) {
        e.preventDefault();
        e.stopPropagation();
        dragStarted = false;
      }
    }, true);

    // 포인터 이벤트 등록(섹션별)
    slider.addEventListener('pointerdown', onPointerDown, { passive: false });
    slider.addEventListener('pointermove', onPointerMove,   { passive: false });
    slider.addEventListener('pointerup',   onPointerUp,     { passive: false });
    slider.addEventListener('pointercancel', onPointerUp,   { passive: false });
    slider.addEventListener('lostpointercapture', onPointerUp, { passive: false });

    // 기본 이미지/텍스트 드래그 방지
    slider.addEventListener('dragstart', (e) => e.preventDefault());
    // 이미지 요소에 draggable=false 강제(동적으로 들어올 수도 있어 위임으로 처리)
    slider.addEventListener('pointerdown', (e) => {
      const img = e.target && e.target.tagName === 'IMG' ? e.target : e.target.closest && e.target.closest('img');
      if (img) img.setAttribute('draggable','false');
    }, { passive: true });

    // 버튼 네비게이션(섹션별)
    if (prevBtn) prevBtn.addEventListener('click', () => { pauseAuto(); moveBy(-1); resumeAutoLater(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { pauseAuto(); moveBy(1);  resumeAutoLater(); });

    // 등장 페이드 once (사라질 때 제거하지 않음 → 깜빡임 방지)
    const fadeIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('nb3-visible');
          fadeIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    fadeTargets.forEach(el => fadeIO.observe(el));

    // 섹션 가시성 기반 자동롤링 제어(섹션별)
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) resumeAutoLater(1200);
        else pauseAuto();
      });
    }, { threshold: 0.1 });
    sectionIO.observe(root);

    // 탭 전환
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseAuto();
      else resumeAutoLater(2000);
    });

    // 리사이즈(섹션별)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      pauseAuto();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const prevMax = maxIndex;
        updateDimensions();
        targetX = xForIndex(clamp(currentIndex, 0, maxIndex));
        wrapper.style.transform = `translateX(${targetX}px)`;
        renderX = targetX;
        if (prevMax !== maxIndex) snapToNearest(0);
        resumeAutoLater();
      }, 150);
    });

    // 초기화(섹션별)
    function init(){
      updateDimensions();
      targetX = xForIndex(0);
      renderX = targetX;
      wrapper.style.transform = `translateX(${renderX}px)`;
      startAuto();
      // 타이틀 등 페이드 대상 관찰 시작
      root.querySelectorAll('.nb3-fade-in').forEach(el => fadeIO.observe(el));
    }
    init();
  });
})();