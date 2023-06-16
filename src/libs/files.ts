import { FileArray } from 'express-fileupload'
import * as fs from 'fs-extra'

export function deleteUploadedFiles(files: FileArray | null | undefined) {
  const paths = Object.values(files ?? []).flatMap((element) =>
    element instanceof Array
      ? element.map((element) => element.tempFilePath)
      : element.tempFilePath
  )
  for (const path of paths) {
    fs.unlinkSync(path)
  }
}
