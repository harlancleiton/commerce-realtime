'use strict'

const Coupon = use('App/Models/Coupon')
const Order = use('App/Models/Order')
const Database = use('Database')

const DiscountHook = (exports = module.exports = {})

DiscountHook.calculateValues = async modelInstance => {
  let couponProducts = []
  let discountItems = []
  modelInstance.discount = 0
  const coupon = await Coupon.find(modelInstance.coupon_id)
  const order = await Order.find(modelInstance.order_id)

  switch (coupon.can_use_for) {
    case 'products_client' || 'product':
      couponProducts = await Database.from('coupon_product')
        .where('coupon_id', modelInstance.coupon_id)
        .pluck('product_id')
      discountItems = await Database.from('order_items')
        .where('order_id', modelInstance.order_id)
        .whereIn('product_id', couponProducts)
        .pluck('product_id')
      if (coupon.type === 'percent') {
        // eslint-disable-next-line no-restricted-syntax
        for (const orderItem of discountItems)
          modelInstance.discount += (orderItem.subtotal / 100) * coupon.discount
      } else if (coupon.type === 'currency') {
        // eslint-disable-next-line no-restricted-syntax
        for (const orderItem of discountItems)
          modelInstance.discount += coupon.discount * orderItem.quantity
      } else {
        // eslint-disable-next-line no-restricted-syntax
        for (const orderItem of discountItems)
          modelInstance.discount += orderItem.subtotal
      }
      break
    default:
      if (coupon.type === 'percent')
        modelInstance.discount = (order.subtotal / 100) * coupon.discount
      else if (coupon.type === 'currency')
        modelInstance.discount = coupon.discount
      else modelInstance.discount = order.subtotal
      break
  }
}

DiscountHook.decrementCoupons = async modelInstance => {
  const query = Database.from('coupons')
  if (modelInstance.$transaction) query.transacting(modelInstance.$transaction)
  await query.where('id', modelInstance.coupon_id).decrement('quantity', 1)
}

DiscountHook.incrementCoupons = async modelInstance => {
  const query = Database.from('coupons')
  if (modelInstance.$transaction) query.transacting(modelInstance.$transaction)
  await query.where('id', modelInstance.coupon_id).increment('quantity', 1)
}
