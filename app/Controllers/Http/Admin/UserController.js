'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const { name } = request.all()
    const query = User.query()
    if (name) {
      query.where('name', 'ILIKE', `%${name}%`)
      query.orWhere('surname', 'ILIKE', `%${name}%`)
      query.orWhere('email', 'ILIKE', `%${name}%`)
    }
    const users = await query.paginate(pagination.page, pagination.limit)
    return response.send({ data: users })
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const { name, surname, email, password, image } = request.all()
    const user = User.create({
      name,
      surname,
      email,
      password,
      image_id: image
    })
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    const { id } = params
    const user = await User.findOrFail(id)
    return response.send({ data: user })
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = UserController
