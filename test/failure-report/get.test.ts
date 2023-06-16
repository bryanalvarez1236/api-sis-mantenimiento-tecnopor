import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import prisma from '../../src/libs/db'
import { machines } from '../machine/helpers'
import {
  ALL_FAILURE_REPORTS,
  FAILURE_REPORT_ROUTES,
  failureReportImages,
  failureReports,
} from './helpers'
import { api } from '../helpers/api'
import { areas } from '../area/helpers'
import { criticalities } from '../criticality/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'

describe('Failure Report EndPoint => GET', () => {
  beforeAll(async () => {
    await prisma.area.createMany({ data: areas })
    await prisma.criticality.createMany({ data: criticalities })
    await prisma.technicalDocumentation.createMany({
      data: technicalDocumentation,
    })
    await prisma.machine.createMany({ data: machines })
    await prisma.failureReport.createMany({ data: failureReports })
    await prisma.failureReportImage.createMany({ data: failureReportImages })
  })

  test('GET: get all failure report that they have not been verified', async () => {
    const { body } = await api
      .get(FAILURE_REPORT_ROUTES.base)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(body).toEqual(ALL_FAILURE_REPORTS)
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
