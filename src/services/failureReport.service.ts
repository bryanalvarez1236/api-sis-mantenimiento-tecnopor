import type { UploadedFile, FileArray } from 'express-fileupload'
import * as fs from 'fs-extra'
import { ServiceError } from '.'
import prisma from '../libs/db'
import {
  CreateFailureReportDto,
  FailureReportResponseDto,
} from '../schemas/failureReport'
import { deleteFile, uploadFailureReportImage } from '../libs/cloudinary'
import { PrismaClientValidationError } from '@prisma/client/runtime'

interface CreateFailureReportData extends CreateFailureReportDto {
  machineCode: string
  image?: { create: { publicId: string; url: string } }
}
interface CreateFailureReportProps {
  machineCode: string
  createDto: CreateFailureReportDto
  files?: FileArray | null
}
export async function createFailureReport({
  machineCode,
  createDto,
  files,
}: CreateFailureReportProps): Promise<FailureReportResponseDto> {
  const machine = await prisma.machine.findUnique({
    where: { code: machineCode },
    select: { name: true },
  })
  if (machine == null) {
    throw new ServiceError({
      status: 404,
      message: `La máquina con el código '${machineCode}' no existe`,
    })
  }
  let data: CreateFailureReportData = { ...createDto, machineCode }
  try {
    if (files && files.image) {
      const { tempFilePath } = files.image as UploadedFile
      const { public_id, secure_url } = await uploadFailureReportImage(
        tempFilePath
      )
      await fs.unlink(tempFilePath)
      data = {
        ...data,
        image: { create: { publicId: public_id, url: secure_url } },
      }
    }
    const created = await prisma.failureReport.create({
      data,
      select: {
        id: true,
        systemFailedState: true,
        description: true,
        operatorName: true,
        stopHours: true,
        createdAt: true,
        image: { select: { url: true } },
      },
    })
    return { ...created, machine }
  } catch (error) {
    const { image } = data
    if (image != null) {
      const { publicId } = image.create
      await deleteFile(publicId)
    }
    throw new ServiceError({ status: 500 })
  }
}

export async function getFailureReports() {
  try {
    return await prisma.failureReport.findMany({
      where: { verified: false },
      select: {
        id: true,
        systemFailedState: true,
        description: true,
        operatorName: true,
        stopHours: true,
        createdAt: true,
        image: { select: { url: true } },
        machine: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    throw new ServiceError({ status: 500 })
  }
}

export async function verifyFailureReport(id: number) {
  try {
    const foundFailureReport = await prisma.failureReport.findUnique({
      where: { id },
    })
    if (foundFailureReport == null) {
      throw new ServiceError({
        status: 404,
        message: `El reporte de falla con el id '${id}' no existe`,
      })
    }
    return await prisma.failureReport.update({
      data: { verified: true },
      where: { id },
      select: { id: true },
    })
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error
    }
    if (error instanceof PrismaClientValidationError) {
      throw new ServiceError({
        status: 400,
        message: 'El id del reporte de falla debe ser un número',
      })
    }
    throw new ServiceError({ status: 500 })
  }
}
