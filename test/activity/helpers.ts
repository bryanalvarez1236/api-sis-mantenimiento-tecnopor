import { Activity } from '@prisma/client'
import activityData from './activities.json'

export const activities: Activity[] = activityData as never as Activity[]

export const FIRST_ACTIVITY = activities[0]
