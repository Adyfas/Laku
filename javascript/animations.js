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
      if (entry.isIntersecting) {
        if (el.classList.contains('text-animation-split')) {
          animateSplitText(el);
        } else if (el.classList.contains('animated-content') || el.classList.contains('fade-in')) {
          animateContent(el);
        } else if (el.classList.contains('scale-up')) {
          animateScaleUp(el);
        }
      } else {
        if (el.classList.contains('text-animation-split')) {
          resetSplitText(el);
        } else if (el.classList.contains('animated-content') || el.classList.contains('fade-in')) {
          resetContent(el);
        } else if (el.classList.contains('scale-up')) {
          resetScaleUp(el);
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

  // Initialize all target elements
  document.querySelectorAll('.text-animation-split').forEach(initSplitText);
  document.querySelectorAll('.animated-content, .fade-in').forEach(initContent);
  document.querySelectorAll('.scale-up').forEach(initScaleUp);
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
