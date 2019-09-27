'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const ProductTransformer = use('App/Transformers/Admin/ProductTransformer')
const OrderTransformer = use('App/Transformers/Admin/OrderTransformer')

/**
 * CouponTransformer class
 *
 * @class CouponTransformer
 * @constructor
 */
class CouponTransformer extends BumblebeeTransformer {
  static get availableInclude() {
    return ['users', 'products', 'orders']
  }

  /**
   * This method is used to transform the data.
   */
  transform(model) {
    const coupon = model.toJSON()
    return coupon
  }

  includeUsers(model) {
    return this.collection(model.getRelated('users'), UserTransformer)
  }

  includeProducts(model) {
    return this.collection(model.getRelated('products'), ProductTransformer)
  }

  includeOrders(model) {
    return this.collection(model.getRelated('orders'), OrderTransformer)
  }
}

module.exports = CouponTransformer
