import api from "@/lib/axios";

interface SubmitLearnerInfoParams {
  program: string;
  yearLevel: string;
  contactNumber: string;
  bio: string;
  gender: string;
  goals: string;
  address: string;
  modality: string;
  sessionDuration: string;
  selectedSubjects: string[];
  selectedDays: string[];
  selectedSessionStyles: string[];
  profileImageFile?: File;
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const mapProgram = (program: string) => {
  const programMap: { [key: string]: string } = {
    'Bachelor of Science in Information Technology (BSIT)': 'BSIT',
    'Bachelor of Science in Computer Science (BSCS)': 'BSCS',
    'Bachelor of Science in Entertainment and Multimedia Computing (BSEMC)': 'BSEMC'
  };
  return programMap[program] || program;
};

const mapYearLevel = (yearLevel: string) => {
  const yearMap: { [key: string]: string } = {
    '1st Year': '1st year',
    '2nd Year': '2nd year',
    '3rd Year': '3rd year',
    '4th Year': '4th year',
    'Graduate': 'graduate'
  };
  return yearMap[yearLevel] || yearLevel.toLowerCase();
};

const mapModality = (modality: string) => {
  const modalityMap: { [key: string]: string } = {
    'Online': 'online',
    'In-person': 'in-person',
    'Hybrid': 'mixed'
  };
  return modalityMap[modality] || modality.toLowerCase();
};

const mapSessionDuration = (duration: string) => {
  const durationMap: { [key: string]: string } = {
    '1 hour': '1hr',
    '2 hours': '2hrs',
    '3 hours': '3hrs'
  };
  return durationMap[duration] || duration;
};

const mapAvailability = (days: string[]) => {
  return days.map(day => day.toLowerCase());
};

const mapLearningStyle = (styles: string[]) => {
  const styleMap: { [key: string]: string } = {
    'Lecture-Based': 'lecture-based',
    'Interactive Discussion (hands-on)': 'interactive-discussion',
    'Q&A Session': 'q-and-a-discussion',
    'Demonstration': 'demonstrations',
    'Project-based': 'project-based',
    'Step-by-step process': 'step-by-step-discussion'
  };
  return styles.map(style => styleMap[style] || style.toLowerCase().replace(/\s+/g, '-'));
};

export const submitLearnerInfo = async (params: SubmitLearnerInfoParams) => {
  const formData = new FormData();
  
  formData.append('program', mapProgram(params.program));
  formData.append('yearLevel', mapYearLevel(params.yearLevel));
  formData.append('phoneNumber', params.contactNumber);
  formData.append('bio', params.bio);
  formData.append('sex', params.gender.toLowerCase());
  formData.append('goals', params.goals);
  formData.append('address', params.address);
  formData.append('modality', mapModality(params.modality));
  formData.append('sessionDur', mapSessionDuration(params.sessionDuration));
  
  formData.append('subjects', JSON.stringify(params.selectedSubjects));
  formData.append('availability', JSON.stringify(mapAvailability(params.selectedDays)));
  formData.append('style', JSON.stringify(mapLearningStyle(params.selectedSessionStyles)));
  
  if (params.profileImageFile) {
    formData.append('image', params.profileImageFile);
  }

  const token = getCookie('MindMateToken');

  const response = await api.post('/api/auth/learner/signup', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  console.log('Learner signup successful:', response.data);
  return response.data;
};