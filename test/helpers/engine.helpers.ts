import { Engine } from '@prisma/client'
import { z } from 'zod'
import { engineRoute, machineRoute } from '../../src/routes/machine.routes'
import { createEngineDto, updateEngineDto } from '../../src/schemas/engine'
import { serverRoute } from './api'
import {
  createdMachine,
  machineCodeNotExists,
  responseCreatedMachine,
} from './machine.helpers'

export const engineDate = new Date()

export const engineCodeNotExists = `${machineCodeNotExists}-MOT-000`
export const engineNotExistsMessage = `El motor con el código '${engineCodeNotExists}' no existe`
export const engineUpdateNotAcceptable = `El motor a actualizar no está disponible en la máquina con el código '${machineCodeNotExists}'`
export const engineGetNotAcceptable = `El motor no está disponible en la máquina con el código '${machineCodeNotExists}'`

export const ENGINE_ENDPOINT = (machineCode: string) =>
  `${serverRoute}${machineRoute}${engineRoute(machineCode)}`

type CreateEngineDto = z.infer<typeof createEngineDto>
type UpdateEngineDto = z.infer<typeof updateEngineDto>

interface EngineResponseDto extends Omit<Engine, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

export const createdEngine: CreateEngineDto = {
  code: 'CB-04-PRX-01-MOT-001',
  function: 'TRANSP. DE TORNILLO',
  mark: 'NIULU',
  type: 'Y100L-6',
  powerHp: 2,
  powerKw: 1.5,
  voltage: '380 Y',
  current: '4',
  rpm: 940,
  cosPhi: 0.76,
  performance: 0.75,
  frequency: 50,
  poles: 6,
  ip: 44,
  boot: 'DIRECT',
}

export const newEngine: CreateEngineDto = {
  code: 'CB-04-PRX-01-MOT-002',
  function: 'AGITADOR',
  mark: 'ZIK',
  type: 'Y132M-4',
  powerHp: 10,
  powerKw: 7.5,
  voltage: '380 ∆',
  current: '15.4',
  rpm: 1440,
  cosPhi: 0.89,
  performance: 0.84,
  frequency: 50,
  poles: 4,
  ip: 54,
  boot: 'SOFT',
}

export const updateEngine: UpdateEngineDto = {
  function: 'TRANSP. DE TORNILLO',
  mark: 'NIULU',
  type: 'Y100L-6',
  powerHp: 2,
  powerKw: 1.5,
  voltage: '380 Y',
  current: '4',
  rpm: 940,
  cosPhi: 0.76,
  performance: 0.75,
  frequency: 50,
  poles: 6,
  ip: 44,
  boot: 'SOFT',
}

const responseCreatedEngine: EngineResponseDto = {
  ...createdEngine,
  createdAt: engineDate.toISOString(),
  updatedAt: engineDate.toISOString(),
  machineCode: createdMachine.code,
}

export const responseNewEngine: EngineResponseDto = {
  ...newEngine,
  createdAt: '',
  updatedAt: '',
  machineCode: createdMachine.code,
}

export const responseUpdatedEngine: EngineResponseDto = {
  ...responseCreatedEngine,
  ...updateEngine,
}

export const createdMachineWithEngines = {
  ...responseCreatedMachine,
  engines: [responseCreatedEngine],
}
