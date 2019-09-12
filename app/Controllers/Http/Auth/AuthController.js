'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/auth/src/Schemes/Session')} AuthSession */
/** @type {typeof import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('User')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Role = use('Role')

/**
 * Resourceful controller for interacting with auths
 */
class AuthController {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async register({ request, response }) {
    const trx = await Database.beginTransaction()
    try {
      const { name, surname, email, password } = request.all()
      const user = await User.create({ name, surname, email, password }, trx)
      const userRole = await Role.findBy('slug', 'client')
      await user.roles().attach([userRole.id], null, trx)
      await trx.commit()
      return response.status(201).json({ data: user })
    } catch (error) {
      await trx.rollback()
      return response.status(400).json({ error: 'Erro ao realizar cadastro' })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {AuthSession} ctx.auth
   */
  async login({ request, response, auth }) {
    const { email, password } = request.all()
    const data = await auth.withRefreshToken().attempt(email, password)
    return response.send({ data })
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {AuthSession} ctx.auth
   */
  async refresh({ request, response, auth }) {
    let refreshToken = request.input('refresh_token')
    if (!refreshToken) refreshToken = request.header('refresh_token')
    const user = await auth
      .newRefreshToken()
      .generateForRefreshToken(refreshToken)
    return response.send({ data: user })
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {AuthSession} ctx.auth
   */
  async logout({ request, response, auth }) {
    let refreshToken = request.input('refresh_token')
    if (!refreshToken) refreshToken = request.header('refresh_token')
    await auth.authenticator('jwt').revokeTokens([refreshToken], true)
    return response.status(204).send({})
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // async forgot({ request, response }) {}

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // async remember({ request, response }) {}

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // async reset({ request, response }) {}
}

module.exports = AuthController
