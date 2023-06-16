import { FailureReport, FailureReportImage } from '@prisma/client'
import {
  FAILURE_REPORT_ROUTE,
  FAILURE_REPORT_WITH_MACHINE_ROUTE,
} from '../../src/routes/failureReport.route'
import { machineRoute } from '../../src/routes/machine.routes'
import {
  CreateFailureReportDto,
  FailureReportResponseDto,
} from '../../src/schemas/failureReport'
import { serverRoute } from '../helpers/api'
import { FIRST_MACHINE } from '../machine/helpers'
import failureReportData from './failureReports.json'
import failureReportImageData from './failureReportImages.json'

export const failureReports: FailureReport[] =
  failureReportData as never as FailureReport[]
export const failureReportImages: FailureReportImage[] = failureReportImageData

export const FAILURE_REPORT_ROUTES = {
  baseWithMachine: (machineCode: string) =>
    `${serverRoute}${machineRoute}${FAILURE_REPORT_WITH_MACHINE_ROUTE.replace(
      ':machineCode',
      machineCode
    )}`,
  base: `${serverRoute}${FAILURE_REPORT_ROUTE}`,
  baseWithId: (id: string) => `${serverRoute}${FAILURE_REPORT_ROUTE}/${id}`,
}

export const MACHINE_CODE = FIRST_MACHINE.code
export const CREATE_FAILURE_REPORT_DTO: CreateFailureReportDto = {
  description: 'DESCRIPCION DE POR QUE FALLO',
  operatorName: 'NOMBRE DEL OPERADOR',
  stopHours: 2,
  systemFailedState: 'OTHER',
}
export const CREATED_FAILURE_REPORT_RESPONSE_DTO: FailureReportResponseDto = {
  ...CREATE_FAILURE_REPORT_DTO,
  id: 1,
  createdAt: new Date(),
  machine: { name: FIRST_MACHINE.name },
  image: null,
}

export const ALL_FAILURE_REPORTS: FailureReportResponseDto[] = failureReports
  .filter(({ verified }) => !verified)
  .map(
    ({
      id,
      systemFailedState,
      description,
      operatorName,
      stopHours,
      createdAt,
    }) => ({
      id,
      systemFailedState,
      description,
      operatorName,
      stopHours,
      createdAt,
      machine: { name: 'PRE EXPANSORA' },
      image:
        failureReportImages
          .filter(({ failureReportId }) => failureReportId === id)
          .map(({ url }) => ({ url }))[0] ?? null,
    })
  )
