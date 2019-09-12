'use strict'

class AdminStoreOrder {
  get rules() {
    return {
      'items.*.products_id': 'exists:products,id',
      'items.*.quantity': 'min:1'
    }
  }

  get messages() {
    return {
      'items.exists': 'Produto não encontrado',
      'items.min': 'Quantidade do produto deve ser positiva'
    }
  }

  get validateAll() {
    return true
  }

  async fails(errors) {
    return this.ctx.response.status(400).send({ errors })
  }
}

module.exports = AdminStoreOrder
