import { Machine, MachineImage } from '@prisma/client'
import { z } from 'zod'
import { machineRoute } from '../../src/routes/machine.routes'
import { createMachineDto, updateMachineDto } from '../../src/schemas/machine'
import { serverRoute } from './api'

export const MACHINE_ENDPOINT = `${serverRoute}${machineRoute}`
export const machineCodeNotExists = 'does-not-exist'
export const machineNotExistsMessage = `La máquina con el código '${machineCodeNotExists}' no existe`

export type CreateMachineDto = z.infer<typeof createMachineDto>
type UpdateMachineDto = z.infer<typeof updateMachineDto>

export const mockedImage = {
  public_id: 'mocked-image',
  secure_url: 'https://../mocked-image.png',
}

interface MachineResponseDto extends Omit<Machine, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
  image?: {
    url: string
  }
}

export const machineDate = new Date()

export const createdMachine: CreateMachineDto = {
  code: 'CB-04-PRX-01',
  name: 'PRE EXPANSORA',
  maker: 'HANGZHOU FANGYUAN',
  location: 'EPS',
  area: 'PRE_EXPANDED',
  model: 'SPJ-130',
  specificData: '380 V',
  function: 'PREEXPANDIDO DE POLIESTIRENO',
  criticality: 'HIGH',
  technicalDocumentation: ['OPERATIONS_MANUAL', 'ELECTRICAL_PLANS'],
}

export const newMachine: CreateMachineDto = {
  code: 'CB-03-ABL-01',
  name: 'ABLANDADOR',
  maker: '-',
  location: 'EPS',
  area: 'PRESTRESSED_JOISTS',
  model: '-',
  specificData: 'SISTEMA AUTOMATICO CON 2 CABEZALES',
  function: 'ABLANDAR AGUA PARA CALDERO',
  criticality: 'LOW',
  technicalDocumentation: [],
}

export const createdMachineImage: Omit<MachineImage, 'id' | 'machineCode'> = {
  publicId: 'cloudinary-puclic-id',
  url: 'https://../created-machine-image.png',
}

export const updateMachine: UpdateMachineDto = {
  name: 'PRE EXPANSORA',
  maker: 'HANGZHOU FANGYUAN',
  location: 'EPS',
  area: 'PRE_EXPANDED',
  model: 'SPJ-130',
  specificData: '380 V',
  function: 'PREEXPANDIDO DE POLIESTIRENO',
  criticality: 'HIGH',
  technicalDocumentation: [
    'OPERATIONS_MANUAL',
    'MAINTENANCE_MANUAL',
    'ELECTRICAL_PLANS',
    'MECHANICAL_PLANS',
  ],
}

export const responseCreatedMachine: MachineResponseDto = {
  ...createdMachine,
  createdAt: machineDate.toISOString(),
  updatedAt: machineDate.toISOString(),
  image: {
    url: createdMachineImage.url,
  },
}

export const responseNewMachine: MachineResponseDto = {
  ...newMachine,
  createdAt: '',
  updatedAt: '',
  image: {
    url: mockedImage.secure_url,
  },
}

export const responseUpdatedMachine: MachineResponseDto = {
  ...responseCreatedMachine,
  ...updateMachine,
}

export const machines: MachineResponseDto[] = [responseCreatedMachine]
