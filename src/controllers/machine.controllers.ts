import prisma from '../libs/db'
import { Request, Response } from 'express'
import { deleteMachineImage, uploadMachineImage } from '../libs/cloudinary'
import { UploadedFile } from 'express-fileupload'
import fs from 'fs-extra'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

export async function getAllMachines(_req: Request, res: Response) {
  const machines = await prisma.machine.findMany({
    include: { image: { select: { url: true } } },
  })
  return res.json(machines)
}

export async function createMachine(req: Request, res: Response) {
  const { body, files } = req
  let data = body
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
    const { technicalDocumentation } = data
    if (technicalDocumentation) {
      data.technicalDocumentation = [...technicalDocumentation]
    }
    const newMachine = await prisma.machine.create({
      data,
      include: { image: { select: { url: true } } },
    })
    return res.status(201).json(newMachine)
  } catch (error) {
    const { image } = data
    if (image) {
      const {
        create: { publicId },
      } = image
      await deleteMachineImage(publicId)
    }
    const { code } = error as PrismaClientKnownRequestError
    if (code && code === 'P2002') {
      const { code } = body
      return res
        .status(409)
        .json({ message: `La máquina con el código '${code}' ya existe` })
    } else {
      console.log({ error })
      return res.status(500).json(error)
    }
  }
}

export async function getMachineByCode(req: Request, res: Response) {
  const {
    params: { code },
  } = req
  const machine = await prisma.machine.findUnique({
    where: { code },
    include: { image: { select: { url: true } } },
  })
  if (!machine) {
    return res
      .status(404)
      .json({ message: `No existe la máquina con el código '${code}'` })
  }
  return res.json(machine)
}

export async function updateMachine(req: Request, res: Response) {
  const {
    params: { code },
  } = req
  const foundMachine = await prisma.machine.findUnique({
    where: { code },
    include: { image: { select: { publicId: true } } },
  })

  if (!foundMachine) {
    return res
      .status(404)
      .json({ message: `No existe la máquina con el código '${code}'` })
  }

  const { body, files } = req
  let data = body
  try {
    let imagePublicId
    if (files && files.image) {
      const { tempFilePath } = files.image as UploadedFile
      const { public_id, secure_url } = await uploadMachineImage(tempFilePath)
      await fs.unlink(tempFilePath)
      data = {
        ...data,
        image: { create: { publicId: public_id, url: secure_url } },
      }
      const { image } = foundMachine
      if (image) {
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
    const updatedMachine = await prisma.machine.update({
      data,
      where: { code },
      include: { image: { select: { url: true } } },
    })
    if (imagePublicId) {
      await deleteMachineImage(imagePublicId)
    }
    return res.json(updatedMachine)
  } catch (error) {
    console.log({ error })
    return res.status(500).json(error)
  }
}
