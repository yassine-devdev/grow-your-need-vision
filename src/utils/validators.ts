export const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  // Min 8 chars, 1 upper, 1 lower, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && value !== null && Object.keys(value as Record<string, unknown>).length === 0) return true;
  return false;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Additional validators
export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation (can be enhanced for specific formats)
  const re = /^[\d\s\-\+\(\)]{10,}$/;
  return re.test(phone);
};

export const isValidDate = (date: string): boolean => {
  const parsed = Date.parse(date);
  return !isNaN(parsed);
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const hasMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

export const hasMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

// Form-specific validators
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

interface AssignmentInput {
  title?: string;
  description?: string;
  due_date?: string;
  points?: number | string;
}

export const validateAssignment = (data: AssignmentInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.title)) {
    errors.title = 'Title is required';
  } else if (data.title && !hasMinLength(data.title, 3)) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (isEmpty(data.description)) {
    errors.description = 'Description is required';
  }

  if (isEmpty(data.due_date)) {
    errors.due_date = 'Due date is required';
  } else if (data.due_date && !isValidDate(data.due_date)) {
    errors.due_date = 'Invalid date format';
  }

  if (data.points !== undefined && data.points !== null) {
      const points = Number(data.points);
      if (isNaN(points) || !isInRange(points, 0, 1000)) {
        errors.points = 'Points must be between 0 and 1000';
      }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

interface EnrollmentInput {
  student_id?: string;
  course_id?: string;
  enrollment_date?: string;
}

export const validateEnrollment = (data: EnrollmentInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.student_id)) {
    errors.student_id = 'Student is required';
  }

  if (isEmpty(data.course_id)) {
    errors.course_id = 'Course is required';
  }

  if (isEmpty(data.enrollment_date)) {
    errors.enrollment_date = 'Enrollment date is required';
  } else if (data.enrollment_date && !isValidDate(data.enrollment_date)) {
    errors.enrollment_date = 'Invalid date format';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

interface GradeInput {
  student_id?: string;
  score?: number | string;
}

export const validateGrade = (data: GradeInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.student_id)) {
    errors.student_id = 'Student is required';
  }

  if (data.score === undefined || data.score === null) {
    errors.score = 'Score is required';
  } else {
      const score = Number(data.score);
      if (isNaN(score) || !isInRange(score, 0, 100)) {
        errors.score = 'Score must be between 0 and 100';
      }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

interface ClassInput {
  name?: string;
  code?: string;
  teacher?: string;
}

export const validateClass = (data: ClassInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.name)) {
    errors.name = 'Class name is required';
  }

  if (isEmpty(data.code)) {
    errors.code = 'Class code is required';
  }

  if (isEmpty(data.teacher)) {
    errors.teacher = 'Teacher is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

interface StudentInput {
  name?: string;
  email?: string;
  grade?: number | string;
}

export const validateStudent = (data: StudentInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  if (isEmpty(data.email)) {
    errors.email = 'Email is required';
  } else if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.grade !== undefined && data.grade !== null) {
      const grade = Number(data.grade);
      if (isNaN(grade) || !isInRange(grade, 1, 12)) {
        errors.grade = 'Grade must be between 1 and 12';
      }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

interface ValidationRule {
    required?: boolean;
    type?: 'email' | 'url' | 'string' | 'number';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: unknown) => boolean | string;
}

// Generic schema validator
export const validateSchema = (input: unknown, schema: Record<string, ValidationRule>): ValidationResult => {
  const data = input as Record<string, unknown>;
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && isEmpty(value)) {
      errors[field] = `${field} is required`;
      continue;
    }

    if (value && rules.type === 'email' && typeof value === 'string' && !isValidEmail(value)) {
      errors[field] = 'Invalid email format';
    }

    if (value && rules.type === 'url' && typeof value === 'string' && !isValidUrl(value)) {
      errors[field] = 'Invalid URL format';
    }

    if (value && rules.minLength && typeof value === 'string' && !hasMinLength(value, rules.minLength)) {
      errors[field] = `Minimum length is ${rules.minLength}`;
    }

    if (value && rules.maxLength && typeof value === 'string' && !hasMaxLength(value, rules.maxLength)) {
      errors[field] = `Maximum length is ${rules.maxLength}`;
    }

    if (value !== undefined && rules.min !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue < rules.min) {
             errors[field] = `Minimum value is ${rules.min}`;
        }
    }

    if (value !== undefined && rules.max !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > rules.max) {
            errors[field] = `Maximum value is ${rules.max}`;
        }
    }

    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        errors[field] = typeof customResult === 'string' ? customResult : 'Validation failed';
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};