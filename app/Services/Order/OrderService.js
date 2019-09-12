'use strict'

const Database = use('Database')

class OrderService {
  constructor(model, trx = null) {
    this.model = model
    this.trx = trx
  }

  async syncItems(items) {
    if (!Array.isArray(items)) return false
    await this.model.items().delete(this.trx)
    await this.model.items().createMany(items, this.trx)
  }

  async updateItems(items) {
    const currentItems = await this.model
      .items()
      .whereIn('id', items.map(item => item.id))
      .fetch()
    await this.model
      .items()
      .whereNotIn('id', items.map(item => item.id))
      .delete(this.trx)
    await Promise.all(
      currentItems.rows.map(async item => {
        item.fill(items.find(n => n.id === item.id))
      })
    )
  }

  async canApplyDiscount(coupon) {
    const couponProducts = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('products_id')
    const couponClients = await Database.from('coupon_user')
      .where('coupon_id', coupon.id)
      .pluck('user_id')

    if (
      Array.isArray(
        couponProducts &&
          couponProducts.length < 1 &&
          Array.isArray(couponClients) &&
          couponClients.length < 1
      )
    )
      return true

    let associatedProduct
    let associatedClient
    if (Array.isArray(couponProducts) && couponProducts.length > 0) {
      associatedProduct = true
    }
    if (Array.isArray(couponClients) && couponClients.length > 0) {
      associatedClient = true
    }

    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id')

    if (associatedProduct && associatedClient) {
      const clientMatch = couponClients.find(
        client => client === this.model.user_id
      )
      if (
        clientMatch &&
        Array.isArray(productsMatch) &&
        productsMatch.length > 0
      )
        return true
    }

    if (
      associatedProduct &&
      Array.isArray(productsMatch) &&
      productsMatch.length > 0
    )
      return true

    if (
      associatedClient &&
      Array.isArray(couponClients) &&
      couponClients.length > 0
    ) {
      const match = couponClients.find(client => client === this.model.user_id)
      if (match) return true
    }

    return false
  }
}

module.exports = OrderService
