/**
 * Form Validation Rules & Helpers for React Hook Form
 */

export const VALIDATION_RULES = {
  name: {
    required: 'Please enter your full name.',
    minLength: {
      value: 2,
      message: 'Name must contain at least 2 characters.'
    },
    maxLength: {
      value: 60,
      message: 'Name cannot exceed 60 characters.'
    }
  },

  email: {
    required: 'Please enter your email.',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address.'
    }
  },

  password: {
    required: 'Please enter your password.',
    minLength: {
      value: 8,
      message: 'Password must contain at least 8 characters.'
    }
  },

  terms: {
    required: 'You must agree to the terms and privacy policy.'
  }
};

/**
 * Calculates password strength on a scale of 0 to 4
 * Evaluates length, lowercase, uppercase, numbers, and special symbols
 */
export function calculatePasswordStrength(password = '') {
  if (!password) {
    return {
      score: 0,
      label: 'Too weak',
      color: 'bg-slate-300 dark:bg-slate-700',
      textColor: 'text-slate-500',
      checks: {
        length: false,
        lower: false,
        upper: false,
        number: false,
        special: false
      }
    };
  }

  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  if (passedCount <= 1) {
    return {
      score: 1,
      label: 'Weak',
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      checks
    };
  }
  if (passedCount <= 3) {
    return {
      score: 2,
      label: 'Fair',
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      checks
    };
  }
  if (passedCount === 4) {
    return {
      score: 3,
      label: 'Good',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      checks
    };
  }
  return {
    score: 4,
    label: 'Strong',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    checks
  };
}
