'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderItemSchema extends Schema {
  up() {
    this.create('order_items', table => {
      table.increments()
      table.integer('product_id').unsigned()
      table
        .foreign('product_id')
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table
        .integer('quantity')
        .unsigned()
        .notNullable()
        .defaultTo(1)
      table
        .decimal('subtotal', 12, 2)
        .notNullable()
        .defaultTo(0.0)
      table.timestamps()
    })
  }

  down() {
    this.drop('order_items')
  }
}

module.exports = OrderItemSchema
