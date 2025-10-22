import { useEffect, useRef } from 'react';

export interface DropdownOpenState {
  gender: boolean;
  yearLevel: boolean;
  program: boolean;
  modality: boolean;
  availability: boolean;
  learningStyle: boolean;
  sessionDuration: boolean;
}

export const useKeyboardNavigation = (currentStep: number) => {
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const prevStepButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        return;
      }

      const currentActiveElement = document.activeElement;
      const allFocusableElements = getFocusableElements();
      
      if (allFocusableElements.length === 0) return;

      const currentIndex = allFocusableElements.indexOf(currentActiveElement as HTMLElement);
      let nextIndex = -1;

      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < allFocusableElements.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : allFocusableElements.length - 1;
      } else if (e.key === 'ArrowLeft') {
        if (currentStep === 1) {
          if (currentActiveElement === nextButtonRef.current) {
            e.preventDefault();
            backButtonRef.current?.focus();
            return;
          }
        } else if (currentStep === 2) {
          if (currentActiveElement === nextButtonRef.current) {
            e.preventDefault();
            prevStepButtonRef.current?.focus();
            return;
          } else if (currentActiveElement === prevStepButtonRef.current) {
            e.preventDefault();
            const formElements = getFocusableElements().filter(el => 
              el !== backButtonRef.current && 
              el !== prevStepButtonRef.current && 
              el !== nextButtonRef.current
            );
            if (formElements.length > 0) {
              formElements[formElements.length - 1]?.focus();
            }
            return;
          }
        }
      } else if (e.key === 'ArrowRight') {
        if (currentStep === 1) {
          if (currentActiveElement === backButtonRef.current) {
            e.preventDefault();
            nextButtonRef.current?.focus();
            return;
          }
        } else if (currentStep === 2) {
          if (currentActiveElement === prevStepButtonRef.current) {
            e.preventDefault();
            nextButtonRef.current?.focus();
            return;
          } else if (currentActiveElement === backButtonRef.current) {
            e.preventDefault();
            const formElements = getFocusableElements().filter(el => 
              el !== backButtonRef.current && 
              el !== prevStepButtonRef.current && 
              el !== nextButtonRef.current
            );
            if (formElements.length > 0) {
              formElements[0]?.focus();
            }
            return;
          }
        }
      }

      if (nextIndex !== -1) {
        e.preventDefault();
        allFocusableElements[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyNavigation);
    return () => {
      document.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [currentStep]);

  const getFocusableElements = (): HTMLElement[] => {
    const focusableSelectors = [
      'input:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '.dropdown-container',
      '.dropdown-trigger',
      '.upload-controls'
    ].join(',');

    const currentStepElement = document.querySelector('.form-container');
    if (!currentStepElement) return [];

    const elements = Array.from(currentStepElement.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    if (nextButtonRef.current) {
      elements.push(nextButtonRef.current);
    }
    if (backButtonRef.current) {
      elements.push(backButtonRef.current);
    }
    if (prevStepButtonRef.current && currentStep === 2) {
      elements.push(prevStepButtonRef.current);
    }

    return elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
  };

  // Focus management for dropdowns
  const focusFirstDropdownOption = (dropdownElement: HTMLElement) => {
    const firstOption = dropdownElement.querySelector('.dropdown-option') as HTMLElement;
    firstOption?.focus();
  };

  // Handle dropdown keyboard navigation
  const handleDropdownKeyNavigation = (e: React.KeyboardEvent, dropdownType: keyof DropdownOpenState, isOpen: boolean, toggleDropdown: () => void, dropdownRef: React.RefObject<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        toggleDropdown();
        setTimeout(() => {
          const dropdownElement = dropdownRef?.current;
          if (dropdownElement) {
            focusFirstDropdownOption(dropdownElement);
          }
        }, 0);
      }
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      toggleDropdown();
    }
  };

  // Handle subjects dropdown keyboard navigation
  const handleSubjectsKeyNavigation = (e: React.KeyboardEvent, showCategories: boolean, toggleSubjectDropdown: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!showCategories) {
        toggleSubjectDropdown();
      }
    } else if (e.key === 'Escape' && showCategories) {
      e.preventDefault();
      toggleSubjectDropdown();
    }
  };

  // Handle checkbox keyboard navigation
  const handleCheckboxKeyNavigation = (e: React.KeyboardEvent, 
    type: 'day' | 'style' | 'subject', 
    value: string, 
    currentState: string[], 
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (currentState.includes(value)) {
        setState(currentState.filter(item => item !== value));
      } else {
        setState([...currentState, value]);
      }
    }
  };

  return {
    nextButtonRef,
    backButtonRef,
    prevStepButtonRef,
    handleDropdownKeyNavigation,
    handleSubjectsKeyNavigation,
    handleCheckboxKeyNavigation,
    focusFirstDropdownOption
  };
};