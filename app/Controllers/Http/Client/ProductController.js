'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Product = use('App/Models/Product')
const Transformer = use('App/Transformers/Admin/ProductTransformer')

/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.transform
   * @param {Object} ctx.pagination
   */
  async index({ request, response, transform, pagination }) {
    const { name } = request.all()
    const query = Product.query()
    if (name) query.where('name', 'ILIKE', `%${name}%`)
    let products = await query.paginate(pagination.page, pagination.limit)
    products = await transform.paginate(products, Transformer)
    return response.send({ data: products })
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {Object} ctx.transform
   */
  async show({ params, response, transform }) {
    const { id } = params
    let product = await Product.findOrFail(id)
    product = await transform.item(product, Transformer)
    return response.send({ data: product })
  }
}

module.exports = ProductController
