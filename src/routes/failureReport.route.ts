import { Router } from 'express'
import { validateBody } from '../middlewares/validate'
import { createFailureReportDto } from '../schemas/failureReport'
import {
  createFailureReport,
  getFailureReports,
} from '../controllers/failureReport.controllers'
import { failureReportTransformBody } from '../middlewares/failureReport.middlewares'

export const FAILURE_REPORT_WITH_MACHINE_ROUTE = '/:machineCode/report'

export function mergeFailureReportRouter(machineRouter: Router) {
  machineRouter.post(
    FAILURE_REPORT_WITH_MACHINE_ROUTE,
    failureReportTransformBody,
    validateBody(createFailureReportDto),
    createFailureReport
  )
}

export const FAILURE_REPORT_ROUTE = '/failure-report'
const failureReportRouter = Router()

failureReportRouter.get('/', getFailureReports)

export default failureReportRouter
