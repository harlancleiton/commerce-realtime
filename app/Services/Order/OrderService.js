'use strict'

class OrderService {
  constructor(model, trx = null) {
    this.model = model
    this.trx = trx
  }

  async syncItems(items) {
    if (!Array.isArray(items)) return false
    await this.model.items().delete(this.trx)
    await this.model.items().createMany(items, trx)
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
}

module.exports = OrderService
