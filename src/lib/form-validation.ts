export interface ValidationError {
  field: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[_$%@\-])[a-zA-Z\d_$%@\-]{8,}$/;

export const formValidation = {
  email(value: string): string | null {
    if (!value.trim()) {
      return "validation.required";
    }
    if (!EMAIL_REGEX.test(value)) {
      return "validation.invalid_email";
    }
    return null;
  },

  username(value: string): string | null {
    if (!value.trim()) {
      return "validation.required";
    }
    if (value.length < 5) {
      return "validation.username_too_short";
    }
    if (value.length > 50) {
      return "validation.username_too_long";
    }
    if (!USERNAME_REGEX.test(value)) {
      return "validation.username_invalid_chars";
    }
    if (!/[a-zA-Z]/.test(value)) {
      return "validation.username_needs_letter";
    }
    return null;
  },

  firstName(value: string): string | null {
    if (!value.trim()) {
      return "validation.required";
    }
    if (value.length < 3) {
      return "validation.first_name_too_short";
    }
    if (value.length > 50) {
      return "validation.first_name_too_long";
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return "validation.first_name_letters_only";
    }
    return null;
  },

  lastName(value: string): string | null {
    if (!value.trim()) {
      return "validation.required";
    }
    if (value.length < 3) {
      return "validation.last_name_too_short";
    }
    if (value.length > 50) {
      return "validation.last_name_too_long";
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return "validation.last_name_letters_only";
    }
    return null;
  },

  password(value: string): string | null {
    if (!value) {
      return "validation.required";
    }
    if (value.length < 8) {
      return "validation.password_too_short";
    }
    if (!PASSWORD_REGEX.test(value)) {
      return "validation.password_weak";
    }
    return null;
  },

  passwordMatch(password: string, confirmPassword: string): string | null {
    if (password !== confirmPassword) {
      return "validation.passwords_dont_match";
    }
    return null;
  },

  otp(value: string): string | null {
    if (!value.trim()) {
      return "validation.required";
    }
    if (!/^\d{6}$/.test(value)) {
      return "validation.otp_invalid";
    }
    return null;
  },

  notEmpty(value: string, fieldName: string = "field"): string | null {
    if (!value || !value.trim()) {
      return "validation.required";
    }
    return null;
  },
};

// Type for form errors
export type FormErrors<T = Record<string, unknown>> = Partial<
  Record<keyof T, string>
>;
