const fs = require('fs')
const path = require('path')
const tmpPath = require('os').tmpdir()

// 检测是否存在 anonymous_token 文件
if (!fs.existsSync(path.resolve(tmpPath, 'anonymous_token'))) {
  fs.writeFileSync(path.resolve(tmpPath, 'anonymous_token'), '', 'utf-8')
}

const { constructServer } = require('./server')

let appPromise = null

async function getApp() {
  if (!appPromise) {
    const generateConfig = require('./generateConfig')
    await generateConfig()
    appPromise = constructServer()
  }
  return appPromise
}

module.exports = async (req, res) => {
  const app = await getApp()
  app(req, res)
}
