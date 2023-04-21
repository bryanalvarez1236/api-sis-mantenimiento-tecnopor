import { Router } from 'express'
import {
  getSchedule,
  workOrderOnSchedule,
} from '../controllers/schedule.controllers'

export const scheduleRoute = '/schedule'

const scheduleRouter = Router()

scheduleRouter.get('/', getSchedule)
scheduleRouter.put('/:id', workOrderOnSchedule)

export default scheduleRouter
