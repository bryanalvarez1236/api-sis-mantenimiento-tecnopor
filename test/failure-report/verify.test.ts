import { beforeEach, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import { FAILURE_REPORT_ROUTES, failureReports } from './helpers'
import { api } from '../helpers/api'

beforeEach(async () => {
  await prisma.failureReportImage.deleteMany()
  await prisma.failureReport.deleteMany()
  await prisma.maintenanceRequest.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.machine.createMany({ data: machines })
  await prisma.failureReport.createMany({
    data: failureReports,
  })
})

describe('Failure Report EndPoint => PATCH', () => {
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
})
