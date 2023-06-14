import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import prisma from '../../src/libs/db'
import {
  CREATED_MACHINE_RESPONSE_DTO,
  CREATE_MACHINE_DTO,
  FIRST_MACHINE_CODE,
  MACHINE_ROUTES,
  machines,
} from './helpers'
import { api } from '../helpers/api'
import { machineAlreadyExists } from '../../src/services/machine.service'
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

describe('Machines EndPoint => POST', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.machine.createMany({ data: machines })
  })

  test('POST: invalid body', async () => {
    await api
      .post(MACHINE_ROUTES.base)
      .attach('image', 'test/files/test-image.jpg')
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: create a machine that already exists', async () => {
    const request = api
      .post(MACHINE_ROUTES.base)
      .attach('image', 'test/files/test-image.jpg')

    Object.entries({ ...CREATE_MACHINE_DTO, code: FIRST_MACHINE_CODE }).forEach(
      ([key, value]) => {
        if (value != null) {
          if (value instanceof Array) {
            value.forEach((value) => {
              request.field(key, value)
            })
          } else {
            request.field(key, value)
          }
        }
      }
    )

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(409)
    expect(body.message).toBe(machineAlreadyExists(FIRST_MACHINE_CODE))
  })
  test('POST: create a new machine', async () => {
    const request = api
      .post(MACHINE_ROUTES.base)
      .attach('image', 'test/files/test-image.jpg')

    Object.entries(CREATE_MACHINE_DTO).forEach(([key, value]) => {
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
      .expect(201)
    expect(body).toEqual(CREATED_MACHINE_RESPONSE_DTO)
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
