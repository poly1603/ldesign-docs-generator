# 贡献指南

感谢你考虑为 @ldesign/docs-generator 做出贡献！

## 🤝 如何贡献

### 报告 Bug

如果你发现 bug，请：

1. 检查 [Issues](https://github.com/ldesign/ldesign/issues) 是否已有相同问题
2. 如果没有，创建新 Issue，包含：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（Node 版本、OS 等）
   - 错误日志

### 提出新功能

1. 先在 Issues 中讨论新功能
2. 说明功能的使用场景和价值
3. 得到维护者认可后再开始开发

### 提交代码

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 🔧 开发设置

### 1. 克隆仓库

```bash
git clone https://github.com/ldesign/ldesign.git
cd ldesign/tools/docs-generator
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 测试覆盖率
pnpm test:coverage
```

### 4. 构建

```bash
pnpm build
```

## 📝 代码规范

### TypeScript 规范

- 使用 TypeScript 严格模式
- 所有公共 API 必须有类型定义
- 优先使用 interface 而非 type
- 使用 JSDoc 注释

### 命名规范

- 文件名: kebab-case (`my-plugin.ts`)
- 类名: PascalCase (`MyClass`)
- 函数名: camelCase (`myFunction`)
- 常量: UPPER_SNAKE_CASE (`MAX_SIZE`)
- 类型: PascalCase (`MyType`)
- 接口: PascalCase (`MyInterface`)

### 代码风格

```typescript
// ✅ 好的
export function createParser(options: ParserOptions): Parser {
  const { sourceDir, logger } = options
  
  return {
    async parse(files: string[]): Promise<DocNode[]> {
      logger.info(`解析 ${files.length} 个文件`)
      // ...
    }
  }
}

// ❌ 不好的
export function createParser(options){
  return {
    parse:async function(files){
      // ...
    }
  }
}
```

## 🧪 测试要求

### 1. 单元测试

- 所有新功能必须有测试
- 目标覆盖率 80%+
- 使用 Vitest

```typescript
describe('MyFeature', () => {
  it('应该正确处理输入', () => {
    const result = myFeature('input')
    expect(result).toBe('expected')
  })
  
  it('应该处理错误情况', () => {
    expect(() => myFeature(null)).toThrow()
  })
})
```

### 2. 集成测试

测试完整的文档生成流程。

### 3. E2E 测试

测试 CLI 命令和实际使用场景。

## 📖 文档要求

### 1. 代码注释

所有公共 API 必须有 JSDoc 注释：

```typescript
/**
 * 解析文档文件
 * 
 * @param files - 文件路径列表
 * @param options - 解析选项
 * @returns 文档节点数组
 * 
 * @example
 * ```ts
 * const nodes = await parseFiles(['file1.ts', 'file2.ts'])
 * ```
 */
export async function parseFiles(
  files: string[],
  options: ParseOptions
): Promise<DocNode[]> {
  // ...
}
```

### 2. README 更新

如果添加了新功能，更新 README.md。

### 3. CHANGELOG 更新

在 CHANGELOG.md 中记录更改。

## 🚀 Pull Request 流程

### 1. PR 标题

使用约定式提交格式：

```
feat: 添加 Playground 功能
fix: 修复模板渲染错误
docs: 更新插件开发指南
test: 添加 PluginManager 测试
refactor: 重构模板引擎
perf: 优化解析性能
```

### 2. PR 描述

包含：
- 更改内容概述
- 相关 Issue 编号
- 测试说明
- 截图（如果是 UI 更改）

### 3. 代码审查

- 所有 PR 都需要代码审查
- 回应审查意见
- 确保 CI 通过

### 4. 合并条件

- ✅ 所有测试通过
- ✅ Linter 无错误
- ✅ 代码审查通过
- ✅ 文档已更新
- ✅ CHANGELOG 已更新

## 🎯 优先级

### 高优先级

- Bug 修复
- 性能优化
- 安全问题
- 文档改进

### 中优先级

- 新功能
- API 改进
- 测试覆盖

### 低优先级

- 代码重构
- 风格调整
- 依赖更新

## 💬 沟通渠道

- **GitHub Issues**: Bug 报告和功能请求
- **GitHub Discussions**: 一般讨论和问题
- **Pull Requests**: 代码贡献

## 📜 行为准则

- 尊重所有贡献者
- 建设性的反馈
- 专注于技术讨论
- 包容不同观点

## 🙏 感谢

感谢所有贡献者的付出！每一个贡献都让这个项目变得更好。

---

**祝贡献愉快！** 🎉



