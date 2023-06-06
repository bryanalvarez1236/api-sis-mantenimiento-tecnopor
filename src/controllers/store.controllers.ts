import { Request, Response } from 'express'
import {
  CreateStoreDto,
  UpdateStoreDto,
  VerifyStoreDto,
} from '../schemas/store'
import * as storeService from '../services/store.service'
import { ThrowError } from '../services'

export async function addStore(
  req: Request<{ machineCode: string }, never, CreateStoreDto>,
  res: Response
) {
  const { machineCode } = req.params
  const createDto = req.body
  try {
    const added = await storeService.addStore({ machineCode, createDto })
    return res.status(201).json(added)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function updateStoreById(
  req: Request<{ id: string }, never, UpdateStoreDto>,
  res: Response
) {
  const { id } = req.params
  const updateDto = req.body
  try {
    const updated = await storeService.updateStoreById({ id: +id, updateDto })
    return res.json(updated)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getAllStores(_req: Request, res: Response) {
  const stores = await storeService.getAllStores()
  return res.json(stores)
}

export async function deleteStoreById(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params
  try {
    const deleted = await storeService.deleteStoreById({ id: +id })
    return res.json(deleted)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}

export async function getFieldsToCreate(_req: Request, res: Response) {
  const fields = await storeService.getFieldsToCreate()
  return res.json(fields)
}

export async function verifyStore(
  req: Request<never, never, VerifyStoreDto>,
  res: Response
) {
  const store = req.body
  try {
    const verified = await storeService.verifyStore({ store })
    return res.json(verified)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
