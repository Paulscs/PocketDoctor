export const validationRules = {
  email: (value: string): string | undefined => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return undefined;
  },

  confirmPassword:
    (password: string) =>
    (value: string): string | undefined => {
      if (!value) return "Please confirm your password";
      if (value !== password) return "Passwords do not match";
      return undefined;
    },

  required:
    (fieldName: string) =>
    (value: string): string | undefined => {
      if (!value || value.trim() === "") return `${fieldName} is required`;
      return undefined;
    },

  minLength:
    (min: number, fieldName = "Field") =>
    (value: string): string | undefined => {
      if (value && value.length < min)
        return `${fieldName} must be at least ${min} characters`;
      return undefined;
    },

  maxLength:
    (max: number, fieldName = "Field") =>
    (value: string): string | undefined => {
      if (value && value.length > max)
        return `${fieldName} cannot exceed ${max} characters`;
      return undefined;
    },

  phone: (value: string): string | undefined => {
    if (!value) return undefined; // Optional field
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(value)) return "Please enter a valid phone number";
    return undefined;
  },

  name: (value: string): string | undefined => {
    if (!value) return "Name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(value))
      return "Name can only contain letters and spaces";
    return undefined;
  },
};
