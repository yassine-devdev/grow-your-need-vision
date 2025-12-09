/**
 * Validation Utilities
 * Provides common validation functions and schemas
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate a single field against a rule
 */
export const validateField = (value: any, rule: ValidationRule): string | null => {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!value && !rule.required) {
    return null;
  }

  // Type conversions
  const stringValue = String(value).trim();
  const numberValue = Number(value);

  // Min length validation
  if (rule.minLength && stringValue.length < rule.minLength) {
    return `Must be at least ${rule.minLength} characters long`;
  }

  // Max length validation
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `Must be no more than ${rule.maxLength} characters long`;
  }

  // Min value validation
  if (rule.min !== undefined && numberValue < rule.min) {
    return `Must be at least ${rule.min}`;
  }

  // Max value validation
  if (rule.max !== undefined && numberValue > rule.max) {
    return `Must be no more than ${rule.max}`;
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return 'Invalid format';
  }

  // Email validation
  if (rule.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(stringValue)) {
      return 'Invalid email address';
    }
  }

  // URL validation
  if (rule.url) {
    try {
      new URL(stringValue);
    } catch {
      return 'Invalid URL';
    }
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

/**
 * Validate data against a schema
 */
export const validateSchema = (data: Record<string, any>, schema: ValidationSchema): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const error = validateField(data[field], rule);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation schemas
export const commonSchemas = {
  email: {
    required: true,
    email: true,
    maxLength: 255,
  } as ValidationRule,

  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/(?=.*[@$!%*?&])/.test(value)) {
        return 'Password must contain at least one special character';
      }
      return null;
    },
  } as ValidationRule,

  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    custom: (value: string) => {
      if (!/^[a-zA-Z]/.test(value)) {
        return 'Username must start with a letter';
      }
      return null;
    },
  } as ValidationRule,

  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
  } as ValidationRule,

  phone: {
    required: false,
    pattern: /^\+?[\d\s\-\(\)]+$/,
    custom: (value: string) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        return 'Phone number must be between 10 and 15 digits';
      }
      return null;
    },
  } as ValidationRule,

  zipCode: {
    required: true,
    pattern: /^\d{5}(-\d{4})?$/,
  } as ValidationRule,

  url: {
    required: false,
    url: true,
    maxLength: 2048,
  } as ValidationRule,

  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
  } as ValidationRule,

  description: {
    required: true,
    minLength: 10,
    maxLength: 2000,
  } as ValidationRule,

  price: {
    required: true,
    min: 0,
    max: 999999.99,
    custom: (value: number) => {
      if (value < 0) {
        return 'Price cannot be negative';
      }
      return null;
    },
  } as ValidationRule,

  quantity: {
    required: true,
    min: 0,
    max: 999999,
    custom: (value: number) => {
      if (!Number.isInteger(value)) {
        return 'Quantity must be a whole number';
      }
      return null;
    },
  } as ValidationRule,

  rating: {
    required: false,
    min: 0,
    max: 5,
    custom: (value: number) => {
      if (value < 0 || value > 5) {
        return 'Rating must be between 0 and 5';
      }
      return null;
    },
  } as ValidationRule,
};

// Validation schemas for common forms
export const validationSchemas = {
  login: {
    email: commonSchemas.email,
    password: {
      required: true,
      minLength: 1,
    } as ValidationRule,
  },

  register: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    passwordConfirm: {
      required: true,
      custom: (value: string, formData: Record<string, any>) => {
        if (value !== formData.password) {
          return 'Passwords do not match';
        }
        return null;
      },
    } as ValidationRule,
    username: commonSchemas.username,
    name: commonSchemas.name,
  },

  profile: {
    name: commonSchemas.name,
    email: commonSchemas.email,
    username: commonSchemas.username,
    phone: commonSchemas.phone,
  },

  product: {
    title: commonSchemas.title,
    description: commonSchemas.description,
    price: commonSchemas.price,
    category: {
      required: true,
      minLength: 1,
    } as ValidationRule,
  },

  media: {
    title: commonSchemas.title,
    description: commonSchemas.description,
    type: {
      required: true,
      custom: (value: string) => {
        if (!['Movie', 'Series', 'Documentary'].includes(value)) {
          return 'Type must be Movie, Series, or Documentary';
        }
        return null;
      },
    } as ValidationRule,
    genre: {
      required: true,
      minLength: 1,
    } as ValidationRule,
    rating: commonSchemas.rating,
  },

  address: {
    street: {
      required: true,
      minLength: 5,
      maxLength: 200,
    } as ValidationRule,
    city: {
      required: true,
      minLength: 2,
      maxLength: 100,
    } as ValidationRule,
    state: {
      required: true,
      minLength: 2,
      maxLength: 100,
    } as ValidationRule,
    zipCode: commonSchemas.zipCode,
    country: {
      required: true,
      minLength: 2,
      maxLength: 100,
    } as ValidationRule,
  },
};

/**
 * Validate form data with cross-field validation support
 */
export const validateForm = (
  data: Record<string, any>,
  schema: ValidationSchema
): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const error = validateField(data[field], rule);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Check if a value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Format validation error messages
 */
export const formatErrors = (errors: Record<string, string>): string[] => {
  return Object.values(errors).filter(Boolean);
};