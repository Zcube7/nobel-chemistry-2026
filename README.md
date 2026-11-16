# 一点不对称

**2026 诺贝尔化学奖的中文交互式科普。**

[在线体验](https://Zcube7.github.io/nobel-chemistry-2026/) · [授奖公告](https://www.kva.se/en/news/the-nobel-prize-in-chemistry-2026/)

只介绍化学奖：亨利·卡根（Henri B. Kagan）与硖合宪三（Kenso Soai），以及“不对称有机合成中的非线性效应与自催化”。

## 可以探索什么

- **分子的左右手**：拖动或使用方向键旋转一对通用四面体镜像结构。支持暂停、复位和系统减少动态效果偏好。
- **非线性放大**：调整催化体系 ee 与示意指数，对照非线性曲线和线性参照，查看产物比例。
- **不对称自催化**：启动、暂停、单步、重置反应，观察底物被消耗和产物偏向改变；可切换完全平衡或相反初始偏向。
- **为什么重要**：理解手性合成及生命同手性研究的意义，并沿原始来源继续阅读。

## 科学边界

本项目是独立科普作品，不是诺贝尔奖官方网站。Canvas 是通用四面体结构示意，不是具体药物、反应物或分子动力学模拟。镜像 A/B 不等同于 R/S、D/L 或左/右旋光标记。

所有互动曲线与反应参数都是教学模型，不是实验数据，也不预测实际产率、反应速率或药物纯度。

1. 对映体过量 `ee = |A − B| / (A + B) × 100%`，不是优势对映体的比例。90:10 对应 80% ee。
2. 曲线用 `p = (1 + ee/100)/2`、`q = p^a/[p^a+(1−p)^a]`、`ee_out = (2q−1)×100%` 演示正非线性效应。真实体系也存在负非线性效应。
3. 反应初始含 20 份产物、200 份底物，每步将 10 份底物按 `A²:B²` 分配给新增产物。平方权重是人为设定的超线性反馈，**并非硖合反应的速率定律**。总量始终为 220 份。粒子显示经取整，数值不取整参与计算。
4. 自催化并不必然放大 ee。确定性模型没有随机涨落，0% ee 会保持对称。
5. 研究为生命同手性提供可能机制，不证明早期地球采用了同一条路线。

## 本地运行

无需安装前端依赖。使用 Python 3 的静态服务器：

```sh
python -m http.server 4173 --directory dist --bind 127.0.0.1
```

浏览器打开 `http://127.0.0.1:4173`。ES 模块需要 HTTP 服务，请不要直接双击 HTML。

使用 Node.js 运行模型测试：

```sh
npm test
```

## 目录与发布

```text
dist/               静态网站，可部署到任意静态托管服务
  index.html        中文内容、语义结构和来源
  style.css         响应式视觉设计
  molecule.js       Canvas 镜像分子与交互
  science.js        纯函数教学模型
  app.js            页面交互
tests/              物质量守恒、平衡、镜像对称和 ee 边界测试
```

GitHub Pages 从 `gh-pages` 分支根目录提供服务。主分支保存完整源代码，`gh-pages` 仅包含 `dist`。更新并提交主分支后：

```sh
npm test
git subtree split --prefix dist -b pages-release
git push origin pages-release:gh-pages
git branch -d pages-release
```

## 资料来源

核实日期：2026-11-16。

- [瑞典皇家科学院，2026 年诺贝尔化学奖授奖公告](https://www.kva.se/en/news/the-nobel-prize-in-chemistry-2026/)
- Puchot, C. et al. (1986). *Nonlinear effects in asymmetric synthesis. Examples in asymmetric oxidations and aldolization reactions*. JACS 108, 2353–2357. [DOI: 10.1021/ja00269a036](https://doi.org/10.1021/ja00269a036)
- Soai, K. et al. (1995). *Asymmetric autocatalysis and amplification of enantiomeric excess of a chiral molecule*. Nature 378, 767–768. [DOI: 10.1038/378767a0](https://doi.org/10.1038/378767a0)
- [东京理科大学，硖合宪三获奖纪念专题](https://www.tus.ac.jp/about/nobelprize2026/index.html)

## 许可与隐私

本项目原创代码、文字和程序绘制图形使用 [MIT License](LICENSE)。外部论文和官方页面仅链接引用，其内容保留原有权利。

页面不使用第三方脚本、外部字体、分析服务、Cookie、账号或后端；所有交互均在浏览器本地运行。
