'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')

/**
 * CategoryTransformer class
 *
 * @class CategoryTransformer
 * @constructor
 */
class CategoryTransformer extends BumblebeeTransformer {
  static get defaultInclude() {
    return ['image']
  }

  /**
   * This method is used to transform the data.
   */
  transform(model) {
    const { title, id, description } = model.toJSON()
    return {
      id,
      title,
      description
    }
  }

  includeImage(model) {
    return this.item(model.getRelated('image'), ImageTransformer)
  }
}

module.exports = CategoryTransformer
