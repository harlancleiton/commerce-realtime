'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const { code } = request.all()
    const query = Coupon.query()
    if (code) query.where('code', 'ILIKE', `%${code}%`)
    const coupons = await query.paginate(pagination.page, pagination.limit)
    return response.send({ data: coupons })
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const canUseFor = { client: false, product: false }
    const trx = await Database.beginTransaction()
    try {
      const data = request.only([
        'code',
        'discount',
        'type',
        'valid_from',
        'valid_until',
        'quantity',
        'recursive'
      ])
      const coupon = await Coupon.create(data, trx)
      const { users, products } = request.only(['users', 'products'])
      const service = new Service(coupon, trx)
      if (users && users.length > 0) {
        await service.syncUsers(users)
        canUseFor.client = true
      }
      if (products && products.length > 0) {
        await service.syncProducts(products)
        canUseFor.product = true
      }
      if (canUseFor.product && canUseFor.client)
        coupon.can_use_for = 'PRODUCT_CLIENT'
      else if (canUseFor.client) coupon.can_use_for = 'CLIENT'
      else if (canUseFor.product) coupon.can_use_for = 'PRODUCT'
      else coupon.can_use_for = 'ALL'
      await coupon.save(trx)
      return response.status(201).send({ data: coupon })
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        error: { message: 'Não foi possível criar o cupon de desconto' }
      })
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, request, response }) {
    const { id } = params
    const coupon = await Coupons.findOrFail(id)
    return response.send({ data: coupon })
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const { id } = params
    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(id)
    const canUseFor = { client: false, product: false }
    try {
      const data = request.only([
        'code',
        'discount',
        'type',
        'valid_from',
        'valid_until',
        'quantity',
        'recursive'
      ])
      coupon.merge(data)
      const { users, products } = request.only(['users', 'products'])
      const service = new Service(coupon, trx)
      if (users && users.length > 0) {
        await service.syncUsers(users)
        canUseFor.client = true
      }
      if (products && products.length > 0) {
        await service.syncProducts(products)
        canUseFor.product = true
      }
      if (canUseFor.product && canUseFor.client)
        coupon.can_use_for = 'PRODUCT_CLIENT'
      else if (canUseFor.client) coupon.can_use_for = 'CLIENT'
      else if (canUseFor.product) coupon.can_use_for = 'PRODUCT'
      else coupon.can_use_for = 'ALL'
      await coupon.save(trx)
      await trx.commit()
      return response.status(200).send({ data: coupon })
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        error: { message: 'Não foi possível atualizar o cupon de desconto' }
      })
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const { id } = params
    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(id)
    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete(trx)
      await trx.commit()
      return response.status(204).send({})
    } catch (error) {
      await trx.rollback()
      return response
        .status(500)
        .send({ error: { message: 'Não foi possível excluir o coupon' } })
    }
  }
}

module.exports = CouponController
