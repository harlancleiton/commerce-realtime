'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/auth/src/Schemes/Session')} AuthSession */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Order = use('App/Models/Order')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Coupon = use('App/Models/Coupon')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Discount = use('App/Models/Discount')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Transformer = use('App/Transformers/Admin/OrderTransformer')
const Ws = use('Ws')

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
   * @param {AuthSession} ctx.auth
   * @param {Object} ctx.transform
   * @param {Object} ctx.pagination
   */
  async index({ request, response, auth, transform, pagination }) {
    const user = await auth.getUser()
    const { number } = request.all()
    const query = Order.query()
    query.where('user_id', user.id)
    if (number) query.where('id', 'ILIKE', `%${number}%`)
    let orders = await query
      .orderBy('id', 'desc')
      .paginate(pagination.page, pagination.limit)
    orders = await transform.paginate(orders, Transformer)
    return response.send({ data: orders })
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {AuthSession} ctx.auth
   * @param {Object} ctx.transform
   */
  async store({ request, response, auth, transform }) {
    const user = await auth.getUser()
    const { items } = request.all()
    const trx = await Database.beginTransaction()
    try {
      let order = await Order.create({ user_id: user.id }, trx)
      if (items.length > 0) {
        const service = new Service(order, trx)
        service.syncItems(items)
      }
      await trx.commit()
      // TODO order.reload() ?
      order = await Order.find(order.id)
      order = await transform.include('items').item(order, Transformer)
      Ws.getChannel('notifications')
        .topic('notifications')
        .broadcast('new:order', order)
      return response.created({ data: order })
    } catch (error) {
      await trx.rollback()
      return response.status(500).json({
        errors: [{ message: 'Não foi possível armazenar seu pedido' }]
      })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {AuthSession} ctx.auth
   * @param {Object} ctx.transform
   */
  async show({ params, response, auth, transform }) {
    const user = await auth.getUser()
    const { id } = params
    let order = await Order.findOrFail(id)
    if (order.user_id !== user.id) return response.status(403).send()
    order = await transform.include('items,discounts').item(order, Transformer)
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
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  // async destroy({ params, request, response }) {}
}

module.exports = OrderController
