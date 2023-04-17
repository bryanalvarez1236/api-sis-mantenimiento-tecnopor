import { Machine } from '@prisma/client'
import machineData from './machines.json'

export const machines: Machine[] = machineData as unknown as Machine[]

export const FIRST_MACHINE = machines[0]
