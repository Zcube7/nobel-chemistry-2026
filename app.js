import { initMolecules } from './molecule.js';
import { amplifiedEE, createReaction, reactionStep, composition } from './science.js';
import { initLearning } from './learning.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const molecules = initMolecules($('molecule-canvas'));
let rotating = !reducedMotion.matches;
const setRotation = () => {
  molecules.setPlaying(rotating);
  $('motion-toggle').innerHTML = rotating ? 'Ⅱ <span>暂停旋转</span>' : '▷ <span>开始旋转</span>';
  $('motion-toggle').setAttribute('aria-label', rotating ? '暂停分子旋转' : '开始分子旋转');
  $('motion-toggle').setAttribute('aria-pressed', String(!rotating));
};
$('motion-toggle').addEventListener('click', () => { rotating = !rotating; setRotation(); });
$('reset-view').addEventListener('click', () => molecules.reset());
reducedMotion.addEventListener('change', () => { rotating = !reducedMotion.matches; setRotation(); });
setRotation();

const svgNS = 'http://www.w3.org/2000/svg';
for (let n = 0; n <= 100; n += 20) {
  const x = 65 + n * 5, y = 325 - n * 2.95;
  for (const attrs of [{ x1: 65, y1: y, x2: 565, y2: y }, { x1: x, y1: 30, x2: x, y2: 325 }]) {
    const line = document.createElementNS(svgNS, 'line');
    Object.entries(attrs).forEach(([key, value]) => line.setAttribute(key, value));
    $('chart-grid').append(line);
  }
  for (const [tx, ty, anchor] of [[x, 347, 'middle'], [51, y + 4, 'end']]) {
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', tx); text.setAttribute('y', ty); text.setAttribute('text-anchor', anchor);
    text.textContent = n; $('chart-grid').append(text);
  }
}
function paintRange(input) {
  input.style.setProperty('--fill', `${(Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
}
function updateAmplification() {
  const e = Number($('initial-ee').value), strength = Number($('amplification-strength').value);
  const output = amplifiedEE(e, strength), percentageA = (100 + output) / 2;
  $('initial-ee-value').innerHTML = `${e}<span>%</span>`;
  $('strength-value').innerHTML = `<span>a = </span>${strength.toFixed(1)}`;
  $('amplification-strength').setAttribute('aria-valuetext', `示意指数 a 等于 ${strength.toFixed(1)}`);
  $('product-ee').innerHTML = `${output.toFixed(1)}<small>%</small>`;
  $('product-ratio').textContent = `镜像 A ${percentageA.toFixed(1)}% · 镜像 B ${(100 - percentageA).toFixed(1)}%`;
  $('product-ratio-fill').style.width = `${percentageA}%`;
  $('input-composition').textContent = `催化成员：甲 ${(50 + e / 2).toFixed(1)}% · 乙 ${(50 - e / 2).toFixed(1)}%`;
  const points = Array.from({ length: 101 }, (_, n) => `${65 + n * 5},${(325 - amplifiedEE(n, strength) * 2.95).toFixed(3)}`);
  const d = `M${points.join(' L')}`;
  $('amplification-path').setAttribute('d', d);
  $('amplification-area').setAttribute('d', `${d} L565,325 L65,325 Z`);
  const px = 65 + e * 5, py = 325 - output * 2.95;
  $('chart-point').setAttribute('cx', px); $('chart-point').setAttribute('cy', py);
  $('chart-guides').setAttribute('d', `M65,${py} H${px} V325`);
  $('amp-insight').textContent = strength === 1 ? '强度为 1 时，输入与输出相等：回到线性参照。' : e === 0 ? '输入完全平衡时，这个确定性模型保持 0% ee。' : e === 100 ? '输入已经是单一镜像，ee 无法超过 100%。' : `输入的 ${e}% ee，在此模型中对应 ${output.toFixed(1)}% 的产物 ee。`;
  $('amp-chart-desc').textContent = `当前催化体系 ee 为 ${e}%，示意放大强度 ${strength.toFixed(1)}，模型产物 ee 为 ${output.toFixed(1)}%。虚线为线性参照。`;
  $('amp-takeaway').textContent = e === 0 ? '读图结论：催化成员甲、乙一样多，模型产物 A、B 也一样多。这种确定性的规则不会自己选边。' : e === 100 ? '读图结论：催化成员已只有甲，在本模型中产物也只有 A。真实反应未必能达到这一极限。' : strength === 1 ? `读图结论：在本模型的线性参照中，催化成员甲占 ${(50 + e / 2).toFixed(1)}%，产物 A 也占 ${percentageA.toFixed(1)}%。它们是两组不同物质的配比。` : `读图结论：催化成员甲占 ${(50 + e / 2).toFixed(1)}%，模型产物 A 约占 ${percentageA.toFixed(1)}%。帮助反应的一方只有小偏向，产物却有更大的偏向。`;
  paintRange($('initial-ee')); paintRange($('amplification-strength'));
}
['initial-ee', 'amplification-strength'].forEach(id => $(id).addEventListener('input', updateAmplification));
updateAmplification();

let state = createReaction(2), timer = null;
const particles = Array.from({ length: 110 }, (_, index) => {
  const dot = document.createElement('span'); dot.className = 'particle';
  dot.setAttribute('aria-hidden', 'true');
  // A fixed permutation keeps all material visible without random simulation noise.
  dot.style.order = (index * 37) % 110;
  $('vessel').append(dot); return dot;
});
function stopReaction() { clearInterval(timer); timer = null; }
function renderReaction() {
  const { fractionA, ee, signedEE } = composition(state), percentA = fractionA * 100;
  $('round-number').textContent = String(state.round).padStart(2, '0');
  $('current-ee').innerHTML = `${ee.toFixed(1)}<small>%</small>`;
  $('remaining-substrate').innerHTML = `${state.substrate}<small>份</small>`;
  $('auto-ratio-fill').style.width = `${percentA}%`;
  $('auto-composition').innerHTML = `镜像 A ${percentA.toFixed(1)}%<span>镜像 B ${(100 - percentA).toFixed(1)}%</span>`;
  $('vessel').setAttribute('aria-label', `步骤 ${state.round}：镜像 A ${state.a.toFixed(1)} 份，镜像 B ${state.b.toFixed(1)} 份，剩余原料 ${state.substrate} 份。`);
  const productDots = Math.round((state.a + state.b) / 2), aDots = Math.round(productDots * fractionA);
  particles.forEach((dot, i) => { dot.className = `particle${i < aDots ? ' a' : i < productDots ? ' b' : ''}`; });
  const complete = state.substrate === 0;
  $('run-reaction').innerHTML = timer ? '暂停反应 <span aria-hidden="true">Ⅱ</span>' : complete ? '重新运行 <span aria-hidden="true">↻</span>' : `${state.round ? '继续反应' : '开始反应'} <span aria-hidden="true">→</span>`;
  $('step-reaction').disabled = complete || Boolean(timer);
  $('seed-ee').disabled = Boolean(timer);
  const balance = Math.abs(signedEE) < 1e-10;
  const leader = signedEE > 0 ? 'A' : 'B', leaderPercent = Math.max(percentA, 100 - percentA);
  $('auto-status').textContent = complete ? (balance ? '原料已用完。两边都增加了，但仍各占 50%：产物变多，不等于比例差会变大。' : `原料已用完。镜像 ${leader} 从起始的 ${(50 + Math.abs(Number($('seed-ee').value)) / 2).toFixed(1)}% 升到 ${leaderPercent.toFixed(1)}%；偏向程度为 ${ee.toFixed(1)}% ee。这只是教学模型的结果。`) : balance ? 'A、B 起初一样多，每一步增加得也一样多，所以比例保持 50∶50。' : state.round ? `原料正在变成新产物。镜像 ${leader} 现占 ${leaderPercent.toFixed(1)}%，在此模型中得到更多后续生成机会。` : '看灰色原料变少、彩色产物变多，再观察 A 与 B 的比例是否改变。';
}
function resetReaction() {
  stopReaction(); state = createReaction(Number($('seed-ee').value));
  const e = Number($('seed-ee').value), a = (100 + e) / 2;
  $('seed-ee-value').innerHTML = `${Math.abs(e)}<span>%${e < 0 ? ' B' : e > 0 ? ' A' : ''}</span>`;
  $('seed-ee').setAttribute('aria-valuetext', e === 0 ? '完全平衡，0% ee' : `偏向镜像 ${e < 0 ? 'B' : 'A'}，${Math.abs(e)}% ee`);
  $('seed-ratio').textContent = `起始：镜像 A ${a.toFixed(1)}% / 镜像 B ${(100 - a).toFixed(1)}%`;
  paintRange($('seed-ee')); renderReaction();
}
function nextStep() {
  state = reactionStep(state);
  if (state.substrate === 0) stopReaction();
  renderReaction();
}
$('run-reaction').addEventListener('click', () => {
  if (timer) { stopReaction(); renderReaction(); return; }
  if (state.substrate === 0) resetReaction();
  timer = setInterval(nextStep, 450); renderReaction();
});
$('step-reaction').addEventListener('click', nextStep);
$('reset-reaction').addEventListener('click', resetReaction);
$('seed-ee').addEventListener('input', resetReaction);
$('balanced-preset').addEventListener('click', () => { $('seed-ee').value = '0'; resetReaction(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && timer) { stopReaction(); renderReaction(); } });
window.addEventListener('pagehide', () => { stopReaction(); molecules.setPlaying(false); });
window.addEventListener('pageshow', setRotation);
resetReaction();
initLearning();
