import { ServiceError } from '.'
import prisma from '../libs/db'
import {
  CreateMachineData,
  CreateMachineDto,
  UpdateMachineData,
  UpdateMachineDto,
} from '../schemas/machine'
import { FileArray, UploadedFile } from 'express-fileupload'
import * as fs from 'fs-extra'
import { deleteFile, uploadFile } from '../libs/cloudinary'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

export function machineNotFoundMessage(machineCode: string) {
  return `La máquina con el código '${machineCode}' no existe`
}
export function machineAlreadyExists(machineCode: string) {
  return `La máquina con el código '${machineCode}' ya existe`
}
export function areaNotFoundMessage(areaId: number) {
  return `El área con el id '${areaId}' no existe`
}

export async function getMachines() {
  try {
    return await prisma.machine.findMany({
      select: {
        code: true,
        name: true,
        location: true,
        criticality: true,
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
      criticality: true,
      function: true,
      specificData: true,
      technicalDocumentation: true,
      areaId: true,
      area: { select: { name: true } },
      image: { select: { url: true } },
      engines: { orderBy: { code: 'asc' } },
    },
  })
  if (foundMachine == null) {
    throw new ServiceError({
      status: 404,
      message: machineNotFoundMessage(code),
    })
  }
  return foundMachine
}

interface CreateMachineProps {
  createDto: CreateMachineDto
  files?: FileArray | null
}
export async function createMachine({ createDto, files }: CreateMachineProps) {
  let data: CreateMachineData = { ...createDto }
  const { tempFilePath } = (files?.image as UploadedFile) || {}
  try {
    if (files && files.image) {
      const image = await uploadFile(tempFilePath, 'machines')
      await fs.unlink(tempFilePath)
      data = { ...data, image: { create: image } }
    }
    return await prisma.machine.create({
      data,
      select: {
        code: true,
        name: true,
        maker: true,
        model: true,
        location: true,
        criticality: true,
        function: true,
        specificData: true,
        technicalDocumentation: true,
        area: { select: { name: true } },
        image: { select: { url: true } },
        engines: { orderBy: { code: 'asc' } },
      },
    })
  } catch (error) {
    if (tempFilePath != null && fs.existsSync(tempFilePath)) {
      await fs.unlink(tempFilePath)
    }
    const { image } = data
    if (image != null) {
      const { publicId } = image.create
      await deleteFile(publicId)
    }
    if (error instanceof ServiceError) {
      throw error
    }
    if (error instanceof PrismaClientKnownRequestError) {
      const { code } = error
      if (code === 'P2002') {
        throw new ServiceError({
          status: 409,
          message: machineAlreadyExists(createDto.code),
        })
      }
      if (code === 'P2003') {
        throw new ServiceError({
          status: 404,
          message: areaNotFoundMessage(createDto.areaId),
        })
      }
    }
    throw new ServiceError({ status: 500 })
  }
}

interface UpdateMachineByCodeProps {
  code: string
  updateDto: UpdateMachineDto
  files?: FileArray | null
}
export async function updateMachineByCode({
  code,
  updateDto,
  files,
}: UpdateMachineByCodeProps) {
  let data: UpdateMachineData = updateDto
  const { tempFilePath } = (files?.image as UploadedFile) || {}
  try {
    const foundMachine = await getMachineByCode({ code })
    if (files && files.image) {
      const image = await uploadFile(tempFilePath, 'machines')
      await fs.unlink(tempFilePath)
      data = {
        ...data,
        image:
          foundMachine.image != null ? { update: image } : { create: image },
      }
    }
    return await prisma.machine.update({
      data,
      where: { code },
      select: {
        code: true,
        name: true,
        maker: true,
        model: true,
        location: true,
        criticality: true,
        function: true,
        specificData: true,
        technicalDocumentation: true,
        area: { select: { name: true } },
        image: { select: { url: true } },
        engines: { orderBy: { code: 'asc' } },
      },
    })
  } catch (error) {
    if (tempFilePath != null && fs.existsSync(tempFilePath)) {
      await fs.unlink(tempFilePath)
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new ServiceError({
        status: 404,
        message: areaNotFoundMessage(updateDto.areaId),
      })
    }
    if (error instanceof ServiceError) {
      throw error
    }
    throw new ServiceError({ status: 500 })
  }
}
