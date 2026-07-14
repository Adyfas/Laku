document.addEventListener('DOMContentLoaded', () => {
  // Presets
  const EASING_PRESETS = {
    'linear': 'linear',
    'ease': 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Back/elastic out style
    'bounce': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  // Helper to parse duration / delay / distance / opacity values
  const getVal = (el, attr, defaultVal) => {
    const val = el.getAttribute(attr);
    if (val === null || val === undefined) return defaultVal;
    return isNaN(Number(val)) ? val : Number(val);
  };

  // Intersection scroll-triggered animation
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const isOnce = el.getAttribute('data-once') === 'true';

      if (entry.isIntersecting) {
        if (el.classList.contains('text-animation-split')) {
          animateSplitText(el);
        } else if (el.classList.contains('animated-content') || el.classList.contains('fade-in')) {
          animateContent(el);
        } else if (el.classList.contains('scale-up')) {
          animateScaleUp(el);
        } else if (el.classList.contains('text-count')) {
          animateTextCount(el);
        } else if (el.classList.contains('reveal')) {
          animateReveal(el);
        }

        if (isOnce) {
          animationObserver.unobserve(el);
        }
      } else {
        if (isOnce) return;

        if (el.classList.contains('text-animation-split')) {
          resetSplitText(el);
        } else if (el.classList.contains('animated-content') || el.classList.contains('fade-in')) {
          resetContent(el);
        } else if (el.classList.contains('scale-up')) {
          resetScaleUp(el);
        } else if (el.classList.contains('text-count')) {
          resetTextCount(el);
        } else if (el.classList.contains('reveal')) {
          resetReveal(el);
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px'
  });

  // --- 1. Split Text Animation ---
  function initSplitText(el) {
    const text = el.textContent.trim();
    el.textContent = ''; // Clear text
    
    // Set container propertie to avoid layout shifts
    el.style.display = 'inline-block';
    
    // Split to words, to characters
    const words = text.split(/\s+/);
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      const chars = word.split('');
      chars.forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.opacity = '0'; // Hide 
        charSpan.classList.add('split-char');
        wordSpan.appendChild(charSpan);
      });
      
      el.appendChild(wordSpan);
      
      // Add a space after word last word
      if (wordIdx < words.length - 1) {
        const spaceNode = document.createTextNode(' ');
        el.appendChild(spaceNode);
      }
    });

    // Start observing the container
    animationObserver.observe(el);
  }

  function getOffset(el) {
    const distance = getVal(el, 'data-distance', 40);
    const direction = getVal(el, 'data-direction', 'up');
    let xOffset = 0, yOffset = 0;
    
    if (direction === 'up') yOffset = distance;
    if (direction === 'down') yOffset = -distance;
    if (direction === 'left') xOffset = distance;
    if (direction === 'right') xOffset = -distance;
    
    return { xOffset, yOffset };
  }

  function animateSplitText(el) {
    const chars = el.querySelectorAll('.split-char');
    const duration = getVal(el, 'data-duration', 0.7) * 1000; // in ms
    const baseDelay = getVal(el, 'data-delay', 0) * 1000; // in ms
    const stagger = getVal(el, 'data-stagger', 0.05) * 1000; // in ms
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const easeType = getVal(el, 'data-ease', 'elastic');
    const easing = EASING_PRESETS[easeType] || easeType;
    
    const { xOffset, yOffset } = getOffset(el);

    chars.forEach((char, index) => {
      // Cancel previous animation if any
      char.getAnimations().forEach(anim => anim.cancel());
      
      char.animate([
        { 
          opacity: initialOpacity, 
          transform: `translate3d(${xOffset}px, ${yOffset}px, 0)` 
        },
        { 
          opacity: 1, 
          transform: 'translate3d(0, 0, 0)' 
        }
      ], {
        duration: duration,
        delay: baseDelay + (index * stagger),
        easing: easing,
        fill: 'forwards'
      });
    });
  }

  function resetSplitText(el) {
    const chars = el.querySelectorAll('.split-char');
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const { xOffset, yOffset } = getOffset(el);

    chars.forEach(char => {
      char.getAnimations().forEach(anim => anim.cancel());
      char.style.opacity = initialOpacity;
      char.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
    });
  }

  // --- 2. Animated Content / Fade In ---
  function initContent(el) {
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    el.style.opacity = initialOpacity;
    animationObserver.observe(el);
  }

  function animateContent(el) {
    const duration = getVal(el, 'data-duration', 0.7) * 1000; // in ms
    const delay = getVal(el, 'data-delay', 0) * 1000; // in ms
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const easeType = getVal(el, 'data-ease', 'elastic');
    const easing = EASING_PRESETS[easeType] || easeType;
    
    const { xOffset, yOffset } = getOffset(el);

    el.getAnimations().forEach(anim => anim.cancel());

    el.animate([
      { 
        opacity: initialOpacity, 
        transform: `translate3d(${xOffset}px, ${yOffset}px, 0)` 
      },
      { 
        opacity: 1, 
        transform: 'translate3d(0, 0, 0)' 
      }
    ], {
      duration: duration,
      delay: delay,
      easing: easing,
      fill: 'forwards'
    });
  }

  function resetContent(el) {
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const { xOffset, yOffset } = getOffset(el);

    el.getAnimations().forEach(anim => anim.cancel());
    el.style.opacity = initialOpacity;
    el.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
  }

  // --- 3. Scale Up Animation ---
  function initScaleUp(el) {
    const initialScale = getVal(el, 'data-initial-scale', 0);
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const isDualFunction = el.getAttribute('data-dual-function') === 'true';

    el.style.opacity = initialOpacity;
    el.style.scale = `${initialScale}`;

    if (isDualFunction) {
      el.style.opacity = '1';
      el.style.scale = '1';
    }

    animationObserver.observe(el);
  }

  function animateScaleUp(el) {
    const duration = getVal(el, 'data-duration', 0.7) * 1000;
    const delay = getVal(el, 'data-delay', 0) * 1000;
    const initialScale = getVal(el, 'data-initial-scale', 0);
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const easeType = getVal(el, 'data-ease', 'out-back');
    const easing = EASING_PRESETS[easeType] || easeType;
    const isDualFunction = el.getAttribute('data-dual-function') === 'true';

    el.getAnimations().forEach(anim => anim.cancel());

    if (isDualFunction) {
      el.animate([
        {
          scale: `${initialScale}`
        },
        {
          scale: '1'
        }
      ], {
        duration: duration,
        delay: delay,
        easing: easing,
        fill: 'forwards'
      });
    } else {
      el.animate([
        {
          opacity: initialOpacity,
          scale: `${initialScale}`
        },
        {
          opacity: 1,
          scale: '1'
        }
      ], {
        duration: duration,
        delay: delay,
        easing: easing,
        fill: 'forwards'
      });
    }
  }

  function resetScaleUp(el) {
    const initialScale = getVal(el, 'data-initial-scale', 0);
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const isDualFunction = el.getAttribute('data-dual-function') === 'true';

    el.getAnimations().forEach(anim => anim.cancel());

    if (isDualFunction) {
      el.style.opacity = '1';
      el.style.scale = `${initialScale}`;
    } else {
      el.style.opacity = initialOpacity;
      el.style.scale = `${initialScale}`;
    }
  }

  // --- 4. Text Count Animation ---
  function initTextCount(el) {
    const from = getVal(el, 'data-from', 0);
    el.textContent = from;
    animationObserver.observe(el);
  }

  function animateTextCount(el) {
    const from = getVal(el, 'data-from', 0);
    const to = getVal(el, 'data-to', 100);
    const duration = getVal(el, 'data-duration', 2) * 1000;
    const delay = getVal(el, 'data-delay', 0) * 1000;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = getVal(el, 'data-decimals', 0);

    el.getAnimations().forEach(anim => anim.cancel());

    const startTime = performance.now() + delay;
    const range = to - from;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;

      if (elapsed < 0) {
        requestAnimationFrame(update);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = from + (range * easedProgress);

      el.textContent = prefix + currentValue.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function resetTextCount(el) {
    const from = getVal(el, 'data-from', 0);
    el.textContent = from;
  }

  // --- 5. Reveal Text Animation ---
  function initReveal(el) {
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const distance = getVal(el, 'data-distance', 50);
    const direction = getVal(el, 'data-direction', 'up');
    const mode = el.getAttribute('data-mode') || 'normal';

    el.style.overflow = 'hidden';

    if (mode === 'normal') {
      el.style.opacity = initialOpacity;
      if (direction === 'up') {
        el.style.transform = `translateY(${distance}px)`;
      } else if (direction === 'down') {
        el.style.transform = `translateY(-${distance}px)`;
      } else if (direction === 'left') {
        el.style.transform = `translateX(${distance}px)`;
      } else if (direction === 'right') {
        el.style.transform = `translateX(-${distance}px)`;
      }
    } else {
      const text = el.textContent.trim();
      el.textContent = '';

      if (mode === 'word') {
        const words = text.split(/\s+/);
        words.forEach((word, wordIdx) => {
          const wrapper = document.createElement('span');
          wrapper.style.display = 'inline-block';
          wrapper.style.overflow = 'hidden';

          const inner = document.createElement('span');
          inner.style.display = 'inline-block';
          inner.style.opacity = initialOpacity;
          inner.classList.add('reveal-item');

          if (direction === 'up') {
            inner.style.transform = `translateY(${distance}px)`;
          } else if (direction === 'down') {
            inner.style.transform = `translateY(-${distance}px)`;
          } else if (direction === 'left') {
            inner.style.transform = `translateX(${distance}px)`;
          } else if (direction === 'right') {
            inner.style.transform = `translateX(-${distance}px)`;
          }

          inner.textContent = word;
          wrapper.appendChild(inner);
          el.appendChild(wrapper);

          if (wordIdx < words.length - 1) {
            el.appendChild(document.createTextNode(' '));
          }
        });
      } else if (mode === 'char') {
        const chars = text.split('');
        chars.forEach(char => {
          const wrapper = document.createElement('span');
          wrapper.style.display = 'inline-block';
          wrapper.style.overflow = 'hidden';

          const inner = document.createElement('span');
          inner.style.display = 'inline-block';
          inner.style.opacity = initialOpacity;
          inner.classList.add('reveal-item');

          if (direction === 'up') {
            inner.style.transform = `translateY(${distance}px)`;
          } else if (direction === 'down') {
            inner.style.transform = `translateY(-${distance}px)`;
          } else if (direction === 'left') {
            inner.style.transform = `translateX(${distance}px)`;
          } else if (direction === 'right') {
            inner.style.transform = `translateX(-${distance}px)`;
          }

          inner.textContent = char === ' ' ? '\u00A0' : char;
          wrapper.appendChild(inner);
          el.appendChild(wrapper);
        });
      }
    }

    animationObserver.observe(el);
  }

  function animateReveal(el) {
    const duration = getVal(el, 'data-duration', 0.8) * 1000;
    const delay = getVal(el, 'data-delay', 0) * 1000;
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const distance = getVal(el, 'data-distance', 50);
    const direction = getVal(el, 'data-direction', 'up');
    const easeType = getVal(el, 'data-ease', 'out-back');
    const easing = EASING_PRESETS[easeType] || easeType;
    const stagger = getVal(el, 'data-stagger', 0.04) * 1000;
    const mode = el.getAttribute('data-mode') || 'normal';

    let fromTransform = '';
    if (direction === 'up') {
      fromTransform = `translateY(${distance}px)`;
    } else if (direction === 'down') {
      fromTransform = `translateY(-${distance}px)`;
    } else if (direction === 'left') {
      fromTransform = `translateX(${distance}px)`;
    } else if (direction === 'right') {
      fromTransform = `translateX(-${distance}px)`;
    }

    if (mode === 'normal') {
      el.getAnimations().forEach(anim => anim.cancel());
      el.animate([
        { opacity: initialOpacity, transform: fromTransform },
        { opacity: 1, transform: 'translate(0)' }
      ], {
        duration: duration,
        delay: delay,
        easing: easing,
        fill: 'forwards'
      });
    } else {
      const items = el.querySelectorAll('.reveal-item');
      items.forEach((item, index) => {
        item.getAnimations().forEach(anim => anim.cancel());
        item.animate([
          { opacity: initialOpacity, transform: fromTransform },
          { opacity: 1, transform: 'translate(0)' }
        ], {
          duration: duration,
          delay: delay + (index * stagger),
          easing: easing,
          fill: 'forwards'
        });
      });
    }
  }

  function resetReveal(el) {
    const initialOpacity = getVal(el, 'data-initial-opacity', 0);
    const distance = getVal(el, 'data-distance', 50);
    const direction = getVal(el, 'data-direction', 'up');
    const mode = el.getAttribute('data-mode') || 'normal';

    if (mode === 'normal') {
      el.getAnimations().forEach(anim => anim.cancel());
      el.style.opacity = initialOpacity;
      if (direction === 'up') {
        el.style.transform = `translateY(${distance}px)`;
      } else if (direction === 'down') {
        el.style.transform = `translateY(-${distance}px)`;
      } else if (direction === 'left') {
        el.style.transform = `translateX(${distance}px)`;
      } else if (direction === 'right') {
        el.style.transform = `translateX(-${distance}px)`;
      }
    } else {
      const items = el.querySelectorAll('.reveal-item');
      items.forEach(item => {
        item.getAnimations().forEach(anim => anim.cancel());
        item.style.opacity = initialOpacity;
        if (direction === 'up') {
          item.style.transform = `translateY(${distance}px)`;
        } else if (direction === 'down') {
          item.style.transform = `translateY(-${distance}px)`;
        } else if (direction === 'left') {
          item.style.transform = `translateX(${distance}px)`;
        } else if (direction === 'right') {
          item.style.transform = `translateX(-${distance}px)`;
        }
      });
    }
  }

  // Initialize all target elements
  document.querySelectorAll('.text-animation-split').forEach(initSplitText);
  document.querySelectorAll('.animated-content, .fade-in').forEach(initContent);
  document.querySelectorAll('.scale-up').forEach(initScaleUp);
  document.querySelectorAll('.text-count').forEach(initTextCount);
  document.querySelectorAll('.reveal').forEach(initReveal);

  // --- 5. Cursor Follow Button ---
  function initCursorFollow() {
    const videoSection = document.querySelector('#followBtn');
    if (!videoSection) return;

    const thumbnail = videoSection.querySelector('#thumbnail');
    if (!thumbnail) return;

    const playButton = videoSection.querySelector('#follback');
    if (!playButton) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      playButton.style.position = 'absolute';
      // playButton.style.bottom = '80px'
      // playButton.style.left = '50%';
      // playButton.style.top = '50%';
      // playButton.style.transform = 'translate(-50%, -50%)';
      return;
    }

    playButton.style.position = 'absolute';
    playButton.style.transition = 'all 0.15s ease-out';

    let mouseX = 0;
    let mouseY = 0;
    let buttonX = 0;
    let buttonY = 0;

    thumbnail.addEventListener('mousemove', (e) => {
      const rect = videoSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top ;
    });

    thumbnail.addEventListener('mouseleave', () => {
      const rect = videoSection.getBoundingClientRect();
      mouseX = rect.width / 2;
      mouseY = rect.height / 2;
    });

    function animate() {
      buttonX += (mouseX - buttonX) * 0.12;
      buttonY += (mouseY - buttonY) * 0.12;

      playButton.style.left = `${buttonX}px`;
      playButton.style.top = `${buttonY}px`;
      playButton.style.transform = 'translate(-50%, -50%)';

      requestAnimationFrame(animate);
    }

    animate();
  }

  initCursorFollow();
});





// <h1 class="text-animation-split" 
//     data-duration="0.7" 
//     data-delay="0.1" 
//     data-stagger="0.05"
//     data-distance="40" 
//     data-initial-opacity="0" 
//     data-direction="up" 
//     data-ease="elastic">
//   Laku
// </h1>


// <div class="fade-in" 
//      data-duration="0.7" 
//      data-delay="1.8" 
//      data-distance="110" 
//      data-initial-opacity="0.4" 
//      data-direction="up" 
//      data-ease="elastic">
// </div>


// <span class="text-count" 
//       data-from="0" 
//       data-to="100" 
//       data-duration="2" 
//       data-suffix="%"
//       data-once="true">
// </span>
// <span class="text-count" 
//       data-from="0" 
//       data-to="1951" 
//       data-duration="2.5"
//       data-suffix="+"
//       data-once="true">
// </span>


// <p class="reveal" data-mode="normal" data-once="true">
//   Text biasa
// </p>

// <!-- Mode per kata -->
// <p class="reveal" 
//    data-mode="word" 
//    data-duration="0.6"
//    data-stagger="0.08"
//    data-distance="50"
//    data-once="true">
//   Text per kata muncul
// </p>

// <!-- Mode per huruf -->
// <p class="reveal" 
//    data-mode="char" 
//    data-duration="0.5"
//    data-stagger="0.03"
//    data-distance="40"
//    data-once="true">
//   Text per huruf muncul
// </p>