'use strict'

const crypto = use('crypto')
const Helpers = use('Helpers')

/**
 * Generate random string
 *
 * @param {number} length - Size string
 * @return {string} Hash Random string
 */
const generateHash = async (length = 10) => {
  let hash = ''
  if (length > 0) {
    const bytes = await crypto.randomBytes(length)
    const buffer = Buffer.from(bytes)
    hash += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, length)
  }
  return hash
}

/**
 * Move single file for specified path
 * @param {FileJar} file
 * @param {string} path
 * @return {FileJar}
 */
const manageSingleUpload = async (file, path = null) => {
  path = path ? path : Helpers.publicPath('uploads')
  const randomName = await generateHash(30)
  let fileName = `${Date.now()}-${randomName}.${file.subtype}`
  await file.move(path, { name: fileName })
  return file
}

/**
 * Move multiple files for speecified path
 * @param {FileJar} files
 * @param {string} path
 * @return {Object}
 */
const manageMultipleUpload = async (fileJar, path = null) => {
  path = path ? path : Helpers.publicPath('uploads')
  let successes = []
  let errors = []
  await Promise.all(
    fileJar.files.map(async file => {
      //TODO file = await generateSingleUpload
      const randomName = await generateHash(30)
      let fileName = `${Date.now()}-${randomName}.${file.subtype}`
      await file.move(path, { name: fileName })
      if (file.moved()) successes.push(file)
      else errors.push(file)
    })
  )
  return { successes, errors }
}

module.exports = { generateHash, manageSingleUpload, manageMultipleUpload }
