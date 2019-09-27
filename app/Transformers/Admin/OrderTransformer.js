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
  static get availableInclude() {
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
      quantity_items:
        order.__meta__ && order.__meta__.quantity_items
          ? order.__meta__.quantity_items
          : 0,
      discount:
        order.__meta__ && order.__meta__.discount ? order.__meta__.discount : 0,
      subtotal:
        order.__meta__ && order.__meta__.subtotal ? order.__meta__.subtotal : 0
    }
  }

  includeUser(model) {
    return this.item(model.getRelated('user'), UserTransformer)
  }

  includeItems(model) {
    return this.collection(model.getRelated('items'), OrderItemTransformer)
  }

  includeDiscounts(model) {
    return this.collection(model.getRelated('items'), DiscountTransformer)
  }

  includeCoupons(model) {
    return this.collection(model.getRelated('coupons'), CouponTransformer)
  }
}

module.exports = OrderTransformer
