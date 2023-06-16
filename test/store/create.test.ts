import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { api } from '../helpers/api'
import {
  CREATED_DELETED_STORE_DTO,
  CREATED_STORE_RESPONSE_DTO,
  CREATE_DELETED_STORE_DTO,
  CREATE_STORE_DTO,
  DELETED_STORE,
  MACHINE_CODE,
  MACHINE_NAME,
  STORE_ALREADY_EXISTS,
  STORE_ROUTES,
} from './helpers'
import { machineNotFoundMessage } from '../../src/services/machine.service'
import { storeAlreadyExistsMessage } from '../../src/services/store.service'
import { units } from '../unit/helpers'
import { unitNotFoundMessage } from '../../src/services/unit.service'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'

describe('Store EndPoint => POST', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.machine.createMany({ data: machines })
    await prisma.unit.createMany({ data: units })
    await prisma.store.create({ data: STORE_ALREADY_EXISTS })
    await prisma.store.create({ data: DELETED_STORE })
  })

  test('POST: invalid body', async () => {
    await api
      .post(STORE_ROUTES.baseWithMachine(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })

  test('POST: machine does not exist', async () => {
    const machineCode = 'CB-00-MAQ-00'
    const { body } = await api
      .post(STORE_ROUTES.baseWithMachine(machineCode))
      .set('Accept', 'application/json')
      .send(CREATE_STORE_DTO)
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(machineCode))
  })

  test('POST: unit does not exist', async () => {
    const unitId = '-1'
    const { body } = await api
      .post(STORE_ROUTES.baseWithMachine(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send({ ...CREATE_STORE_DTO, unit: unitId })
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(unitNotFoundMessage(+unitId))
  })

  test('POST: store already exists', async () => {
    const machineName = MACHINE_NAME
    const storeName = STORE_ALREADY_EXISTS.name
    const { body } = await api
      .post(STORE_ROUTES.baseWithMachine(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send({ ...CREATE_STORE_DTO, name: storeName })
      .expect('Content-Type', /json/)
      .expect(409)
    expect(body.message).toBe(
      storeAlreadyExistsMessage({ machineName, storeName })
    )
  })

  test('POST: create a store', async () => {
    const { body } = await api
      .post(STORE_ROUTES.baseWithMachine(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send(CREATE_STORE_DTO)
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual({ ...CREATED_STORE_RESPONSE_DTO, id: body.id })
  })

  test('POST: create a store was deleted', async () => {
    const { body } = await api
      .post(STORE_ROUTES.baseWithMachine(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send(CREATE_DELETED_STORE_DTO)
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual({ ...CREATED_DELETED_STORE_DTO, id: body.id })
  })

  afterAll(async () => {
    await prisma.store.deleteMany()
    await prisma.unit.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.technicalDocumentation.deleteMany()
    await prisma.criticality.deleteMany()
    await prisma.area.deleteMany()
  })
})
