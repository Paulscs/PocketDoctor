import { Typography } from "@/constants/theme";

export const useGlobalFont = () => {
  return {
    regular: Typography.fontFamily.regular,
    medium: Typography.fontFamily.medium,
    bold: Typography.fontFamily.bold,
  };
};
