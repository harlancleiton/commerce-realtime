'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')
const Transformer = use('App/Transformers/Admin/UserTransformer')

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
  async index({ request, response, pagination, transform }) {
    const { name } = request.all()
    const query = User.query()
    if (name) {
      query.where('name', 'ILIKE', `%${name}%`)
      query.orWhere('surname', 'ILIKE', `%${name}%`)
      query.orWhere('email', 'ILIKE', `%${name}%`)
    }
    let users = await query.paginate(pagination.page, pagination.limit)
    users = await transform.paginate(users, Transformer)
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
  async store({ request, response, transform }) {
    const { name, surname, email, password, image } = request.all()
    let user = await User.create({
      name,
      surname,
      email,
      password,
      image_id: image
    })
    user = await transform.item(user, Transformer)
    return response.status(201).send({ data: user })
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    const { id } = params
    let user = await User.findOrFail(id)
    user = await transform.item(user, Transformer)
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
  async update({ params, request, response, transform }) {
    const { id } = params
    let user = await User.findOrFail(id)
    const { name, surname, email, password, image } = request.all()
    user.merge({
      name,
      surname,
      email,
      password,
      image_id: image
    })
    await user.save()
    user = await transform.item(user, Transformer)
    return response.send({ data: user })
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const { id } = params
    const user = await User.findOrFail(id)
    try {
      user.delete()
      return response.status(204).send({})
    } catch (error) {
      response
        .status(500)
        .send({ error: { message: 'Erro ao deletar usuário' } })
    }
  }
}

module.exports = UserController
