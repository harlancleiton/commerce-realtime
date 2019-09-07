'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductSchema extends Schema {
  up() {
    this.create('products', table => {
      table.increments()
      table.string('name', 50).notNullable()
      table.text('description').notNullable()
      table.integer('image_id').unsigned()
      table
        .foreign('image_id')
        .references('id')
        .inTable('images')
        .onDelete('CASCADE')
      table.decimal('price', 12, 2)
      table.timestamps()
    })
    this.create('image_procuct', table => {
      table.increments()
      table.integer('image_id').unsigned()
      table
        .foreign('image_id')
        .references('id')
        .inTable('images')
        .onDelete('CASCADE')
      table.integer('product_id').unsigned()
      table
        .foreign('product_id')
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table.timestamps()
    })
  }

  down() {
    this.drop('products')
    this.drop('image_procuct')
  }
}

module.exports = ProductSchema
