import { Router } from 'express'
import {
  createActivity,
  deleteActivityByCode,
  getActivityByCode,
  getMachineActivities,
  updateActivityByCode,
} from '../controllers/activity.controllers'
import { validateBody } from '../middlewares/validate'
import { createActivityDto, updateActivityDto } from '../schemas/activity'

export const activityRoute = '/activities'

const activityRouter = Router()

activityRouter.get('/', getMachineActivities)
activityRouter.get('/:code', getActivityByCode)
activityRouter.post('/', validateBody(createActivityDto), createActivity)
activityRouter.put(
  '/:code',
  validateBody(updateActivityDto),
  updateActivityByCode
)
activityRouter.delete('/:code', deleteActivityByCode)

export default activityRouter
