import {
  Activity,
  DraftWorkOrder,
  Machine,
  WorkOrderPriority,
} from '@prisma/client'
import { draftWorkOrderRoute } from '../../src/routes/draftWorkOrder.route'
import { serverRoute } from '../helpers/api'
import draftWorkOrderData from './draft-work-orders.json'
import { FIRST_WORK_ORDER } from '../work-order/helpers'
import { FIRST_ACTIVITY } from '../activity/helpers'
import { FIRST_MACHINE } from '../machine/helpers'

export const draftWorkOrders: DraftWorkOrder[] =
  draftWorkOrderData as never as DraftWorkOrder[]

interface DraftWorkOrderResponseDto
  extends Pick<DraftWorkOrder, 'code' | 'plannedDay'> {
  priority: WorkOrderPriority
  activity: Pick<Activity, 'name'>
  machine: Pick<Machine, 'name'>
}

export const CURRENT_DATE = new Date(2023, 3, 16)

export const DRAFT_WORK_ORDERS_ROUTES = {
  simple: `${serverRoute}${draftWorkOrderRoute}`,
}

const FIRST_DRAFT_WORK_ORDER = draftWorkOrders[0]
export const FIRST_DRAFT_WORK_ORDER_RESPONSE: DraftWorkOrderResponseDto = {
  code: FIRST_DRAFT_WORK_ORDER.code,
  plannedDay: FIRST_DRAFT_WORK_ORDER.plannedDay,
  priority: FIRST_WORK_ORDER.priority,
  activity: { name: FIRST_ACTIVITY.name },
  machine: { name: FIRST_MACHINE.name },
}
