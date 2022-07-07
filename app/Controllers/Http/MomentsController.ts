import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import {v4 as uuidv4} from 'uuid'
import Moment from 'App/Models/Moment'

export default class MomentsController {
  private validationOptions = { // propriedade para imagens
    types: ['image'],
    size: '2mb',
  }

  public async store ({request, response}: HttpContextContract) { // Rota post
    const body = request.body()

    const image = request.file('image', this.validationOptions)

    if (image) {
      const imageName = `${uuidv4()}.${image.extname}`

      await image.move(Application.tmpPath('uploads'), {
        name: imageName
      })

      body.image = imageName
    }

    const moment = await Moment.create(body)

    response.status(201)

    return {
      message: 'Momento criado com sucesso',
      data: moment,
    }
  }

  public async index({response}: HttpContextContract) { // Rota Get All
    // const moments = await Moment.all() // Pegar todos os momentos

    const moments = await Moment.query().preload('comment') // Pegar os momentos com comentarios

    response.status(200)

    return {
      data: moments,
    }
  }

  public async show({params, response}: HttpContextContract) { // Rota Get By Id
    const moment = await Moment.findOrFail(params.id)

    await moment.load('comment')

    if (!moment) {
      console.log({message: 'Não foi possivel encontrar o Id!'})
      response.status(404)
    }

    response.status(200)

    return {
      data: moment,
    }
  }

  public async destroy({params, response}: HttpContextContract) { // Rota Delete
    const moment = await Moment.findOrFail(params.id)

    await moment.delete()

    response.status(204)

    return {
      message: 'Momento excluido com sucesso',
      data: moment,
    }
  }

  public async update({params, request}: HttpContextContract) { // Rota Update
    const body = request.body()

    const moment = await Moment.findOrFail(params.id)

    moment.title = body.title
    moment.description = body.description

    if (moment.image != body.image || !moment.image) {
      const image = request.file('image', this.validationOptions)

      if (image) {
        const imageName = `${uuidv4()}.${image.extname}`

        await image.move(Application.tmpPath('uploads'), {
          name: imageName,
        })

        moment.image = imageName
      }
    }

    await moment.save()

    return {
      message: 'Momento atualizado com sucesso',
      data: moment,
    }
  }

}
