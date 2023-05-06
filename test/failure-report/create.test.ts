import { beforeEach, describe, expect, test, vi } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { api } from '../helpers/api'
import {
  CREATED_FAILURE_REPORT_RESPONSE_DTO,
  CREATE_FAILURE_REPORT_DTO,
  FAILURE_REPORT_ROUTES,
  MACHINE_CODE,
} from './helpers'

vi.mock('../../src/libs/cloudinary', () => ({
  uploadFailureReportImage: vi.fn().mockImplementation(() => ({
    public_id: 'id',
    secure_url: 'https://upload.mock/image.png',
  })),
}))

beforeEach(async () => {
  await prisma.failureReportImage.deleteMany()
  await prisma.failureReport.deleteMany()
  await prisma.maintenanceRequest.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.createMany({ data: machines })
})

describe('Failure Report EndPoint => POST', () => {
  test('POST: invalid body', async () => {
    await api
      .post(FAILURE_REPORT_ROUTES.baseWithMachine(MACHINE_CODE))
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
  })
  test('POST: machine does not exist', async () => {
    const machineCode = 'CB-00-PRX-00'
    const request = api.post(FAILURE_REPORT_ROUTES.baseWithMachine(machineCode))

    Object.entries(CREATE_FAILURE_REPORT_DTO).forEach(([key, value]) => {
      request.field(key, value)
    })

    const { body } = await request
      .set('Accept', 'multipart/form-data')
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(
      `La máquina con el código '${machineCode}' no existe`
    )
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
})
