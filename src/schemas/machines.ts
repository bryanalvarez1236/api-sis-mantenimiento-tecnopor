import { z } from 'zod'

export const createMachineDTO = z.object({
  code: z.string({ required_error: 'Code is required' }),
  name: z.string({ required_error: 'Name is required' }),
  maker: z.string({ required_error: 'Maker is required' }),
  location: z.string({ required_error: 'Location is required' }),
  model: z.string({ required_error: 'Model is required' }),
  specificData: z.string({ required_error: 'Specific Data is required' }),
  function: z.string({ required_error: 'Function is required' }),
  technicalDocumentation: z
    .set(
      z.enum([
        'OPERATIONS_MANUAL',
        'MAINTENANCE_MANUAL',
        'ELECTRICAL_PLANS',
        'MECHANICAL_PLANS',
      ])
    )
    .optional(),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    required_error: 'Criticality is required',
  }),
})

export const updateMachineDTO = z.object({
  name: z.string().optional(),
  maker: z.string().optional(),
  location: z.string().optional(),
  model: z.string().optional(),
  specificData: z.string().optional(),
  function: z.string().optional(),
  technicalDocumentation: z
    .set(
      z.enum([
        'OPERATIONS_MANUAL',
        'MAINTENANCE_MANUAL',
        'ELECTRICAL_PLANS',
        'MECHANICAL_PLANS',
      ])
    )
    .optional(),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
})
