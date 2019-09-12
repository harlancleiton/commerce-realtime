'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Image = use('App/Models/Image')
const { manageSingleUpload, manageMultipleUpload } = use('App/Helpers')
const Helpers = use('Helpers')
const fs = use('fs')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index({ response, pagination }) {
    const images = await Image.query()
      .ordrBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)
    return response.send({ data: images })
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const fileJar = request.file('images', { types: ['image'], size: '3mb' })
      const images = []
      if (!fileJar.files) {
        const file = await manageSingleUpload(fileJar)
        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          images.push(image)
          return response.status(201).send({ success: images, errors: {} })
        }
        return response.status(400).send({
          error: { message: 'Não foi possível enviar a imagem no momento' }
        })
      }
      const files = await manageMultipleUpload(fileJar)
      await Promise.all(
        files.successes.map(async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          images.push(image)
        })
      )
      return response
        .status(201)
        .send({ success: images, errors: files.errors })
    } catch (error) {
      return response.status(400).send({
        error: { message: 'Não foi possível processar sua solicitação' }
      })
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    const { id } = params
    const image = await Image.findOrFail(id)
    return response.send({ data: image })
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const { id } = params
    const image = await Image.findOrFail(id)
    try {
      image.merge(request.only(['original_name']))
      await image.save()
      return response.status(200).send({ data: image })
    } catch (error) {
      return response
        .status(400)
        .send({ error: { message: 'Erro ao atualizar imagem' } })
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const { id } = params
    const image = Image.findOrFail(id)
    try {
      const filepath = Helpers.publicPath(`uploads/${image.path}`)
      await fs.unlink(filepath, async err => {
        if (!err) await image.delete()
      })
      return response.status(204).send({})
    } catch (error) {
      return response
        .status(400)
        .send({ error: { message: 'Erro ao excluir imagem' } })
    }
  }
}

module.exports = ImageController
