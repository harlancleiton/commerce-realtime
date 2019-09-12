'use strict'

class AdminStoreCategory {
  get rules() {
    return {
      title: 'required|unique:categories',
      description: 'required'
    }
  }

  get messages() {
    return {
      'title.required': 'Título não informado',
      'title.unique': 'Categoria existente',
      'description.required': 'Descrição não informada'
    }
  }

  get validateAll() {
    return true
  }

  async fails(errors) {
    return this.ctx.response.status(400).send({ errors })
  }
}

module.exports = AdminStoreCategory
