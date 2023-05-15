import { Area, Machine } from '@prisma/client'
import machineData from './machines.json'
import areaData from './areas.json'
import { serverRoute } from '../helpers/api'
import { machineRoute } from '../../src/routes/machine.routes'
import {
  CreateMachineDto,
  MachineResponseDto,
  UpdateMachineDto,
} from '../../src/schemas/machine'

export const machines: Machine[] = machineData as unknown as Machine[]
export const areas: Area[] = areaData

export const FIRST_MACHINE = machines[0]
export const FIRST_MACHINE_CODE = FIRST_MACHINE.code
export const FIRST_MACHINE_RESPONSE_DTO: MachineResponseDto = {
  area: {
    name: areas.find(({ id }) => FIRST_MACHINE.areaId === id)?.name || '',
  },
  code: FIRST_MACHINE.code,
  criticality: FIRST_MACHINE.criticality,
  image: null,
  location: FIRST_MACHINE.location,
  name: FIRST_MACHINE.name,
  engines: [],
  function: FIRST_MACHINE.function,
  maker: FIRST_MACHINE.maker,
  model: FIRST_MACHINE.model,
  specificData: FIRST_MACHINE.specificData,
  technicalDocumentation: FIRST_MACHINE.technicalDocumentation,
}

export const MACHINE_ROUTES = {
  base: `${serverRoute}${machineRoute}`,
  baseWithCode: (code: string) => `${serverRoute}${machineRoute}/${code}`,
}

export const CREATE_MACHINE_DTO: CreateMachineDto = {
  code: 'CB-02-PRH-01',
  name: 'PRENSA HIDRAULICA',
  location: 'LABORATORIO',
  areaId: 5,
  criticality: 'LOW',
  function: 'PRENSADO DE PROBETAS',
  specificData: '220 V',
  technicalDocumentation: [],
}
export const CREATED_MACHINE_RESPONSE_DTO: MachineResponseDto = {
  code: CREATE_MACHINE_DTO.code,
  name: CREATE_MACHINE_DTO.name,
  location: CREATE_MACHINE_DTO.location,
  criticality: CREATE_MACHINE_DTO.criticality,
  function: CREATE_MACHINE_DTO.function,
  specificData: CREATE_MACHINE_DTO.specificData,
  technicalDocumentation: CREATE_MACHINE_DTO.technicalDocumentation,
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
  criticality: FIRST_MACHINE.criticality,
  technicalDocumentation: [],
}
export const UPDATED_MACHINE_RESPONSE_DTO: MachineResponseDto = {
  code: FIRST_MACHINE_CODE,
  name: UPDATE_MACHINE_DTO.name,
  location: UPDATE_MACHINE_DTO.location,
  criticality: UPDATE_MACHINE_DTO.criticality,
  function: FIRST_MACHINE.function,
  specificData: FIRST_MACHINE.specificData,
  technicalDocumentation: UPDATE_MACHINE_DTO.technicalDocumentation,
  area: {
    name: areas.find(({ id }) => UPDATE_MACHINE_DTO.areaId === id)?.name || '',
  },
  image: { url: 'https://upload.mock/image.png' },
  maker: FIRST_MACHINE.maker ?? null,
  model: FIRST_MACHINE.model ?? null,
  engines: [],
}

export const ALL_MACHINES: MachineResponseDto[] = machines
  .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
  .map(({ code, name, location, criticality, areaId }) => ({
    code,
    name,
    location,
    criticality,
    area: { name: areas.find(({ id }) => id === areaId)?.name || '' },
    image: null,
  }))
