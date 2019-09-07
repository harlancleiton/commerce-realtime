'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Coupon extends Model {
  static get dates() {
    const dates = super.dates()
    dates.push('valid_from')
    dates.push('valid_until')
    return dates
  }

  users() {
    return this.belongsToMany('App/Models/User')
  }

  products() {
    return this.belongsToMany('App/Models/Product')
  }

  orders() {
    return this.belongsToMany('App/Models/Order')
  }
}

module.exports = Coupon
