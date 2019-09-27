'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
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
   * * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name')
    const query = Product.query()
    // ILIKI, postgres case sensitive
    if (name) query.where('name', 'ILIKE', `%${name}%`)
    let products = await query.paginate(pagination.page, pagination.limit)
    products = await transform.paginate(products, Transformer)
    return response.send({ data: products })
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    try {
      const { name, description, price, image } = request.all()
      let product = await Product.create({
        name,
        description,
        price,
        image_id: image
      })
      product = await transform.item(product, Transformer)
      return response.status(201).send({ data: product })
    } catch (error) {
      return response
        .status(400)
        .send({ error: { message: 'Não foi possível atualizar este produto' } })
    }
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    const { id } = params
    let product = await Product.findOrFail(id)
    product = await transform.item(product, Transformer)
    return response.send({ data: product })
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    const { id } = params
    let product = await Product.findOrFail(id)
    try {
      const { name, description, price, image } = request.all()
      product.merge({ name, description, price, image_id: image })
      await product.save()
      product = await transform.item(product, Transformer)
      return response.send({ data: product })
    } catch (error) {
      return response
        .status(500)
        .send({ error: { message: 'Não foi possível atualizar este produto' } })
    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const { id } = params
    const product = await Product.findOrFail(id)
    try {
      await product.delete()
      return response.status(204).send({})
    } catch (error) {
      return response
        .status(500)
        .send({ error: { message: 'Não foi possível deletar este produto' } })
    }
  }
}

module.exports = ProductController
