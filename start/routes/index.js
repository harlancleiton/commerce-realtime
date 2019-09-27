'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Auth Routes
 */
require('./auth')

/**
 * Admin Routes
 */
require('./admin')

/**
 * Client Routes
 */
require('./client')

/**
 * Return current user
 */

Route.get('v1/me', 'UserController.me')
  .as('me')
  .middleware('auth')
