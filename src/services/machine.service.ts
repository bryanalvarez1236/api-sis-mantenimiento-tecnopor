import { ServiceError } from '.'
import prisma from '../libs/db'
import {
  CreateMachineData,
  CreateMachineDto,
  UpdateMachineData,
  UpdateMachineDto,
} from '../schemas/machine'
import { deleteFile, uploadFile } from '../libs/cloudinary'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { getAllEngines } from './engine.service'

export function machineNotFoundMessage(machineCode: string) {
  return `La máquina con el código '${machineCode}' no existe`
}
export function machineAlreadyExists(machineCode: string) {
  return `La máquina con el código '${machineCode}' ya existe`
}

export async function getMachines() {
  try {
    return await prisma.machine.findMany({
      select: {
        code: true,
        name: true,
        location: true,
        criticality: { select: { name: true } },
        area: { select: { name: true } },
        image: { select: { url: true } },
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}

interface GetMachineByCodeProps {
  code: string
}
export async function getMachineByCode({ code }: GetMachineByCodeProps) {
  const foundMachine = await prisma.machine.findUnique({
    where: { code },
    select: {
      code: true,
      name: true,
      maker: true,
      model: true,
      location: true,
      criticality: { select: { name: true } },
      function: true,
      specificData: true,
      technicalDocumentation: {
        select: { name: true },
        orderBy: { id: 'asc' },
      },
      // areaId: true,
      area: { select: { name: true } },
      image: { select: { url: true } },
      // engines: { orderBy: { code: 'asc' } },
    },
  })
  if (foundMachine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(code),
    })
  }
  const engines = await getAllEngines({ machineCode: code })
  return { ...foundMachine, engines }
}

interface CreateMachineProps {
  createDto: CreateMachineDto
}
export async function createMachine({ createDto }: CreateMachineProps) {
  const { image: path, technicalDocumentation, ...restDto } = createDto
  let data = restDto as CreateMachineData
  try {
    if (path != null) {
      const image = await uploadFile(path, 'machines')
      data = { ...data, image: { create: image } }
    }
    return await prisma.machine.create({
      data: {
        ...data,
        technicalDocumentation: {
          connect: technicalDocumentation.map((id) => ({ id })),
        },
      },
      select: {
        code: true,
        name: true,
        maker: true,
        model: true,
        location: true,
        criticality: { select: { name: true } },
        function: true,
        specificData: true,
        technicalDocumentation: {
          select: { name: true },
          orderBy: { id: 'asc' },
        },
        area: { select: { name: true } },
        image: { select: { url: true } },
        engines: { orderBy: { code: 'asc' } },
      },
    })
  } catch (error) {
    const { image } = data
    if (image != null) {
      const { publicId } = image.create
      await deleteFile(publicId)
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ServiceError({
        status: 409,
        message: machineAlreadyExists(createDto.code),
      })
    }
    throw new ServiceError({ status: 500 })
  }
}

interface UpdateMachineByCodeProps {
  code: string
  updateDto: UpdateMachineDto
}
export async function updateMachineByCode({
  code,
  updateDto,
}: UpdateMachineByCodeProps) {
  const { image: path, technicalDocumentation, ...restDto } = updateDto
  let data = restDto as UpdateMachineData
  try {
    const foundMachine = await getMachineByCode({ code })
    if (path != null) {
      const image = await uploadFile(path, 'machines')
      data = {
        ...data,
        image:
          foundMachine.image != null ? { update: image } : { create: image },
      }
      if (foundMachine.image != null) {
        const image = await prisma.machineImage.findFirst({
          where: { url: foundMachine.image.url },
          select: { publicId: true },
        })
        if (image != null) {
          await deleteFile(image.publicId)
        }
      }
    }

    return await prisma.machine.update({
      data: {
        ...data,
        technicalDocumentation: {
          set: technicalDocumentation.map((id) => ({ id })),
        },
      },
      where: { code },
      select: {
        code: true,
        name: true,
        maker: true,
        model: true,
        location: true,
        criticality: { select: { name: true } },
        function: true,
        specificData: true,
        technicalDocumentation: {
          select: { name: true },
          orderBy: { id: 'asc' },
        },
        area: { select: { name: true } },
        image: { select: { url: true } },
        engines: { orderBy: { code: 'asc' } },
      },
    })
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error
    }
    throw new ServiceError({ status: 500 })
  }
}

export async function getFieldsToCreateMachine() {
  const areas = await prisma.area.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  })
  const criticalities = await prisma.criticality.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  })
  const technicalDocumentation = await prisma.technicalDocumentation.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  })
  return { areas, criticalities, technicalDocumentation }
}

interface GetFieldsToEditMachineProps {
  code: string
}
export async function getFieldsToUpdateMachine({
  code,
}: GetFieldsToEditMachineProps) {
  const foundMachine = await prisma.machine.findUnique({
    where: { code },
    select: {
      name: true,
      maker: true,
      location: true,
      areaId: true,
      model: true,
      function: true,
      specificData: true,
      criticalityId: true,
      image: { select: { url: true } },
      technicalDocumentation: { select: { id: true } },
    },
  })
  if (foundMachine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(code),
    })
  }
  const fields = await getFieldsToCreateMachine()
  const { image, technicalDocumentation, ...machine } = foundMachine

  return {
    fields,
    machine: {
      ...machine,
      code,
      image:
        image == null
          ? image
          : {
              src: image.url,
              alt: `Máquina ${machine.name}`,
              type: 'image/webp',
            },
      technicalDocumentation: technicalDocumentation.map(({ id }) => id),
    },
  }
}
