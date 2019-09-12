'use strict'

const OrderHook = (exports = module.exports = {})

OrderHook.updateValues = async modelInstance => {
  modelInstance.$sideLoaded.subtotal = await modelInstance
    .items()
    .getSum('subtotal')
  modelInstance.$sideLoaded.quantity_items = await modelInstance
    .items()
    .getSum('quantity')
  modelInstance.$sideLoaded.discount = await modelInstance
    .discounts()
    .getSum('discount')
  modelInstance.total =
    modelInstance.$sideLoaded.subtotal - modelInstance.$sideLoaded.discount
}

OrderHook.updateCollectionValues = async modelsInstance => {
  // eslint-disable-next-line no-restricted-syntax
  for (let modelInstance of modelsInstance) {
    modelInstance = await OrderHook.updateValues(modelInstance)
  }
}
