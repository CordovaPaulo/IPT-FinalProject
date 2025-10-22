import { ValidationErrors } from '@/hooks/info/useLearnerForm';

interface ValidationRules {
  [key: string]: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    message: string;
  };
}

interface FormData {
  gender: string;
  contactNumber: string;
  address: string;
  selectedSubjects: string[];
  bio: string;
  goals: string;
  profileImage: string | null;
}

export const validationRules: ValidationRules = {
  address: {
    minLength: 10,
    message: 'Address should be at least 10 characters long'
  },
  contactNumber: {
    pattern: /^09\d{9}$/,
    message: 'Contact number should start with 09 and have 11 digits'
  },
  bio: {
    minLength: 50,
    maxLength: 500,
    message: 'Bio should be between 50-500 characters'
  },
  goals: {
    minLength: 50,
    maxLength: 500,
    message: 'Goals should be between 50-500 characters'
  }
};

export const validateField = (
  field: string, 
  value: string, 
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>
) => {
  const rules = validationRules[field as keyof typeof validationRules];
  if (!rules) return true;
  
  let isValid = true;
  let errorMessage = '';
  
  if ('pattern' in rules && rules.pattern && !rules.pattern.test(value)) {
    isValid = false;
    errorMessage = rules.message;
  }
  
  if ('minLength' in rules && rules.minLength && value.length < rules.minLength) {
    isValid = false;
    errorMessage = rules.message;
  }
  
  if ('maxLength' in rules && rules.maxLength && value.length > rules.maxLength) {
    isValid = false;
    errorMessage = rules.message;
  }
  
  setValidationErrors(prev => ({
    ...prev,
    [field]: isValid ? '' : errorMessage
  }));
  
  return isValid;
};

export const validateFormStep = (
  step: number,
  formData: FormData,
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>
): boolean => {
  const errors: ValidationErrors = {};
  
  if (step === 1) {
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.contactNumber || formData.contactNumber.length !== 11) errors.contactNumber = 'Valid Contact Number is required (11 digits)';
    if (!formData.address.trim()) errors.address = 'Address is required';
  }
  
  if (step === 2) {
    if (formData.selectedSubjects.length === 0) errors.selectedSubjects = 'At least one subject is required';
    if (!formData.bio.trim()) errors.bio = 'Short Bio is required';
    if (!formData.goals.trim()) errors.goals = 'Learning goals is required';
    if (!formData.profileImage) errors.profileImage = 'Profile Picture is required';
  }
  
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};