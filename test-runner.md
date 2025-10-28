# 🧪 测试运行指南

## ✅ 所有功能已完成！

**完成度**: 100% (12/12 任务)

---

## 📦 测试前准备

### 1. 安装依赖

```bash
cd D:\WorkBench\ldesign\tools\docs-generator

# 安装所有依赖
pnpm install

# 特别确认这些依赖已安装
pnpm add vue-router@latest
```

### 2. 检查新增文件

确认以下文件已创建：

```
✅ src/app/index.ts
✅ src/app/router.ts
✅ src/app/store.ts
✅ src/app/components.ts
✅ src/app/route-data-generator.ts
✅ src/vite/plugins/route-data.ts
✅ src/core/HybridBuilder.ts
✅ src/templates/api-doc.vue
✅ src/templates/component-doc.vue
✅ src/pages/404.vue
✅ templates/index.html
✅ src/types/modes.ts
✅ __tests__/app/router.test.ts
✅ __tests__/app/store.test.ts
✅ __tests__/app/route-data-generator.test.ts
✅ docs/MIGRATION.md
```

---

## 🧪 运行测试

### 步骤 1: 类型检查

```bash
pnpm typecheck
```

**预期结果**: 无类型错误

### 步骤 2: 运行单元测试

```bash
pnpm test
```

**预期结果**:
- ✅ Router 测试通过 (1个)
- ✅ Store 测试通过 (5个)
- ✅ Route Data Generator 测试通过 (3个)

### 步骤 3: 构建测试

```bash
pnpm build
```

**预期结果**: 构建成功，dist 目录生成

---

## 🚀 功能测试

### 测试 1: Dev 命令（SPA 模式）

```bash
# 需要先有一些 markdown 文件用于测试
# 创建测试文件
mkdir -p test-docs
echo "# Test\nThis is a test" > test-docs/index.md

# 创建测试配置
cat > docs-generator.config.test.js << EOF
import { defineConfig } from './dist/index.js'

export default defineConfig({
  sourceDir: './test-docs',
  outputDir: './test-output',
  site: {
    title: 'Test Site',
  },
})
EOF

# 启动 dev 服务器
node dist/cli.js dev -c docs-generator.config.test.js
```

**预期结果**:
- ✅ 服务器在 http://localhost:3000 启动
- ✅ 访问浏览器可以看到 SPA 应用
- ✅ 控制台显示路由数据生成信息

### 测试 2: Build 命令（混合模式）

```bash
# 混合构建
node dist/cli.js build -c docs-generator.config.test.js --mode hybrid
```

**预期结果**:
- ✅ 构建成功
- ✅ test-output 目录生成
- ✅ 包含 index.html、assets/、search-index.json 等

### 测试 3: Build 命令（SPA 模式）

```bash
node dist/cli.js build -c docs-generator.config.test.js --mode spa
```

**预期结果**:
- ✅ 纯 SPA 构建成功

### 测试 4: Build 命令（SSG 模式）

```bash
node dist/cli.js build -c docs-generator.config.test.js --mode ssg
```

**预期结果**:
- ✅ 静态页面生成成功（兼容旧版）

### 测试 5: Generate 命令（兼容性）

```bash
node dist/cli.js generate -c docs-generator.config.test.js
```

**预期结果**:
- ✅ 旧命令继续工作

---

## 🔍 验收检查清单

### 基础功能
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm test` 全部通过
- [ ] `pnpm build` 成功

### Dev 模式
- [ ] `dev` 命令可以启动
- [ ] 浏览器可以访问
- [ ] 控制台无错误
- [ ] HMR 更新工作（修改 markdown 文件）

### Build 模式
- [ ] `build --mode spa` 成功
- [ ] `build --mode ssg` 成功
- [ ] `build --mode hybrid` 成功（默认）
- [ ] 输出文件结构正确

### 兼容性
- [ ] `generate` 命令继续工作
- [ ] 旧配置文件兼容
- [ ] 所有现有测试通过

---

## ⚠️ 可能的问题和解决方案

### 问题 1: 缺少依赖

```bash
# 错误: Cannot find module 'vue-router'
# 解决:
pnpm add vue-router
```

### 问题 2: 类型错误

```bash
# 错误: Cannot find module '@ldesign/routes'
# 解决: 这是虚拟模块，忽略此类型错误或添加类型声明

# 创建 src/vite/plugins/types.d.ts
declare module '@ldesign/routes' {
  const routes: any
  export default routes
}

declare module '@ldesign/docs' {
  const docs: any
  export default docs
}
```

### 问题 3: 构建失败

```bash
# 错误: Template not found
# 解决: 确保 templates/index.html 存在
ls -la templates/index.html
```

### 问题 4: Dev 服务器启动失败

```bash
# 检查端口占用
netstat -ano | findstr :3000

# 使用不同端口
node dist/cli.js dev -p 5173
```

---

## 📊 测试报告模板

完成测试后，填写以下报告：

```markdown
## 测试报告

**测试日期**: ____
**测试人**: ____

### 单元测试
- [ ] 类型检查通过
- [ ] Router 测试通过
- [ ] Store 测试通过
- [ ] Route Data Generator 测试通过

### 功能测试
- [ ] Dev 模式工作
- [ ] Build Hybrid 模式工作
- [ ] Build SPA 模式工作
- [ ] Build SSG 模式工作
- [ ] Generate 命令兼容

### 性能测试
- Dev 启动时间: ____ (目标 < 1s)
- HMR 更新时间: ____ (目标 < 200ms)

### 问题记录
- 问题 1: ____
- 解决方案: ____

### 总体评价
✅ 通过 / ⚠️ 部分通过 / ❌ 未通过
```

---

## 🎉 完成标志

当所有测试通过后，您将拥有：

✅ **VitePress 级别的 SPA 开发体验**
- 极速启动 (< 1s)
- 即时热更新 (< 200ms)
- 客户端路由切换

✅ **强大的构建能力**
- SPA 模式
- SSG 模式（兼容旧版）
- Hybrid 模式（推荐）

✅ **100% 向后兼容**
- 所有旧命令继续工作
- 所有旧配置继续工作
- 所有旧插件继续工作

---

**祝测试顺利！** 🚀
