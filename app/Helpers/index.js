'use strict'

const crypto = use('crypto')
const crypto = use('Helpers')

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
    const buffer = new Buffer(bytes)
    hash += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, length)
  }
  return hash
}

module.exports = { generateHash }
