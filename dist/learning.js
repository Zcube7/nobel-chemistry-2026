// Small counting examples to introduce ee before the reaction models.
export function initLearning() {
  const dotsContainer = document.getElementById('ee-dots');
  const explanation = document.getElementById('ee-explanation');
  const countA = document.getElementById('ee-count-a');
  const countB = document.getElementById('ee-count-b');
  const excess = document.getElementById('ee-excess');
  const countButtons = [...document.querySelectorAll('button.ee-preset[data-a]')];

  if (dotsContainer && explanation && countA && countB && excess) {
    const dots = Array.from({ length: 100 }, () => {
      const dot = document.createElement('span');
      dot.className = 'ee-dot';
      dot.setAttribute('aria-hidden', 'true');
      return dot;
    });
    dotsContainer.replaceChildren(...dots);

    function showCount(a) {
      const b = 100 - a;
      const difference = Math.abs(a - b);
      const pairs = Math.min(a, b);
      const majority = a > b ? 'A' : 'B';

      dots.forEach((dot, index) => {
        dot.className = `ee-dot ${index < a ? 'is-a' : 'is-b'}`;
      });
      countA.textContent = String(a);
      countB.textContent = String(b);
      excess.textContent = `${difference}%`;
      explanation.textContent = difference === 0
        ? '50 个 A 与 50 个 B，恰好配成 50 对，没有剩余。两边一样多，所以偏向程度是 0% ee。'
        : `${a} 个 A 与 ${b} 个 B，先配成 ${pairs} 对，剩下 ${difference} 个 ${majority}。100 个里多出 ${difference} 个，所以偏向程度是 ${difference}% ee。`;

      countButtons.forEach(button => {
        const selected = Number(button.dataset.a) === a;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    }

    countButtons.forEach(button => {
      button.addEventListener('click', () => showCount(Number(button.dataset.a)));
    });
    showCount(55);
  }

  const input = document.getElementById('initial-ee');
  const strength = document.getElementById('amplification-strength');
  const curveButtons = [...document.querySelectorAll('button[data-amp-preset]')];
  const presets = {
    balanced: [0, 3],
    small: [10, 3],
    strong: [10, 5],
  };

  if (input && strength) {
    function syncPresets() {
      curveButtons.forEach(button => {
        const values = presets[button.dataset.ampPreset];
        const selected = Boolean(values && Number(input.value) === values[0]
          && Number(strength.value) === values[1]);
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    }

    curveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const values = presets[button.dataset.ampPreset];
        if (!values) return;
        input.value = String(values[0]);
        strength.value = String(values[1]);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        strength.dispatchEvent(new Event('input', { bubbles: true }));
        syncPresets();
      });
    });
    input.addEventListener('input', syncPresets);
    strength.addEventListener('input', syncPresets);
    syncPresets();
  }
}
