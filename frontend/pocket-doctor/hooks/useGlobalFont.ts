import { Text, TextInput } from 'react-native';
import { Typography } from '@/constants/theme';

// Set default font family for all Text components
const defaultTextProps = Text.defaultProps || {};
Text.defaultProps = {
  ...defaultTextProps,
  style: [{ fontFamily: Typography.fontFamily.regular }, defaultTextProps.style],
};

// Set default font family for all TextInput components  
const defaultTextInputProps = TextInput.defaultProps || {};
TextInput.defaultProps = {
  ...defaultTextInputProps,
  style: [{ fontFamily: Typography.fontFamily.regular }, defaultTextInputProps.style],
};

export const useGlobalFont = () => {
  // This hook ensures the global font configuration is applied
  return {
    regular: Typography.fontFamily.regular,
    medium: Typography.fontFamily.medium,
    bold: Typography.fontFamily.bold,
  };
};
