/* Generic tetrahedral chirality illustration; not a molecular simulation. */
const TAU = Math.PI * 2;
const LIGANDS = [
  { label: '1', position: [1, 1, 1], color: '#207d77', light: '#94d0c1' },
  { label: '2', position: [1, -1, -1], color: '#b98634', light: '#efd09a' },
  { label: '3', position: [-1, 1, -1], color: '#527b9b', light: '#b6d1df' },
  { label: '4', position: [-1, -1, 1], color: '#a3a598', light: '#f2f1e7' },
];

export function initMolecules(canvas, { onRotationChange } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setPlaying() {}, reset() {}, destroy() {} };

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const initial = { x: -0.29, y: 0.55 };
  let angle = { ...initial };
  let playing = !motion.matches;
  let inView = true;
  let destroyed = false;
  let width = 0;
  let height = 0;
  let frame = 0;
  let previousTime = 0;
  let drag = null;
  const originalTouchAction = canvas.style.touchAction;
  const originalCursor = canvas.style.cursor;
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';

  function rotated([x, y, z], mirror) {
    // Reflect the fixed molecular geometry, then rotate each object properly.
    // Opposite yaw on the mirror partner preserves the visible mirror plane;
    // neither object's handedness changes during its rotation.
    x *= mirror;
    const cy = Math.cos(angle.y), sy = Math.sin(angle.y) * mirror;
    const cx = Math.cos(angle.x), sx = Math.sin(angle.x);
    const rx = x * cy + z * sy;
    const rz = -x * sy + z * cy;
    return [rx, y * cx - rz * sx, y * sx + rz * cx];
  }

  function project(position, cx, cy, radius) {
    const perspective = 5 / (5 - position[2]);
    return {
      x: cx + position[0] * radius * perspective,
      y: cy - position[1] * radius * perspective,
      z: position[2],
      scale: perspective,
    };
  }

  function sphere(atom, radius) {
    const r = radius * atom.scale;
    ctx.save();
    const gradient = ctx.createRadialGradient(
      atom.x - r * 0.36, atom.y - r * 0.42, r * 0.07,
      atom.x, atom.y, r,
    );
    gradient.addColorStop(0, atom.light);
    gradient.addColorStop(0.5, atom.color);
    gradient.addColorStop(1, atom.color);
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#263d3420';
    ctx.shadowBlur = r * 0.4;
    ctx.shadowOffsetY = r * 0.14;
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, r, 0, TAU);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#ffffff60';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = `600 ${Math.max(10, r * 0.82)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = atom.label === '4' ? '#263f38' : '#fffdf5';
    ctx.fillText(atom.label, atom.x, atom.y + 0.5);
    ctx.restore();
  }

  function molecule(cx, cy, radius, mirror, accent) {
    ctx.save();
    // A quiet orbital guide and a grounding shadow make the depth legible.
    ctx.strokeStyle = `${accent}16`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.67, radius * 1.67, 0, 0, TAU);
    ctx.stroke();
    const shadow = ctx.createRadialGradient(cx, cy + radius * 1.68, 0,
      cx, cy + radius * 1.68, radius * 1.3);
    shadow.addColorStop(0, `${accent}15`);
    shadow.addColorStop(1, `${accent}00`);
    ctx.save();
    ctx.translate(cx, cy + radius * 1.68);
    ctx.scale(1, 0.16);
    ctx.translate(-cx, -(cy + radius * 1.68));
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(cx, cy + radius * 1.68, radius * 1.3, 0, TAU);
    ctx.fill();
    ctx.restore();

    const center = {
      ...project([0, 0, 0], cx, cy, radius),
      label: 'C', color: '#3f5149', light: '#a8b8a8',
    };
    const atoms = LIGANDS.map((ligand) => ({
      ...ligand,
      ...project(rotated(ligand.position, mirror), cx, cy, radius * 0.77),
    }));
    const drawables = [{ kind: 'atom', z: 0, atom: center, radius: radius * 0.29 }];
    for (const atom of atoms) {
      drawables.push({ kind: 'bond', z: atom.z * 0.5, atom });
      drawables.push({ kind: 'atom', z: atom.z, atom, radius: radius * 0.23 });
    }
    drawables.sort((a, b) => a.z - b.z);
    for (const item of drawables) {
      if (item.kind === 'atom') {
        sphere(item.atom, item.radius);
      } else {
        const gradient = ctx.createLinearGradient(center.x, center.y, item.atom.x, item.atom.y);
        gradient.addColorStop(0, '#85938a');
        gradient.addColorStop(1, item.atom.color);
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#f7f5ec';
        ctx.lineWidth = Math.max(6, radius * 0.13);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(item.atom.x, item.atom.y);
        ctx.stroke();
        ctx.lineWidth = Math.max(4, radius * 0.085);
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function render() {
    if (destroyed || !width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const compact = width < 500;
    const cy = height * 0.45;
    const radius = Math.min(width * 0.119, height * 0.205, 100);
    const leftX = width * 0.255;
    const rightX = width * 0.745;

    ctx.save();
    ctx.strokeStyle = '#6b7c622b';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.moveTo(width / 2, Math.max(36, cy - radius * 1.9));
    ctx.lineTo(width / 2, Math.min(height - 68, cy + radius * 1.9));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#7c8371';
    ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('镜面', width / 2, Math.max(22, cy - radius * 1.9 - 13));
    ctx.restore();

    molecule(leftX, cy, radius, 1, '#207d77');
    molecule(rightX, cy, radius, -1, '#b98634');

    const labelY = Math.min(height - 39, cy + radius * 2.0 + (compact ? 10 : 20));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${compact ? 12 : 14}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = '#207d77';
    ctx.fillText('一个分子', leftX, labelY);
    ctx.fillStyle = '#9a722f';
    ctx.fillText('它的镜像', rightX, labelY);
    ctx.fillStyle = '#7b8273';
    ctx.font = `${compact ? 9 : 10}px ui-monospace, monospace`;
    ctx.fillText('SAME ATOMS', leftX, labelY + 20);
    ctx.fillText('DIFFERENT HANDEDNESS', rightX, labelY + 20);
  }

  function canAnimate() {
    return playing && inView && !document.hidden && !drag && !destroyed;
  }

  function tick(time) {
    frame = 0;
    if (!canAnimate()) { previousTime = 0; return; }
    if (previousTime) angle.y = (angle.y + Math.min(time - previousTime, 48) * 0.00012) % TAU;
    previousTime = time;
    render();
    frame = requestAnimationFrame(tick);
  }

  function syncAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (canAnimate()) frame = requestAnimationFrame(tick);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    render();
  }

  function notifyRotation() {
    onRotationChange?.({ x: angle.x, y: angle.y });
  }

  function pointerDown(event) {
    if (event.button !== 0 || drag) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    canvas.focus({ preventScroll: true });
    syncAnimation();
  }

  function pointerMove(event) {
    if (!drag || event.pointerId !== drag.id) return;
    angle.y = (angle.y + (event.clientX - drag.x) * 0.012) % TAU;
    angle.x = (angle.x + (event.clientY - drag.y) * 0.012) % TAU;
    drag.x = event.clientX;
    drag.y = event.clientY;
    render();
    notifyRotation();
  }

  function pointerUp(event) {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    canvas.style.cursor = 'grab';
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    syncAnimation();
  }

  function keyDown(event) {
    const changes = {
      ArrowLeft: [0, -0.12], ArrowRight: [0, 0.12],
      ArrowUp: [-0.12, 0], ArrowDown: [0.12, 0],
    };
    if (!changes[event.key]) return;
    event.preventDefault();
    angle.x = (angle.x + changes[event.key][0]) % TAU;
    angle.y = (angle.y + changes[event.key][1]) % TAU;
    render();
    notifyRotation();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncAnimation();
  });
  intersectionObserver.observe(canvas);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('lostpointercapture', pointerUp);
  canvas.addEventListener('keydown', keyDown);
  document.addEventListener('visibilitychange', syncAnimation);
  motion.addEventListener('change', syncAnimation);
  window.addEventListener('resize', resize);
  resize();
  syncAnimation();

  return {
    setPlaying(value) {
      playing = Boolean(value);
      syncAnimation();
    },
    reset() {
      angle = { ...initial };
      render();
      notifyRotation();
      syncAnimation();
    },
    destroy() {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('lostpointercapture', pointerUp);
      canvas.removeEventListener('keydown', keyDown);
      document.removeEventListener('visibilitychange', syncAnimation);
      motion.removeEventListener('change', syncAnimation);
      window.removeEventListener('resize', resize);
      canvas.style.touchAction = originalTouchAction;
      canvas.style.cursor = originalCursor;
    },
  };
}
