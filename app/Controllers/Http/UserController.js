'use strict'

const Transformer = use('App/Transformers/Admin/UserTransformer')

class UserController {
  async me({ response, transform, auth }) {
    let user = await auth.getUser()
    const roles = await user.getRoles()
    user = await transform.item(user, Transformer)
    user.roles = roles
    return response.send({ data: user })
  }
}

module.exports = UserController
