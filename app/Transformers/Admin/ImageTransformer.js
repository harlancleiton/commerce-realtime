'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * ImageTransformer class
 *
 * @class ImageTransformer
 * @constructor
 */
class ImageTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform(model) {
    const { id, url, size, original_name, extension } = model.toJSON()
    return {
      id,
      url,
      size,
      original_name,
      extension
    }
  }
}

module.exports = ImageTransformer
