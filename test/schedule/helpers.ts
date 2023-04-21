import { serverRoute } from '../helpers/api'
import { scheduleRoute } from '../../src/routes/schedule.routes'

export const SCHEDULE_ROUTES = {
  simple: `${serverRoute}${scheduleRoute}`,
}
