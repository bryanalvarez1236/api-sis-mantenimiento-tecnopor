import { Router } from 'express'
import { getIndicators } from '../controllers/indicator.controllers'

export const INDICATOR_ROUTE = '/indicators'

const indicatorRouter = Router()

indicatorRouter.get('/', getIndicators)

export default indicatorRouter
