document.addEventListener('DOMContentLoaded', () => {
  const state = {
    colors: [],
    lockedColors: new Set()
  };

  const palette = document.getElementById('palette');
  const generateButton = document.getElementById('generateButton');
  let notification = null;

  function createNotification() {
    notification = document.createElement('div');
    notification.className = 'copy-notification';
    document.body.appendChild(notification);
  }

  function showNotification(text) {
    if (!notification) createNotification();
    notification.textContent = text;
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  }

  function generateColor(baseHue = null, index = 0) {
    const isBaseColor = baseHue === null;

    // Generate sophisticated base hue using multiple color theory principles
    if (isBaseColor) {
      const goldenRatio = 0.618033988749895;
      const phi = 1.618033988749895;
      
      let baseHue = Math.random();
      // Apply multiple transformations for more refined results
      baseHue += goldenRatio;
      baseHue *= phi;
      baseHue %= 1;
      baseHue *= 360;
    }

    // Enhanced harmonious variations
    const hueVariation = 8 + (Math.random() * 4 - 2);
    const hue = ((baseHue + (index * hueVariation)) + (Math.random() * 3 - 1.5)) % 360;

    // More sophisticated saturation and lightness calculations
    const baseSaturation = 28 + Math.random() * 15;
    const baseLightness = 40 + Math.random() * 20;

    // Apply subtle variations with golden ratio influence
    const saturationVariation = (index * 1.5) * (Math.random() * 0.8 + 0.6);
    const lightnessVariation = (index * 2) * (Math.random() * 0.8 + 0.6);

    const saturation = Math.min(95, Math.max(25, baseSaturation + saturationVariation));
    const lightness = Math.min(75, Math.max(30, baseLightness + lightnessVariation));

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  function generateColors() {
    const baseHue = Math.random() * 360;
    const newColors = [];
  
    // Enhanced color generation with better harmony
    for (let i = 0; i < 5; i++) {
      if (!state.lockedColors.has(i)) {
        newColors[i] = generateColor(baseHue, i);
      } else {
        newColors[i] = state.colors[i];
      }
    }

    // Advanced color harmony check
    for (let i = 1; i < newColors.length; i++) {
      if (!state.lockedColors.has(i) && !state.lockedColors.has(i - 1)) {
        const prevColor = hslToHex(newColors[i - 1]);
        const currentColor = hslToHex(newColors[i]);
        const brightness1 = calculateBrightness(prevColor);
        const brightness2 = calculateBrightness(currentColor);
      
        // Ensure better color contrast and harmony
        if (Math.abs(brightness1 - brightness2) < 35 || Math.abs(brightness1 - brightness2) > 120) {
          newColors[i] = generateColor(baseHue, i + Math.random() * 0.5);
        }
      }
    }

    state.colors = newColors;
    renderPalette();
    updateShareUrl();
  }

  function updateShareUrl() {
    const params = new URLSearchParams();
    state.colors.forEach((color, index) => {
      params.append(`c${index}`, color);
    });
    state.lockedColors.forEach(index => {
      params.append(`l${index}`, '1');
    });
    window.history.replaceState({}, '', `?${params.toString()}`);
  }

  function loadColorsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const colors = [];
    const locked = new Set();
    
    for (let i = 0; i < 5; i++) {
      const color = params.get(`c${i}`);
      if (color) colors[i] = color;
      if (params.get(`l${i}`) === '1') locked.add(i);
    }
    
    if (colors.length === 5) {
      state.colors = colors;
      state.lockedColors = locked;
      renderPalette();
    } else {
      generateColors();
    }
  }

  function toggleLock(index) {
    if (state.lockedColors.has(index)) {
      state.lockedColors.delete(index);
    } else {
      state.lockedColors.add(index);
    }
    renderPalette();
    updateShareUrl();
  }

  function renderPalette() {
    palette.innerHTML = '';
    
    state.colors.forEach((color, index) => {
      const colorDiv = document.createElement('div');
      colorDiv.className = `color ${state.lockedColors.has(index) ? 'locked' : ''}`;
      colorDiv.style.backgroundColor = color;
      colorDiv.style.animationDelay = `${index * 0.1}s`;

      const hexColor = hslToHex(color);
      const brightness = calculateBrightness(hexColor);
      colorDiv.style.color = brightness > 160 ? '#000' : '#fff';

      const controls = document.createElement('div');
      controls.className = 'color-controls';

      const colorHex = document.createElement('span');
      colorHex.className = 'color-hex haptics';
      colorHex.textContent = hexColor.toUpperCase();
      colorHex.onclick = () => {
        copyToClipboard(hexColor);
        showNotification(`Copied ${hexColor.toUpperCase()}`);
      };

      const lockButton = document.createElement('button');
      lockButton.className = 'color-action haptics';
      lockButton.innerHTML = `<span class="material-symbols-rounded">${state.lockedColors.has(index) ? 'lock' : 'lock_open'}</span>`;
      lockButton.onclick = () => toggleLock(index);

      controls.appendChild(colorHex);
      controls.appendChild(lockButton);
      colorDiv.appendChild(controls);
      palette.appendChild(colorDiv);
    });
  }

  function hslToHex(hslStr) {
    if (!hslStr) return '#000000';

    const hsl = /hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/g.exec(hslStr);
    if (!hsl) return '#000000';
    
    const h = parseFloat(hsl[1]) / 360;
    const s = parseFloat(hsl[2]) / 100;
    const l = parseFloat(hsl[3]) / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function calculateBrightness(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy text: ', err));
  }

  window.copyAllColors = function() {
    const colorList = state.colors.map(color => hslToHex(color).toUpperCase()).join('\n');
    copyToClipboard(colorList);
    showNotification('All colors copied to clipboard!');
  };

  document.getElementById('copyPaletteButton').addEventListener('click', copyAllColors);

  document.getElementById('shareButton').addEventListener('click', async () => {
    try {
      const shareData = {
        title: 'Color Palette',
        text: 'Check out this color palette!',
        url: window.location.href
      };
      await navigator.share(shareData);
    } catch (err) {
      copyToClipboard(window.location.href);
      showNotification('Link copied to clipboard!');
    }
  });

  generateButton.addEventListener('click', generateColors);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      generateColors();
    }
  });

  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }

  if (state.colors.length === 0) {
    state.colors = Array(5).fill().map(() => generateColor());
  }

  loadColorsFromUrl();
});