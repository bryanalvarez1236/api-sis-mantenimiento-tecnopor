import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { areas, machines } from '../machine/helpers'
import {
  FAILURE_REPORT_ROUTES,
  failureReportImages,
  failureReports,
} from './helpers'
import { api } from '../helpers/api'

describe('Failure Report EndPoint => PATCH', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.machine.createMany({ data: machines })
    await prisma.failureReport.createMany({ data: failureReports })
    await prisma.failureReportImage.createMany({ data: failureReportImages })
  })

  test('PATCH: invalid id', async () => {
    const { body } = await api
      .patch(FAILURE_REPORT_ROUTES.baseWithId('ID_INVALID'))
      .expect('Content-Type', /json/)
      .expect(400)
    expect(body.message).toBe('El id del reporte de falla debe ser un número')
  })
  test('PATCH: failure report does not exist', async () => {
    const id = '0'
    const { body } = await api
      .patch(FAILURE_REPORT_ROUTES.baseWithId(id))
      .expect('Content-Type', /json/)
      .expect(404)
    expect(body.message).toBe(`El reporte de falla con el id '${id}' no existe`)
  })
  test('PATCH: failure report verified', async () => {
    const id = '1'
    const { body } = await api
      .patch(FAILURE_REPORT_ROUTES.baseWithId(id))
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual({ id: +id })
  })

  afterAll(async () => {
    await prisma.failureReportImage.deleteMany()
    await prisma.failureReport.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.area.deleteMany()
  })
})
