import type { Engine } from '@prisma/client'
import engineData from './engines.json'
import { serverRoute } from '../helpers/api'
import { machineRoute } from '../../src/routes/machine.routes'
import {
  ENGINE_ROUTE,
  ENGINE_WITH_MACHINE_ROUTE,
} from '../../src/routes/engine.routes'
import {
  CreateEngineDto,
  EngineResponseDto,
  UpdateEngineDto,
} from '../../src/schemas/engine'
import { boots } from '../boot/helpers'

export const engines: Engine[] = engineData as never as Engine[]

export const ENGINE_ROUTES = {
  baseWithMachine: (machineCode: string) =>
    `${serverRoute}${machineRoute}${ENGINE_WITH_MACHINE_ROUTE.replace(
      ':machineCode',
      machineCode
    )}`,
  baseWithCode: (code: string) => `${serverRoute}${ENGINE_ROUTE}/${code}`,
}

const FIRST_ENGINE = engines[0]
export const FIRST_ENGINE_CODE = FIRST_ENGINE.code

export const CREATE_ENGINE_DTO: CreateEngineDto = {
  code: 'CB-03-ABL-01-MOT-100',
  function: 'PALETAS ROTATIVAS',
  type: 'Y90S-4',
  powerHp: 1.5,
  powerKw: 1.1,
  voltage: '380 Y',
  current: '2.8',
  rpm: 1400,
  cosPhi: 0.814,
  performance: 0.78,
  frequency: 50,
  poles: 4,
  ip: 44,
  bootId: 1,
}
export const CREATED_ENGINE_RESPONSE_DTO: EngineResponseDto = {
  code: CREATE_ENGINE_DTO.code,
  function: CREATE_ENGINE_DTO.function,
  mark: CREATE_ENGINE_DTO.mark ?? null,
  type: CREATE_ENGINE_DTO.type ?? null,
  powerHp: CREATE_ENGINE_DTO.powerHp,
  powerKw: CREATE_ENGINE_DTO.powerKw,
  voltage: CREATE_ENGINE_DTO.voltage,
  current: CREATE_ENGINE_DTO.current,
  rpm: CREATE_ENGINE_DTO.rpm,
  cosPhi: CREATE_ENGINE_DTO.cosPhi,
  performance: CREATE_ENGINE_DTO.performance,
  frequency: CREATE_ENGINE_DTO.frequency,
  poles: CREATE_ENGINE_DTO.poles,
  ip: CREATE_ENGINE_DTO.ip,
  boot: boots.find(({ id }) => id === CREATE_ENGINE_DTO.bootId)?.name ?? '',
}

export const UPDATE_ENGINE_DTO: UpdateEngineDto = {
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
  bootId: 2,
}
export const UPDATED_ENGINE_RESPONSE_DTO: EngineResponseDto = {
  code: FIRST_ENGINE_CODE,
  function: UPDATE_ENGINE_DTO.function,
  mark: UPDATE_ENGINE_DTO.mark ?? null,
  type: UPDATE_ENGINE_DTO.type ?? null,
  powerHp: UPDATE_ENGINE_DTO.powerHp,
  powerKw: UPDATE_ENGINE_DTO.powerKw,
  voltage: UPDATE_ENGINE_DTO.voltage,
  current: UPDATE_ENGINE_DTO.current,
  rpm: UPDATE_ENGINE_DTO.rpm,
  cosPhi: UPDATE_ENGINE_DTO.cosPhi,
  performance: UPDATE_ENGINE_DTO.performance,
  frequency: UPDATE_ENGINE_DTO.frequency,
  poles: UPDATE_ENGINE_DTO.poles,
  ip: UPDATE_ENGINE_DTO.ip,
  boot: boots.find(({ id }) => id === UPDATE_ENGINE_DTO.bootId)?.name ?? '',
}
