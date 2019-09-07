'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CouponSchema extends Schema {
  up() {
    this.create('coupons', table => {
      table.increments()
      table
        .string('code', 100)
        .notNullable()
        .unique()
      table.datetime('valid_from')
      table.datetime('valid_until')
      table
        .integer('quantity')
        .notNullable()
        .defaultTo(1)
      table
        .enu('can_use_for', ['PRODUCT', 'CLIENT', 'PRODUCT_CLIENT', 'ALL'])
        .notNullable()
        .defaultTo('ALL')
      table
        .enu('type', ['FREE', 'PERCENT', 'CURRENCY'])
        .notNullable()
        .defaultTo('CURRENCY')
      table
        .boolean('recursive')
        .notNullable()
        .defaultTo(false)
      table.timestamps()
    })
  }

  down() {
    this.drop('coupons')
  }
}

module.exports = CouponSchema
