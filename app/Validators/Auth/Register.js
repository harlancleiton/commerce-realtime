'use strict'

class AuthRegister {
  get rules() {
    return {
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users',
      password: 'required'
    }
  }

  get messages() {
    return {
      'name.required': 'Nome não informado',
      'surname.required': 'Sobrenome não informado',
      'email.required': 'Email não informado',
      'email.email': 'Email inválido'
    }
  }

  get validateAll() {
    return true
  }

  async fails(errors) {
    return this.ctx.response.status(400).send({ errors })
  }
}

module.exports = AuthRegister
