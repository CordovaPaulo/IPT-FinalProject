import { useState, useRef, useEffect } from 'react';

export interface DropdownOpenState {
  gender: boolean;
  yearLevel: boolean;
  program: boolean;
  modality: boolean;
  availability: boolean;
  learningStyle: boolean;
  sessionDuration: boolean;
}

export const useDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState<DropdownOpenState>({
    gender: false,
    yearLevel: false,
    program: false,
    modality: false,
    availability: false,
    learningStyle: false,
    sessionDuration: false
  });

  const toggleDropdown = (type: keyof DropdownOpenState) => {
    setDropdownOpen(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const closeDropdown = (type: keyof DropdownOpenState) => {
    setDropdownOpen(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownOpen({
      gender: false,
      yearLevel: false,
      program: false,
      modality: false,
      availability: false,
      learningStyle: false,
      sessionDuration: false,
    });
  };

  // Click outside handler
  const useClickOutside = (callback: () => void) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          callback();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [callback]);

    return ref;
  };

  return {
    dropdownOpen,
    setDropdownOpen,
    toggleDropdown,
    closeDropdown,
    closeAllDropdowns,
    useClickOutside
  };
};