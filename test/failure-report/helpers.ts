import { FAILURE_REPORT_WITH_MACHINE_ROUTE } from '../../src/routes/failureReport.route'
import { machineRoute } from '../../src/routes/machine.routes'
import {
  CreateFailureReportDto,
  FailureReportResponseDto,
} from '../../src/schemas/failureReport'
import { serverRoute } from '../helpers/api'
import { FIRST_MACHINE } from '../machine/helpers'

export const FAILURE_REPORT_ROUTES = {
  baseWithMachine: (machineCode: string) =>
    `${serverRoute}${machineRoute}${FAILURE_REPORT_WITH_MACHINE_ROUTE.replace(
      ':machineCode',
      machineCode
    )}`,
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
