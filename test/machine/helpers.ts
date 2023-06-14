import { Machine } from '@prisma/client'
import machineData from './machines.json'
import { serverRoute } from '../helpers/api'
import { machineRoute } from '../../src/routes/machine.routes'
import {
  CreateMachineDto,
  MachineResponseDto,
  UpdateMachineDto,
} from '../../src/schemas/machine'
import { criticalities } from '../criticality/helpers'
import { areas } from '../area/helpers'
import { technicalDocumentation } from '../technical-documentation/helpers'

export const machines: Machine[] = machineData as unknown as Machine[]

export const MACHINE_ROUTES = {
  base: `${serverRoute}${machineRoute}`,
  baseWithCode: (code: string) => `${serverRoute}${machineRoute}/${code}`,
}

export const FIRST_MACHINE = machines[0]
export const FIRST_MACHINE_CODE = FIRST_MACHINE.code
export const FIRST_MACHINE_RESPONSE_DTO: MachineResponseDto = {
  criticality: {
    name:
      criticalities.find(({ id }) => id === FIRST_MACHINE.criticalityId)
        ?.name ?? '',
  },
  area: {
    name: areas.find(({ id }) => FIRST_MACHINE.areaId === id)?.name || '',
  },
  code: FIRST_MACHINE.code,
  image: null,
  location: FIRST_MACHINE.location,
  name: FIRST_MACHINE.name,
  engines: [],
  function: FIRST_MACHINE.function ?? null,
  maker: FIRST_MACHINE.maker ?? null,
  model: FIRST_MACHINE.model ?? null,
  specificData: FIRST_MACHINE.specificData ?? null,
  technicalDocumentation: [],
}

export const CREATE_MACHINE_DTO: CreateMachineDto = {
  code: 'CB-04-PRX-02',
  name: 'PRE EXPANSORA #2',
  location: 'LABORATORIO',
  areaId: 5,
  criticalityId: 3,
  function: 'PRENSADO DE PROBETAS',
  specificData: '220 V',
  technicalDocumentation: [4, 1, 3],
}
export const CREATED_MACHINE_RESPONSE_DTO: MachineResponseDto = {
  code: CREATE_MACHINE_DTO.code,
  name: CREATE_MACHINE_DTO.name,
  location: CREATE_MACHINE_DTO.location,
  criticality: {
    name:
      criticalities.find(({ id }) => id === CREATE_MACHINE_DTO.criticalityId)
        ?.name ?? '',
  },
  function: CREATE_MACHINE_DTO.function,
  specificData: CREATE_MACHINE_DTO.specificData ?? null,
  technicalDocumentation: CREATE_MACHINE_DTO.technicalDocumentation
    .map(
      (id) =>
        technicalDocumentation.find((td) => td.id === id) ?? { id: 0, name: '' }
    )
    .sort(({ id: id1 }, { id: id2 }) => id1 - id2)
    .map(({ name }) => ({ name })),
  area: {
    name: areas.find(({ id }) => CREATE_MACHINE_DTO.areaId === id)?.name || '',
  },
  image: { url: 'https://upload.mock/image.png' },
  maker: CREATE_MACHINE_DTO.maker ?? null,
  model: CREATE_MACHINE_DTO.model ?? null,
  engines: [],
}

export const UPDATE_MACHINE_DTO: UpdateMachineDto = {
  name: FIRST_MACHINE.name,
  location: FIRST_MACHINE.location,
  areaId: FIRST_MACHINE.areaId,
  criticalityId: FIRST_MACHINE.criticalityId,
  technicalDocumentation: [1],
}
export const UPDATED_MACHINE_RESPONSE_DTO: MachineResponseDto = {
  code: FIRST_MACHINE_CODE,
  name: UPDATE_MACHINE_DTO.name,
  location: UPDATE_MACHINE_DTO.location,
  criticality: {
    name:
      criticalities.find(({ id }) => id === UPDATE_MACHINE_DTO.criticalityId)
        ?.name ?? '',
  },
  function: UPDATE_MACHINE_DTO.function ?? null,
  specificData: UPDATE_MACHINE_DTO.specificData ?? null,
  technicalDocumentation: UPDATE_MACHINE_DTO.technicalDocumentation
    .map(
      (id) =>
        technicalDocumentation.find((td) => td.id === id) ?? { id: 0, name: '' }
    )
    .sort(({ id: id1 }, { id: id2 }) => id1 - id2)
    .map(({ name }) => ({ name })),
  area: {
    name: areas.find(({ id }) => UPDATE_MACHINE_DTO.areaId === id)?.name || '',
  },
  image: { url: 'https://upload.mock/image.png' },
  maker: UPDATE_MACHINE_DTO.maker ?? null,
  model: UPDATE_MACHINE_DTO.model ?? null,
  engines: [],
}

export const ALL_MACHINES: MachineResponseDto[] = machines
  .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
  .map(({ code, name, location, criticalityId, areaId }) => ({
    code,
    name,
    location,
    criticality: {
      name: criticalities.find(({ id }) => id === criticalityId)?.name ?? '',
    },
    area: { name: areas.find(({ id }) => id === areaId)?.name || '' },
    image: null,
  }))
