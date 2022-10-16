import { v2 as cloudinary } from 'cloudinary'
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from '../config/environment'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

const { uploader } = cloudinary

export async function uploadMachineImage(filePath: string) {
  return await uploader.upload(filePath, { folder: 'machines' })
}

export async function deleteMachineImage(publicId: string) {
  return await uploader.destroy(publicId)
}
