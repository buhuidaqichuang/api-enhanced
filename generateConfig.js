const fs = require('fs')
const path = require('path')
const { register_anonimous } = require('./main')
const { cookieToJson, generateRandomChineseIP } = require('./util/index')
const { getXeapiPublicKey } = require('./util/xeapiKey')
const tmpPath = require('os').tmpdir()

async function generateConfig() {
  global.cnIp = generateRandomChineseIP()
  const publicKeyPath = path.resolve(tmpPath, 'xeapi_public_key')
  const anonymousTokenPath = path.resolve(tmpPath, 'anonymous_token')

  // 1. 先获取 xeapi public key（不需要 deviceId 也能初始化）
  try {
    let currentPublicKey = {}
    try {
      currentPublicKey = JSON.parse(fs.readFileSync(publicKeyPath, 'utf-8'))
    } catch (_) {}
    const publicKey = await getXeapiPublicKey(currentPublicKey, '')
    fs.writeFileSync(publicKeyPath, JSON.stringify(publicKey), 'utf-8')
  } catch (error) {
    console.log('Failed to get xeapi public key:', error?.message || error)
  }

  // 2. 注册匿名 token，此时 xeapi key 已存在
  try {
    const res = await register_anonimous()
    const cookie = res.body.cookie
    if (cookie) {
      const cookieObj = cookieToJson(cookie)
      fs.writeFileSync(anonymousTokenPath, cookieObj.MUSIC_A, 'utf-8')
    }
  } catch (error) {
    console.log('Failed to register anonymous token:', error?.message || error)
  }

  // 3. 用真实 deviceId 重新获取一次 key，确保和 deviceId 绑定
  try {
    let currentPublicKey = {}
    try {
      currentPublicKey = JSON.parse(fs.readFileSync(publicKeyPath, 'utf-8'))
    } catch (_) {}
    const publicKey = await getXeapiPublicKey(currentPublicKey, global.deviceId || '')
    fs.writeFileSync(publicKeyPath, JSON.stringify(publicKey), 'utf-8')
  } catch (error) {
    console.log('Failed to refresh xeapi public key:', error?.message || error)
  }
}
module.exports = generateConfig
