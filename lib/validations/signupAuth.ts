import * as z from 'zod';

// Countries your backend supports
const SUPPORTED_COUNTRIES = [
  'NG', 'GH', 'CM', 'KE', 'ZA', 'ZW', 'UG',
  'IN', 'NP', 'CN',
  'GB', 'FR', 'ES', 'PT', 'CY',
  'US', 'CA', 'AU',
] as const;

const MIGRATION_STATUSES = [
  'planning',
  'in_transit',
  'arrived',
  'settled',
] as const;

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long'),

    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long'),

    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be under 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),

    email: z
      .string()
      .email('Invalid email address')
      .min(1, 'Email is required'),

    phone: z
      .string()
      .min(7, 'Phone number is too short')
      .max(20, 'Phone number is too long')
      .optional()
      .or(z.literal('')),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one capital letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),

    birthCountry: z
      .enum(SUPPORTED_COUNTRIES, {
        message: 'Please select your country of birth',
      }),

    currentCountry: z
      .enum(SUPPORTED_COUNTRIES, {
        message: 'Please select your current country',
      }),

    destinationCountry: z
      .enum(SUPPORTED_COUNTRIES, {
        message: 'Please select your destination country',
      })
      .optional(),

    city: z
      .string()
      .max(100, 'City name is too long')
      .optional()
      .or(z.literal('')),

    migrationStatus: z
      .enum(MIGRATION_STATUSES, {
        message: 'Please select your migration status',
      })
      .optional(),

    acceptedTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

// Country options for dropdowns
export const COUNTRY_OPTIONS = [
  { value: 'NG', label: '🇳🇬 Nigeria' },
  { value: 'GH', label: '🇬🇭 Ghana' },
  { value: 'CM', label: '🇨🇲 Cameroon' },
  { value: 'KE', label: '🇰🇪 Kenya' },
  { value: 'ZA', label: '🇿🇦 South Africa' },
  { value: 'ZW', label: '🇿🇼 Zimbabwe' },
  { value: 'UG', label: '🇺🇬 Uganda' },
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'NP', label: '🇳🇵 Nepal' },
  { value: 'CN', label: '🇨🇳 China' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'ES', label: '🇪🇸 Spain' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'CY', label: '🇨🇾 Cyprus' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'AU', label: '🇦🇺 Australia' },
] as const;

export const MIGRATION_STATUS_OPTIONS = [
  { value: 'planning',   label: 'Planning to Migrate' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'arrived',    label: 'Recently Arrived' },
  { value: 'settled',    label: 'Settled' },
] as const;
