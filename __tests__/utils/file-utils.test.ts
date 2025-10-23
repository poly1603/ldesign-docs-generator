/**
 * file-utils 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs-extra'
import * as path from 'path'
import {
  copyDir,
  ensureDir,
  fileExists,
  readJSON,
  writeJSON,
  getFileSize,
} from '../../src/utils/file-utils'

const testDir = path.join(__dirname, '.test-files')

describe('file-utils', () => {
  beforeEach(async () => {
    await fs.ensureDir(testDir)
  })

  afterEach(async () => {
    await fs.remove(testDir)
  })

  describe('ensureDir', () => {
    it('应该创建目录', async () => {
      const dir = path.join(testDir, 'new-dir')
      await ensureDir(dir)

      const exists = await fs.pathExists(dir)
      expect(exists).toBe(true)
    })
  })

  describe('fileExists', () => {
    it('应该检测文件存在', async () => {
      const file = path.join(testDir, 'test.txt')
      await fs.writeFile(file, 'content')

      const exists = await fileExists(file)
      expect(exists).toBe(true)
    })

    it('应该检测文件不存在', async () => {
      const exists = await fileExists(path.join(testDir, 'non-existent.txt'))
      expect(exists).toBe(false)
    })
  })

  describe('writeJSON / readJSON', () => {
    it('应该写入和读取 JSON', async () => {
      const file = path.join(testDir, 'data.json')
      const data = { name: 'test', value: 123 }

      await writeJSON(file, data)
      const read = await readJSON(file)

      expect(read).toEqual(data)
    })
  })

  describe('copyDir', () => {
    it('应该复制目录', async () => {
      const source = path.join(testDir, 'source')
      const dest = path.join(testDir, 'dest')

      await fs.ensureDir(source)
      await fs.writeFile(path.join(source, 'file.txt'), 'content')

      await copyDir(source, dest)

      const exists = await fs.pathExists(path.join(dest, 'file.txt'))
      expect(exists).toBe(true)
    })
  })

  describe('getFileSize', () => {
    it('应该获取文件大小', async () => {
      const file = path.join(testDir, 'test.txt')
      const content = 'Hello World'
      await fs.writeFile(file, content)

      const size = await getFileSize(file)
      expect(size).toBe(content.length)
    })
  })
})



