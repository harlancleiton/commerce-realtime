'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.resource('products', 'ProductController').only(['index', 'show'])
  Route.resource('orders', 'OrderController')
    .apiOnly()
    .except(['destroy'])
})
  .prefix('v1')
  .namespace('Client')
