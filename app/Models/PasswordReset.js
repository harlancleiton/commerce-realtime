'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { generateHash } = use('App/Helpers')

class PasswordReset extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeCreate', async passwordResetInstance => {
      passwordResetInstance.token = await generateHash(25)
      const expires_at = new Date()
      expires_at.setMinutes(expires_at.getMinutes() + 30)
      model.expires_at = expires_at
    })
  }

  static get dates() {
    return ['created_at', 'updated_at', 'expires_at']
  }
}

module.exports = PasswordReset
