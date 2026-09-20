# Aivory 帮助与部署

这里覆盖 Aivory 的工作空间、多模型、RAG 知识库、持久 Python 沙箱、MCP、管理员运营，以及个人版和完整版部署。

## 内容范围

- `/`：工作空间能力总览。
- `/product`：工作空间、个人版与完整版。
- `/architecture`：请求在模型、知识库、工具和执行环境之间的路径。
- `/playground`：可操作的工作流状态演示。
- `/docs/*`：部署、管理员配置、用户工作流与故障排查。

## 本地预览

```bash
npm install
npm start
```

预览地址默认为 <http://localhost:3000>。

## 发布

```bash
npm run build
npm run verify:static
npm run serve
```

将整个 `build/` 目录发布到 Cloudflare Pages、GitHub Pages、Vercel、Netlify 或任意静态托管服务，不能只上传根目录的 `index.html` 和 JS 文件。构建会为每个页面生成独立的目录索引，例如 `build/docs/deployment/environment/index.html`；生产环境应保留这些目录结构。

### 搜索引擎与页面源码

文档页面使用静态预渲染，正文、标题、描述、canonical、面包屑、站点结构化数据和 sitemap 都会写入构建产物。搜索引擎或“查看网页源代码”应能直接看到页面正文，不需要等待浏览器执行 JavaScript。`npm run verify:static` 会逐页检查预渲染的 `<article>`、`<h1>`、description 和 `robots.txt`，发布前建议执行一次。

构建时设置实际站点地址，避免 canonical、Open Graph、sitemap 和 robots.txt 指向示例域名：

```bash
DOCS_SITE_URL=https://docs.example.com \
DOCS_SITE_BASE_URL=/ \
npm run build
```

如果站点部署在项目子路径（例如 `https://example.com/aivory-docs/`），设置 `DOCS_SITE_BASE_URL=/aivory-docs/`，并将 `build/` 的内容发布到该子路径。

静态服务器必须优先返回真实存在的文件和目录索引，只对未知地址返回 404；不要把所有 `/docs/*` 请求统一重写到根目录的 `index.html`。Nginx 可使用类似下面的查找顺序：

```nginx
try_files $uri $uri/ $uri/index.html =404;
```

发布后用实际域名检查两个地址：

```bash
curl -L https://docs.example.com/docs/intro/
curl -L https://docs.example.com/docs/deployment/environment/
```

返回的 HTML 中应分别出现对应页面的 `<title>` 和 `<h1>`，且 `https://docs.example.com/robots.txt` 中的 Sitemap 地址应指向同一域名。若服务器只返回 Aivory 首页内容，说明发布目录或 rewrite 规则不正确，与文档内容本身无关。

## 内容维护

- 按读者任务组织内容，而不是按内部实现目录组织。
- 首页优先说明工作空间、RAG、持久 Python 沙箱、MCP 和个人版/完整版选择。
- 管理员能力应使用统一的产品语言：模型与渠道、工具与沙盒、订阅积分、支付、详细统计和用户管理。
- 发布长期支持版本时，为应用与说明维护对应的 release。

## 英文文档

英文是默认语言：首页为 `/`，文档为 `/docs/.../`；中文使用独立静态 URL：首页为 `/zh-Hans/`，文档为 `/zh-Hans/docs/.../`。导航栏的语言菜单会保留当前页面路径，因此用户能在同一篇文档的两个语言版本之间切换；构建输出中的内容不是浏览器端翻译，仍可被搜索引擎索引。

中文文档源文件位于 `i18n/zh-Hans/docusaurus-plugin-content-docs/current/`，`docs/` 根目录存放默认英文内容。新增或修改文档时先改中文源，再由本地翻译命令把英文 MDX 生成到 `docs/`，不会修改中文源文件；两个语言按相同文件路径自动配对，`i18n/zh-Hans` 下的 `current.json` 与 `docusaurus-theme-classic/*.json` 负责侧边栏、导航栏和页脚的中文标签。翻译前设置 OpenAI Responses API 所需变量，并由部署维护者明确选择模型：

```bash
export OPENAI_API_KEY='your-api-key'
export OPENAI_TRANSLATION_MODEL='your-selected-model'
npm run translate:en
```

首次执行会翻译全部文档；之后只翻译尚不存在的目标文件。源文档更新后，用 `--force` 重新生成全部英文文档，或仅翻译指定文件：

```bash
npm run translate:en -- --force docs/deployment/environment.mdx
```

翻译命令会验证代码块、行内代码、URL、API 路径和环境变量是否仍保持原样，发现被改写时拒绝写入目标文件。生成后执行 `npm run build && npm run verify:static`，确认默认英文 `/docs/.../` 和中文 `/zh-Hans/docs/.../` 都在静态输出中。

## Cloudflare Pages

```text
Build command: npm ci && npm run build
Output directory: build
Node version: 20
```

生产部署时建议设置站点地址：

```text
DOCS_SITE_URL=https://docs.example.com
DOCS_SITE_BASE_URL=/
```

如果部署到 GitHub Pages 的项目子路径，可使用 `DOCS_SITE_URL=https://<owner>.github.io` 和 `DOCS_SITE_BASE_URL=/Aivory/`。本地开发不设置这两个变量也可以正常运行。

## Cloudflare Workers

仓库包含 `wrangler.jsonc` 与静态资产 Worker，可将 `build/` 原样发布到 Cloudflare Workers。Worker 只将请求交给静态资产绑定，不会把未知的 `/docs/*` 地址回退到首页，因此目录式文档 HTML、404 行为和 SEO 预渲染保持一致。

先使用浏览器登录 Cloudflare，或在 CI 设置具有 Workers 编辑权限的 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`：

```bash
npx wrangler login
```

部署前务必设置生产站点地址。它用于 canonical、Open Graph、sitemap、robots 和多语言 alternate URL：

```bash
DOCS_SITE_URL=https://docs.example.com npm run deploy:cf
```

首次没有自定义域名时，可以先运行 `npm run deploy:cf` 获取 Cloudflare 输出的 `workers.dev` 地址，再把该地址设置为 `DOCS_SITE_URL` 重新部署一次。开发预览使用：

```bash
DOCS_SITE_URL=http://localhost:8787 npm run preview:cf
```

Worker 名称默认为 `aivory-docs`；如该账号下已有同名 Worker，先修改 `wrangler.jsonc` 的 `name`，再部署。

## 首页粒子叙事

首页的 `WorkspaceParticles` 在同一个固定 WebGL 画布中重组粒子，沿用紫色与鼠尾草绿。五章中的粒子位于左侧文案右下方，按实际文字宽度和可用高度调整位置与大小，完整避开右侧产品截图；其他部分融入主视觉中下部。粒子不占用独立区域或额外行高，页面保留原有宽度与间距，也不接管滚动或拦截点击。文字避让按实际文本行生成柔和遮罩，不压暗标题、段落和列表周围的整块空白。五章阶段读取现有 `workspace-journey` 的 GSAP 时间轴，所以原有图册、固定翻页、图片入场、数据连线和路由转场仍由原组件控制。

| 章节 | 停留时的图形 | 滚动节奏与细节 |
| --- | --- | --- |
| 首屏 | Aivory 三角标志 | 保持标志，滚入工作空间时松散重组；保留原标志内部的圆点 |
| 持续对话 | 前后两个对话气泡 | 随第一章进入，下一次翻页时散开；三个点表示正在延续的对话 |
| 知识检索 | 打开的书与检索镜 | 随知识章聚合，再变为工具；检索镜对应引用与来源 |
| 工具执行 | 终端与代码符号 | 在工具章保持可辨认的窗口，翻页时转为成员连接 |
| 团队协作 | 中心成员与连接节点 | 连线重新聚合成团队结构；中央保留成员标记 |
| 工作成果 | 折角文件与图表 | 散开的节点重新组成文件，呼应可下载的分析成果 |
| 数据归属 | 带钥匙孔的盾牌 | 离开五章后重组为数据边界；钥匙孔呼应数据控制权 |
| 部署与后续指南 | 三层服务，再回到标志 | 服务层呼应自部署数据栈，页尾重新收束为 Aivory |

所有阶段使用固定相机和同一组粒子索引，仅造型与粒子深度发生变化；转场采用平滑插值与短暂散开，阅读时保持图形。粒子造型由确定性几何生成，GPU 在一次 draw call 中完成插值，不新增三维框架依赖。桌面最多 2,800 点，手机 900 点、30fps 绘制上限；像素比限制为桌面 2、手机 1.5。切到后台时暂停，离开首页时释放资源。

系统设置“减少动态效果”时只绘制静态品牌标志，不持续渲染；WebGL 不可用或上下文丢失时显示静态 SVG。修改时需检查中英文、五章往返滚动与锚点直达、窄屏自然滚动、减少动态效果，以及首页到产品页再返回。
