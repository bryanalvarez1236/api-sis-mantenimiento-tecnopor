import { Router } from 'express'
import {
  getHistorical,
  getHistoricalSummary,
} from '../controllers/historical.controllers'

export const HISTORICAL_WITH_MACHINE_ROUTE = '/:machineCode/historical'

export function mergeHistoricalRouter(machineRouter: Router) {
  machineRouter.get(HISTORICAL_WITH_MACHINE_ROUTE, getHistorical)
  machineRouter.get(
    `${HISTORICAL_WITH_MACHINE_ROUTE}/summary`,
    getHistoricalSummary
  )
}
