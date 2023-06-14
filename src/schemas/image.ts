import { UploadedFile } from 'express-fileupload'
import { z } from 'zod'

interface GenerateImageZodProps {
  required_error?: string
  invalid_type_error: string
}
export function generateImageZod({
  required_error,
  invalid_type_error,
}: GenerateImageZodProps) {
  const validateFile = (file?: UploadedFile[] | UploadedFile) => {
    if (file instanceof Array) {
      return false
    }
    if (file == null) {
      return required_error == null
    }
    return file.mimetype?.startsWith('image/')
  }
  const message =
    required_error == null
      ? invalid_type_error
      : (file?: object) => ({
          message: file == null ? required_error : invalid_type_error,
        })

  const transformFile = (file?: UploadedFile) => file?.tempFilePath

  return z.any().refine(validateFile, message).transform(transformFile)
}
