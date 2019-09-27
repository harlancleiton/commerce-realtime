'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Order = use('App/Models/Order')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Coupon = use('App/Models/Coupon')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Discount = use('App/Models/Discount')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Transformer = use('App/Transformers/Admin/OrderTransformer')

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
  async index({ request, response, pagination, transform }) {
    const { status, id } = request.all()
    const query = Order.query()
    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'LIKE', `%${id}%`)
    } else if (status) query.where('status', status)
    else if (id) query.where('id', 'LIKE', `%${id}%`)
    let orders = query.paginate(pagination.page, pagination.limit)
    orders = await transform.paginate(orders, Transformer)
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
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()
    try {
      const { user, items, status } = request.all()
      let order = await Order.create({ user_id: user, status }, trx)
      const service = new Service(order, trx)
      if (items && items.length > 0) await service.syncItems(items)
      await trx.commit()
      order = await transform.item(order, Transformer)
      return response.status(201).send({ data: order })
    } catch (error) {
      trx.rollback()
      return response
        .status(500)
        .send({ errors: { message: 'Não foi possível registar o pedido' } })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    const { id } = params
    let order = await Order.findOrFail(id)
    order = await transform.item(order, Transformer)
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
  async update({ params: { id }, request, response, transform }) {
    let order = await Order.findOrFail(id)
    const trx = await Database.beginTransaction()
    try {
      const { user, items, status } = request.all()
      order.merge({ user_id: user, items, status })
      const service = new Service(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      order = await transform.item(order, Transformer)
      return response.send({ data: order })
    } catch (error) {
      trx.rollback()
      return response
        .status(500)
        .send({ errors: [{ message: 'Não foi possível atualizar o pedido' }] })
    }
  }

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

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async applyDiscount({ params: { id }, request, response }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)
    const info = {}
    try {
      const service = new Service(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await order.coupons().getCount()
      const canApplyToOrder =
        orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)
      if (canAddDiscount && canApplyToOrder) {
        await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })
        info.message = 'Cupom aplicado com sucesso'
        info.success = true
      } else {
        info.message = 'Não foi possível aplicar esse cupom'
        info.success = false
      }

      return response.send({ data: { order, info } })
    } catch (error) {
      return response
        .status(400)
        .send({ errors: [{ message: 'Não foi possível aplicar o disconto' }] })
    }
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async removeDiscount({ request, response }) {
    const { discount: id } = request.all()
    const discount = await Discount.findOrFail(id)
    await discount.delete()
    return response.status(204).send()
  }
}

module.exports = OrderController
