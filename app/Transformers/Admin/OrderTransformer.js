'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const OrderItemTransformer = use('App/Transformers/Admin/OrderItemTransformer')
const CouponTransformer = use('App/Transformers/Admin/CouponTransformer')
const DiscountTransformer = use('App/Transformers/Admin/DiscountTransformer')

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {
  availableInclude() {
    return ['user', 'coupons', 'items', 'discounts']
  }

  /**
   * This method is used to transform the data.
   */
  transform(model) {
    const order = model.toJSON()
    return {
      id: order.id,
      status: order.status,
      total: order.total ? parseFloat(order.total.toFixed(2)) : 0,
      date: order.created_at,
      quantity:
        order.__meta__ && order.__meta__.quantity ? order.__meta__.quantity : 0,
      discount:
        order.__meta__ && order.__meta__.discount ? order.__meta__.discount : 0,
      subtotal:
        order.__meta__ && order.__meta__.subtotal ? order.__meta__.subtotal : 0
    }
  }

  includeUser(model) {
    return this.item(model.getRelated('user', UserTransformer))
  }

  includeItems(model) {
    return this.item(model.getRelated('items', OrderItemTransformer))
  }

  includeDiscounts(model) {
    return this.item(model.getRelated('items', DiscountTransformer))
  }

  includeCoupons(model) {
    return this.item(model.getRelated('coupons', CouponTransformer))
  }
}

module.exports = OrderTransformer
