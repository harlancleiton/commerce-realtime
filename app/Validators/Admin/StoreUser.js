'use strict'

class AdminStoreUser {
  get rules() {
    const userId = this.ctx.params.id
    const emailRule = ''
    if (userId) emailRule.concat(`email|unique:users,email,id,${userId}`)
    else emailRule.concat('email|unique:users,email|required')
    return {
      email: emailRule,
      image: 'exists:image,id'
    }
  }

  get messages() {
    return {
      'email.required': 'Email não informado',
      'email.email': 'Email inválido',
      'email.unique': 'Email em uso',
      'image.exists': 'Imagem não encontrada'
    }
  }

  get validateAll() {
    return true
  }

  async fails(errors) {
    return this.ctx.response.status(400).send({ errors })
  }
}

module.exports = AdminStoreUser
