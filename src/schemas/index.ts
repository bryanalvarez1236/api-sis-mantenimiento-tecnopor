import { z, ZodErrorMap } from 'zod'

interface ValidateDecimalProps {
  value: number
  precision: number
  scale: number
}

interface ZodDecimalParams {
  description?: string
  errorMap?: ZodErrorMap
  invalid_type_error?: string
  required_error?: string
  precision: number
  scale: number
  messageError: string
}

function validateDecimal({ value, precision, scale }: ValidateDecimalProps) {
  const integerCount = precision - scale
  let [integerPart, decimalPart]: (number | string | undefined)[] =
    `${value}`.split('.')

  integerPart = integerPart.length
  decimalPart = decimalPart ? decimalPart.length : 0

  return integerPart <= integerCount && decimalPart <= scale
}

export function createZodDecimal({
  precision,
  scale,
  messageError,
  ...rest
}: ZodDecimalParams) {
  return z
    .number({ ...rest })
    .refine((value) => validateDecimal({ value, precision, scale }), {
      message: messageError,
    })
}
