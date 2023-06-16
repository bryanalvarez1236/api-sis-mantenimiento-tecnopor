import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import prisma from '../../src/libs/db'
import {
  FIRST_MACHINE_CODE,
  MACHINE_ROUTES,
  UPDATED_MACHINE_RESPONSE_DTO,
  UPDATE_MACHINE_DTO,
  machines,
} from './helpers'
import { api } from '../helpers/api'
import { machineNotFoundMessage } from '../../src/services/machine.service'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'

vi.mock('../../src/libs/cloudinary', () => ({
  uploadFile: vi.fn().mockImplementation(() => ({
    publicId: 'id',
    url: 'https://upload.mock/image.png',
  })),
  deleteFile: vi.fn(),
}))

describe('Machines EndPoint => PUT', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.machine.createMany({ data: machines })
  })

  test('PUT: invalid body', async () => {
    await api
      .put(MACHINE_ROUTES.baseWithCode(FIRST_MACHINE_CODE))
      .attach('image', 'test/files/test-image.jpg')
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('PUT: machine does not exist', async () => {
    const code = 'CB-00-MAQ-00'
    const request = api
      .put(MACHINE_ROUTES.baseWithCode(code))
      .attach('image', 'test/files/test-image.jpg')

    Object.entries(UPDATE_MACHINE_DTO).forEach(([key, value]) => {
      if (value != null) {
        if (value instanceof Array) {
          value.forEach((value) => {
            request.field(key, value)
          })
        } else {
          request.field(key, value)
        }
      }
    })

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(code))
  })
  test('PUT: update a machine', async () => {
    const request = api
      .put(MACHINE_ROUTES.baseWithCode(FIRST_MACHINE_CODE))
      .attach('image', 'test/files/test-image.jpg')

    Object.entries(UPDATE_MACHINE_DTO).forEach(([key, value]) => {
      if (value != null) {
        if (value instanceof Array) {
          value.forEach((value) => {
            request.field(key, value)
          })
        } else {
          request.field(key, value)
        }
      }
    })

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(UPDATED_MACHINE_RESPONSE_DTO)
  })

  afterAll(async () => {
    await prisma.$queryRaw`DELETE FROM "_MachineTechnicalDocumentation"`
    await prisma.machineImage.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.technicalDocumentation.deleteMany()
    await prisma.criticality.deleteMany()
    await prisma.area.deleteMany()
  })
})
