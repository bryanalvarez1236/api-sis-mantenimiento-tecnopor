import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import {
  ENGINE_ROUTES,
  FIRST_ENGINE_CODE,
  UPDATED_ENGINE_RESPONSE_DTO,
  UPDATE_ENGINE_DTO,
  engines,
} from './helpers'
import { api } from '../helpers/api'
import { engineNotFoundMessage } from '../../src/services/engine.service'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'
import { boots } from '../boot/helpers'

describe('Engines EndPoint => PUT', async () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.boot.createMany({ data: boots })
    await prisma.machine.createMany({ data: machines })

    await prisma.engine.createMany({ data: engines })
  })

  test('PUT: invalid body', async () => {
    await api
      .put(ENGINE_ROUTES.baseWithCode(FIRST_ENGINE_CODE))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('PUT: engine does not exist', async () => {
    const code = 'CB-00-MAQ-00-MOT-000'
    const { body } = await api
      .put(ENGINE_ROUTES.baseWithCode(code))
      .set('Accept', 'application/json')
      .send(UPDATE_ENGINE_DTO)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(engineNotFoundMessage(code))
  })
  test('PUT: update a engine by its code', async () => {
    const { body } = await api
      .put(ENGINE_ROUTES.baseWithCode(FIRST_ENGINE_CODE))
      .set('Accept', 'application/json')
      .send(UPDATE_ENGINE_DTO)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(UPDATED_ENGINE_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.engine.deleteMany()

    await prisma.machine.deleteMany()
    await prisma.boot.deleteMany()
    await prisma.technicalDocumentation.deleteMany()
    await prisma.criticality.deleteMany()
    await prisma.area.deleteMany()
  })
})
