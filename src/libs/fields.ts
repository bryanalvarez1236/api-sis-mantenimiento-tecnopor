type DefaultValue = null

interface FieldProps {
  field?: string | null
  defaultValue?: DefaultValue
}

function cleanUnnecessarySpaces({ field, defaultValue }: FieldProps) {
  if (defaultValue !== undefined && (field == null || field === '')) {
    return defaultValue
  }
  return field?.replace(/ {2,}/g, ' ').trim()
}

export function transformFieldToUppercase({ field, defaultValue }: FieldProps) {
  if (defaultValue !== undefined && (field == null || field === '')) {
    return defaultValue
  }
  return cleanUnnecessarySpaces({ field })?.toUpperCase()
}

export function validateOptionalField(field: FieldProps['field']) {
  if (field == null) {
    return true
  }
  return /^(([A-Z]|\d){1,}|-$)/.test(field)
}
