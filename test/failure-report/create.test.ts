import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { api } from '../helpers/api'
import {
  CREATED_FAILURE_REPORT_RESPONSE_DTO,
  CREATE_FAILURE_REPORT_DTO,
  FAILURE_REPORT_ROUTES,
  MACHINE_CODE,
} from './helpers'
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

describe('Failure Report EndPoint => POST', () => {
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
      .post(FAILURE_REPORT_ROUTES.baseWithMachine(MACHINE_CODE))
      .attach('image', 'test/files/test-image.jpg')
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: machine does not exist', async () => {
    const machineCode = 'CB-00-PRX-00'
    const request = api
      .post(FAILURE_REPORT_ROUTES.baseWithMachine(machineCode))
      .attach('image', 'test/files/test-image.jpg')

    Object.entries(CREATE_FAILURE_REPORT_DTO).forEach(([key, value]) => {
      request.field(key, value)
    })

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(machineNotFoundMessage(machineCode))
  })
  test('POST: create a new failure report without image', async () => {
    const request = api.post(
      FAILURE_REPORT_ROUTES.baseWithMachine(MACHINE_CODE)
    )

    Object.entries(CREATE_FAILURE_REPORT_DTO).forEach(([key, value]) => {
      request.field(key, value)
    })

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual({
      ...CREATED_FAILURE_REPORT_RESPONSE_DTO,
      id: body.id,
      createdAt: body.createdAt,
    })
  })
  test('POST: create a new failure report with image', async () => {
    const request = api
      .post(FAILURE_REPORT_ROUTES.baseWithMachine(MACHINE_CODE))
      .attach('image', 'test/files/test-image.jpg')

    Object.entries(CREATE_FAILURE_REPORT_DTO).forEach(([key, value]) => {
      request.field(key, value)
    })

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(201)
    expect(body).toEqual({
      ...CREATED_FAILURE_REPORT_RESPONSE_DTO,
      id: body.id,
      createdAt: body.createdAt,
      image: { url: 'https://upload.mock/image.png' },
    })
  })

  afterAll(async () => {
    await prisma.failureReportImage.deleteMany()
    await prisma.failureReport.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.technicalDocumentation.deleteMany()
    await prisma.criticality.deleteMany()
    await prisma.area.deleteMany()
  })
})
