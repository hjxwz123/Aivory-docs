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

中文是默认语言，英文页面使用独立的静态 URL：首页为 `/en/`，文档为 `/en/docs/.../`。导航栏的语言菜单会保留当前页面路径，因此用户能在同一篇文档的两个语言版本之间切换；构建输出中的内容不是浏览器端翻译，仍可被搜索引擎索引。

英文 MDX 由本地翻译命令生成到 `i18n/en/docusaurus-plugin-content-docs/current/`，不会修改 `docs/` 下的中文源文件。翻译前设置 OpenAI Responses API 所需变量，并由部署维护者明确选择模型：

```bash
export OPENAI_API_KEY='your-api-key'
export OPENAI_TRANSLATION_MODEL='your-selected-model'
npm run translate:en
```

首次执行会翻译全部文档；之后只翻译尚不存在的目标文件。源文档更新后，用 `--force` 重新生成全部英文文档，或仅翻译指定文件：

```bash
npm run translate:en -- --force docs/deployment/environment.mdx
```

翻译命令会验证代码块、行内代码、URL、API 路径和环境变量是否仍保持原样，发现被改写时拒绝写入目标文件。生成后执行 `npm run build && npm run verify:static`，确认 `/en/docs/.../` 也在静态输出中。

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
