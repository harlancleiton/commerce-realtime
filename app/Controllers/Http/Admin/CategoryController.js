'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Category = use('App/Models/Category')

/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const title = request.input('title')
    const query = Category.query()
    // ILIKI, postgres case sensitive
    if (title) query.where('title', 'ILIKE', `%${title}%`)
    const categories = await query.paginate(pagination.page, pagination.limit)
    return response.send({ data: categories })
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const { title, description, image } = request.all()
    try {
      const category = await Category.create({
        title,
        description,
        image_id: image
      })
      return response.status(201).send({ data: category })
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Erro ao processar a sua solicitação' })
    }
  }

  /**
   * Display a single coupon.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {
    const { id } = params
    const category = await Category.findOrFail(id)
    return response.send({ data: category })
  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const { id } = params
    const category = await Category.findOrFail(id)
    const { title, description, image } = request.all()
    category.merge({
      title,
      description,
      image_id: image
    })
    await category.save()
    return response.send({ data: category })
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const { id } = params
    const category = await Category.findOrFail(id)
    await category.delete()
    return response.status(204).send({})
  }
}

module.exports = CategoryController
