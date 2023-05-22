import { v2 as cloudinary } from 'cloudinary'
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from '../config/environment'
import { ServiceError } from '../services'

type Folder = 'machines' | 'failure-reports'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

const { uploader } = cloudinary

export async function uploadFile(path: string, folder: Folder) {
  try {
    const { public_id, secure_url } = await uploader.upload(path, { folder })
    return { publicId: public_id, url: secure_url }
  } catch (error) {
    throw new ServiceError({ status: 500, message: 'Error con Cloudinary' })
  }
}

export async function deleteFile(publicId: string) {
  return await uploader.destroy(publicId)
}
