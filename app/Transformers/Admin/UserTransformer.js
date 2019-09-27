'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')

/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends BumblebeeTransformer {
  defaultInclude() {
    return ['image']
  }

  /**
   * This method is used to transform the data.
   */
  transform(model) {
    const { name, email, surname, id } = model
    return {
      name,
      email,
      surname,
      id
    }
  }

  includeImage(model) {
    return this.item(model.getRelated('image'), ImageTransformer)
  }
}

module.exports = UserTransformer
