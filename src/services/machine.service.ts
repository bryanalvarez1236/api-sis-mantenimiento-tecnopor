import fileUpload, { UploadedFile } from 'express-fileupload'
import {
  CheckSelect,
  CreateArgsType,
  FindUniqueArgs,
  FindUniqueType,
  getCreateArgsConfig,
  getFindManyArgsConfig,
  getFindUniqueArgsConfig,
  getUpdateArgsConfig,
  JoinArgs,
  PRISMA_UNIQUE_ERROR_CODE,
  PromiseArray,
  ReturnCheck,
  ServiceError,
  ThrowError,
  UpdateArgsType,
} from '.'
import { deleteMachineImage, uploadMachineImage } from '../libs/cloudinary'
import prisma from '../libs/db'
import * as fs from 'fs-extra'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { CreateMachineDto, UpdateMachineDto } from '../schemas/machine'
import { Machine, MachineImage, Prisma } from '@prisma/client'

type MachineFindManyArgs = Prisma.MachineFindManyArgs
type MachineCreateArgs = Prisma.MachineCreateArgs
type MachineFindUniqueArgs = Prisma.MachineFindUniqueArgs
type MachineUpdateArgs = Prisma.MachineUpdateArgs

type MachineClient<
  T,
  D = { image: Pick<MachineImage, 'url' | 'publicId'> | null }
> = Prisma.Prisma__MachineClient<D extends null ? T : T & D>

type MachineGetPayload<T extends FindUniqueType<MachineFindUniqueArgs>> =
  Prisma.MachineGetPayload<T>

export const MACHINE_WITH_IMAGE: Prisma.MachineInclude = {
  image: { select: { url: true, publicId: true } },
}

type MachineWithImage = {
  include: {
    image: {
      select: {
        url: true
        publicId: true
      }
    }
  }
}

export function machineNotFound(machineCode: string): ThrowError {
  return {
    status: 404,
    message: `La máquina con el código '${machineCode}' no existe`,
  }
}

export async function getAllMachines<
  T extends MachineFindManyArgs,
  S extends PromiseArray<Machine>,
  J extends JoinArgs<T, MachineWithImage>,
  U extends PromiseArray<MachineGetPayload<J>>
>(config?: T): ReturnCheck<T, S, U> {
  const defaultConfig = getFindManyArgsConfig<MachineFindManyArgs>(
    { include: MACHINE_WITH_IMAGE, orderBy: { name: 'asc' } },
    config
  )
  return (await prisma.machine.findMany({
    ...defaultConfig,
  })) as never as CheckSelect<T, S, U>
}

export async function createMachine<
  T extends CreateArgsType<MachineCreateArgs>,
  S extends MachineClient<Machine>,
  J extends JoinArgs<T, MachineWithImage>,
  P extends MachineGetPayload<J>,
  U extends MachineClient<P, null>
>(
  body: CreateMachineDto,
  files: fileUpload.FileArray | null | undefined,
  config?: T
): ReturnCheck<T, S, U> {
  let data: CreateMachineDto = body
  try {
    if (files && files.image) {
      const { tempFilePath } = files.image as UploadedFile
      const { public_id, secure_url } = await uploadMachineImage(tempFilePath)
      await fs.unlink(tempFilePath)
      data = {
        ...data,
        image: { create: { publicId: public_id, url: secure_url } },
      }
    }
    const defaultConfig = getCreateArgsConfig<MachineCreateArgs>(
      { data, include: MACHINE_WITH_IMAGE },
      config
    )
    const newMachine = await prisma.machine.create({
      ...defaultConfig,
    })
    return newMachine as never as CheckSelect<T, S, U>
  } catch (error) {
    const { image } = data
    if (image) {
      const {
        create: { publicId },
      } = image
      await deleteMachineImage(publicId)
    }
    const { code } = error as PrismaClientKnownRequestError
    const throwError: ThrowError = {
      status: 500,
    }
    if (code && code === PRISMA_UNIQUE_ERROR_CODE) {
      const { code } = body
      throwError.message = `La máquina con el código '${code}' ya existe`
      throwError.status = 409
    }
    throw new ServiceError(throwError)
  }
}

export async function getMachineByCode<
  T extends FindUniqueType<MachineFindUniqueArgs>,
  S extends MachineClient<Machine>,
  J extends JoinArgs<T, MachineWithImage>,
  P extends MachineGetPayload<J>,
  U extends MachineClient<P, null>
>(
  machineCode: string,
  config?: FindUniqueArgs<T, MachineFindUniqueArgs>
): ReturnCheck<T, S, U> {
  const defaultConfig: MachineFindUniqueArgs = getFindUniqueArgsConfig(
    {
      where: { code: machineCode },
      include: MACHINE_WITH_IMAGE,
    },
    config
  )
  const foundMachine = await prisma.machine.findUnique({
    ...defaultConfig,
  })

  if (!foundMachine) {
    throw new ServiceError(machineNotFound(machineCode))
  }

  return foundMachine as unknown as CheckSelect<T, S, U>
}

export async function updateMachineByCode<
  T extends UpdateArgsType<MachineUpdateArgs>,
  S extends MachineClient<Machine>,
  J extends JoinArgs<T, MachineWithImage>,
  P extends MachineGetPayload<J>,
  U extends MachineClient<P, null>
>(
  machineCode: string,
  body: UpdateMachineDto,
  files: fileUpload.FileArray | null | undefined,
  config?: T
): ReturnCheck<T, S, U> {
  const foundMachine = await getMachineByCode(machineCode)
  let data: UpdateMachineDto = body
  try {
    let imagePublicId: string | undefined
    if (files && files.image) {
      const { tempFilePath } = files.image as UploadedFile
      const { public_id, secure_url } = await uploadMachineImage(tempFilePath)
      await fs.unlink(tempFilePath)
      data = {
        ...data,
        image: { create: { publicId: public_id, url: secure_url } },
      }
      const { image } = foundMachine
      if (image && data.image) {
        imagePublicId = image.publicId
        const {
          image: { create },
        } = data
        data.image = { update: create }
      }
    }
    const { technicalDocumentation } = data
    if (technicalDocumentation) {
      data.technicalDocumentation = [...technicalDocumentation]
    }
    const defaultConfig = getUpdateArgsConfig<MachineUpdateArgs>(
      {
        data,
        where: { code: machineCode },
        include: MACHINE_WITH_IMAGE,
      },
      config
    )
    const updatedMachine = await prisma.machine.update(defaultConfig)
    if (imagePublicId) {
      await deleteMachineImage(imagePublicId)
    }
    return updatedMachine as unknown as CheckSelect<T, S, U>
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}
