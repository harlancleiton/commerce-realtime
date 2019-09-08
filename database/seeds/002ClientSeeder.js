'use strict'

/*
|--------------------------------------------------------------------------
| ClientSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('adonis-acl/src/Models/Role')} */
const Role = use('Role')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')

class ClientSeeder {
  async run() {
    const clientRole = await Role.findBy('slug', 'client')
    const clients = await Factory.model('App/Models/User').createMany(30)
    await Promise.all(
      clients.map(async client => await client.roles().attach([clientRole.id]))
    )
    const admin = await User.create({
      name: 'Harlan',
      surname: 'Cleiton',
      email: 'harlancleiton@gmail.com',
      password: 'password'
    })
    const adminRole = await Role.findBy('slug', 'admin')
    await admin.roles().attach([adminRole.id])
  }
}

module.exports = ClientSeeder
