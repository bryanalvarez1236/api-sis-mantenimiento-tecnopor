import type { Engine } from '@prisma/client'
import engineData from './engines.json'
import { serverRoute } from '../helpers/api'
import { machineRoute } from '../../src/routes/machine.routes'
import {
  ENGINE_ROUTE,
  ENGINE_WITH_MACHINE_ROUTE,
} from '../../src/routes/engine.routes'
import { FIRST_MACHINE_CODE } from '../machine/helpers'
import { CreateEngineDto, UpdateEngineDto } from '../../src/schemas/engine'

type EngineResponseDto = Engine

export const engines: Engine[] = engineData as never as Engine[]
export const FIRST_ENGINE = engines[0]
export const FIRST_ENGINE_CODE = FIRST_ENGINE.code

export const ENGINE_ROUTES = {
  baseWithMachine: (machineCode: string) =>
    `${serverRoute}${machineRoute}${ENGINE_WITH_MACHINE_ROUTE.replace(
      ':machineCode',
      machineCode
    )}`,
  baseWithCode: (code: string) => `${serverRoute}${ENGINE_ROUTE}/${code}`,
}

export const CREATE_ENGINE_DTO: CreateEngineDto = {
  code: 'CB-04-PRX-01-MOT-007',
  function: 'PALETAS ROTATIVAS',
  mark: 'XIAOLAODA&KAPTEENI',
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
  boot: 'DIRECT',
}
export const CREATED_ENGINE_RESPONSE_DTO: EngineResponseDto = {
  ...CREATE_ENGINE_DTO,
  mark: CREATE_ENGINE_DTO.mark ?? null,
  type: CREATE_ENGINE_DTO.type ?? null,
  machineCode: FIRST_MACHINE_CODE,
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
  boot: 'SOFT',
}
export const UPDATED_ENGINE_RESPONSE_DTO: EngineResponseDto = {
  ...UPDATE_ENGINE_DTO,
  mark: UPDATE_ENGINE_DTO.mark ?? null,
  type: UPDATE_ENGINE_DTO.type ?? null,
  code: FIRST_ENGINE_CODE,
  machineCode: FIRST_MACHINE_CODE,
}

export const ALL_ENGINES: Engine[] = engines
  .filter(({ machineCode }) => machineCode === FIRST_MACHINE_CODE)
  .sort(({ code: c1 }, { code: c2 }) => c1.localeCompare(c2))
