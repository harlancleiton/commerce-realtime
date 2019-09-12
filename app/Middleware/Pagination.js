'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle(ctx, next) {
    if (ctx.request.method() === 'GET') {
      ctx.pagination = {
        // TODO Get values from Env
        page: parseInt(ctx.request.input('page', 1), 10),
        limit: parseInt(ctx.request.input('limit', 10), 10)
      }
    }
    // call next to advance the request
    await next()
  }
}

module.exports = Pagination
