'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Order = use('App/Models/Order')
const Database = use('Database')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const { status, id } = request.all()
    const query = Order.query()
    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'LIKE', `%${id}%`)
    } else if (status) query.where('status', status)
    else if (id) query.where('id', 'LIKE', `%${id}%`)
    const orders = query.paginate(pagination.page, pagination.limit)
    return response.status(200).send({ data: orders })
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // async store({ request, response }) {}

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    const { id } = params
    const order = await Order.findOrFail(id)
    return response.send({ data: order })
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // async update({ params, request, response }) {}

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, response }) {
    const order = await Order.findOrFail(id)
    const trx = Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await trx.commit()
      return response.status(204).send({})
    } catch (error) {
      trx.rollback()
      return response
        .status(400)
        .send({ error: { message: 'Não foi possível excluir o pedido' } })
    }
  }
}

module.exports = OrderController
