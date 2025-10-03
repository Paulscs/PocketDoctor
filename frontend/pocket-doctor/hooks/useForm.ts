import { useState, useCallback } from "react";

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface FormValidationRules {
  [key: string]: (value: string) => string | undefined;
}

export interface UseFormOptions {
  initialValues: { [key: string]: string };
  validationRules?: FormValidationRules;
  validateOnChange?: boolean;
}

export function useForm({
  initialValues,
  validationRules = {},
  validateOnChange = false,
}: UseFormOptions) {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        touched: false,
      };
    });
    return state;
  });

  const setValue = useCallback(
    (field: string, value: string) => {
      setFormState(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          value,
          error:
            validateOnChange && validationRules[field]
              ? validationRules[field](value)
              : undefined,
        },
      }));
    },
    [validationRules, validateOnChange]
  );

  const setTouched = useCallback(
    (field: string, touched = true) => {
      setFormState(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          touched,
          error:
            touched && validationRules[field]
              ? validationRules[field](prev[field].value)
              : prev[field].error,
        },
      }));
    },
    [validationRules]
  );

  const validateField = useCallback(
    (field: string): string | undefined => {
      const rule = validationRules[field];
      if (!rule) return undefined;

      const error = rule(formState[field].value);
      setFormState(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          error,
        },
      }));
      return error;
    },
    [formState, validationRules]
  );

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newState = { ...formState };

    Object.keys(formState).forEach(field => {
      const rule = validationRules[field];
      if (rule) {
        const error = rule(formState[field].value);
        newState[field] = {
          ...newState[field],
          error,
          touched: true,
        };
        if (error) isValid = false;
      }
    });

    setFormState(newState);
    return isValid;
  }, [formState, validationRules]);

  const resetForm = useCallback(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        touched: false,
      };
    });
    setFormState(state);
  }, [initialValues]);

  const getFieldProps = useCallback(
    (field: string) => ({
      value: formState[field]?.value || "",
      onChangeText: (value: string) => setValue(field, value),
      onBlur: () => setTouched(field),
      error: formState[field]?.error,
    }),
    [formState, setValue, setTouched]
  );

  const values = Object.keys(formState).reduce(
    (acc, key) => {
      acc[key] = formState[key].value;
      return acc;
    },
    {} as { [key: string]: string }
  );

  const errors = Object.keys(formState).reduce(
    (acc, key) => {
      if (formState[key].error) {
        acc[key] = formState[key].error;
      }
      return acc;
    },
    {} as { [key: string]: string }
  );

  const hasErrors = Object.keys(errors).length > 0;

  return {
    formState,
    values,
    errors,
    hasErrors,
    setValue,
    setTouched,
    validateField,
    validateForm,
    resetForm,
    getFieldProps,
  };
}
