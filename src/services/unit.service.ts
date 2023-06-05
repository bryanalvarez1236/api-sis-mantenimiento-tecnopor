import { ServiceError } from '.'
import prisma from '../libs/db'

export function unitNotFoundMessage(unitId: number) {
  return `La unidad con id '${unitId}' no existe`
}

interface GetUnitProps {
  name: string
}
export async function getUnitId({ name }: GetUnitProps) {
  const id = +name
  if (!isNaN(id)) {
    const unit = await prisma.unit.findUnique({
      where: { id },
      select: { id: true },
    })
    if (unit == null) {
      throw new ServiceError({ status: 404, message: unitNotFoundMessage(id) })
    }
    return unit.id
  }
  const unit = await prisma.unit.findUnique({
    where: { name },
    select: { id: true },
  })
  if (unit == null) {
    const { id } = await prisma.unit.create({
      data: { name },
      select: { id: true },
    })
    return id
  }
  return unit.id
}
