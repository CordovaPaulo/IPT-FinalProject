"use client";

import { useState, useMemo, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
// import html2pdf from 'html2pdf.js'; // removed: causes "self is not defined"
import styles from "./page.module.css";

interface User {
  id: number;
  name: string;
  email: string;
  gender?: string;
  course?: string;
  program?: string;
  role: string;
  secondary_role?: string;
  year?: string;
  phoneNum?: string;
  department?: string;
  address?: string;
  learn_modality?: string;
  availability?: string;
  proficiency?: string;
  teach_sty?: string;
  prefSessDur?: string;
  subjects?: string;
  bio?: string;
  exp?: string;
  learn_sty?: string;
  goals?: string;
  image_url?: string;
}

interface UsersProps {
  users: User[];
  onUpdateUsers: () => void;
}

const Users: React.FC<UsersProps> = ({ users, onUpdateUsers }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>({} as User);

  // Filter and search users
  const displayedUsers = useMemo(() => {
    let filteredUsers = users ? [...users] : [];

    // Apply role filters
    if (activeFilter === 'mentors') {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.role?.toLowerCase() === 'mentor' ||
          user.secondary_role?.toLowerCase() === 'mentor'
      );
    } else if (activeFilter === 'learners') {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.role?.toLowerCase() === 'learner' ||
          user.secondary_role?.toLowerCase() === 'learner'
      );
    }

    // Apply search filter
    return filteredUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.year?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, activeFilter, searchQuery]);

  const showUserDetails = (user: User) => {
    setCurrentUser(user);
    setShowUserModal(true);
  };

  const hideUserDetails = () => {
    setShowUserModal(false);
  };

  const exportUsersToCSV = () => {
    const data = displayedUsers.map((user) => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Year: user.year || 'N/A',
      Program: user.program || 'N/A',
      Role: user.role,
      Phone: user.phoneNum || 'N/A',
      Department: user.department || 'N/A',
      Gender: user.gender || 'N/A',
      Address: user.address || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 8 },
      { wch: 25 },
      { wch: 30 },
      { wch: 10 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 25 },
      { wch: 10 },
      { wch: 30 },
    ];
    worksheet['!cols'] = colWidths;

    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
        fill: { fgColor: { rgb: 'D3D3D3' } },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    let reportType = 'users';
    if (activeFilter === 'mentors') reportType = 'mentors';
    if (activeFilter === 'learners') reportType = 'learners';
    const formattedDate = new Date().toISOString().slice(0, 10);

    XLSX.writeFile(workbook, `${reportType}_report_${formattedDate}.xlsx`);
  };

  // Lazy PDF exporter hook
  function usePdfExporter() {
    const exportPdf = useCallback(async (element: HTMLElement, filename = 'export.pdf') => {
      if (!element) return;
      const mod = await import('html2pdf.js'); // loads only in browser
      const html2pdf: any = (mod as any).default || (mod as any);
      const opt = {
        margin: 0.5,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
      html2pdf().set(opt).from(element).save();
    }, []);
    return exportPdf;
  }

  const printRef = useRef<HTMLDivElement>(null);
  const exportPdf = usePdfExporter();

  const handleExportPdf = () => {
    if (printRef.current) exportPdf(printRef.current, 'users.pdf');
  };

  // Helper functions
  const capitalizeFirstLetter = (str?: string) => {
    if (!str) return 'Not specified';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const parseArrayString = (str?: string) => {
    if (!str) return 'Not specified';
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.join(', ') : str;
    } catch (e) {
      return str;
    }
  };

  // Extract program from course string
  const getProgramFromCourse = (course?: string) => {
    if (!course) return 'N/A';
    const match = course.match(/\(([^)]+)\)/);
    return match?.[1] || course;
  };

  // utilities to combine module classes with role-specific classes
  const roleBadgeClass = (role?: string) =>
    `${styles['role-badge']} ${role ? ((styles as any)[role.toLowerCase()] || '') : ''}`.trim();

  const secondaryRoleBadgeClass = (role?: string) =>
    `${styles['secondary-role-badge']} ${role ? ((styles as any)[role.toLowerCase()] || '') : ''}`.trim();

  const statusBadgeClass = (role?: string) =>
    `${styles['status-badge']} ${role ? ((styles as any)[role.toLowerCase()] || '') : ''}`.trim();

  return (
    <>
      <div className={styles['applications-container']}>
        <div className={styles['applications-header']}>
          <h2 className={styles['applications-title']}>
            <i className={`fas fa-users ${styles['header-icon']}`}></i>
            Users
          </h2>

          <div className={styles['filter-buttons']}>
            <button
              className={`${styles['filter-btn']} ${activeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles['filter-btn']} ${activeFilter === 'mentors' ? styles.active : ''}`}
              onClick={() => setActiveFilter('mentors')}
            >
              Mentors
            </button>
            <button
              className={`${styles['filter-btn']} ${activeFilter === 'learners' ? styles.active : ''}`}
              onClick={() => setActiveFilter('learners')}
            >
              Learners
            </button>
          </div>

          <div className={styles['search-container']}>
            <div className={styles['search-wrapper']}>
              <i className={`fas fa-search ${styles['search-icon']}`}></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className={styles['search-input']}
              />
            </div>
            <button className={styles['export-btn']} onClick={exportUsersToCSV}>
              <i className="fas fa-download"></i> Export
            </button>
          </div>
        </div>

        <div className={styles['table-scroll-container']}>
          <table className={styles['applications-table']}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Year</th>
                <th>Program</th>
                <th>Role</th>
                <th>Alternative Role</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className={styles['id-badge']}>{user.id}</span>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.year || 'N/A'}</td>
                  <td>{getProgramFromCourse(user.course)}</td>
                  <td>
                    <span className={roleBadgeClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={secondaryRoleBadgeClass(
                        user.secondary_role?.toLowerCase() === 'n/a'
                          ? 'na'
                          : user.secondary_role?.toLowerCase()
                      )}
                    >
                      {user.secondary_role || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <button className={styles['credentials-btn']} onClick={() => showUserDetails(user)}>
                      <i className="fas fa-eye"></i> <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles['no-applications']}>
                    No users to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* User Details Modal */}
        {showUserModal && (
          <div className={styles['modal-overlay']} onClick={hideUserDetails}>
            <div className={styles['credentials-modal']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['modal-header']}>
                <div className={styles['header-content']}>
                  <i className={`fas fa-user ${styles['modal-title-icon']}`}></i>
                  <h3 className={styles['modal-title']}>User Details</h3>
                </div>
                <button className={styles['close-btn']} onClick={hideUserDetails}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className={styles['modal-body']}>
                <div className={styles['applicant-profile']}>
                  <div className={styles['profile-image-container']}>
                    <img
                      src={currentUser.image_url || "https://gordoncollegeccs.edu.ph/ccs/students/lamp/assets/profile.jpg"}
                      alt={`Portrait of ${currentUser.name}`}
                      className={styles['profile-image']}
                    />
                    <div
                      className={statusBadgeClass(currentUser.role)}
                    >
                      {currentUser.role}
                    </div>
                  </div>

                  <div className={styles['profile-info']}>
                    <h4 className={styles['applicant-name']}>{currentUser.name}</h4>
                    <hr className={styles['divider']} />
                    <div className={styles['info-grid']}>
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>
                          <i className="fas fa-envelope"></i> Email
                        </span>
                        <span className={styles['info-value']}>{currentUser.email}</span>
                      </div>
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>
                          <i className="fas fa-phone"></i> Contact Number
                        </span>
                        <span className={styles['info-value']}>
                          {currentUser.phoneNum || 'Not provided'}
                        </span>
                      </div>
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>
                          <i className="fas fa-calendar-alt"></i> Year Level
                        </span>
                        <span className={styles['info-value']}>{currentUser.year || 'N/A'}</span>
                      </div>
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>
                          <i className="fas fa-graduation-cap"></i> Program
                        </span>
                        <span className={styles['info-value']}>{currentUser.program || 'N/A'}</span>
                      </div>
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>
                          <i className="fas fa-university"></i> Department
                        </span>
                        <span className={styles['info-value']}>
                          {currentUser.department || 'College of Computer Studies'}
                        </span>
                      </div>
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>
                          <i className="fas fa-venus-mars"></i> Sex at Birth
                        </span>
                        <span className={styles['info-value']}>
                          {capitalizeFirstLetter(currentUser.gender)}
                        </span>
                      </div>
                      <div className={styles['info-item']}>
                        <span className={styles['info-label']}>
                          <i className="fas fa-map-marker-alt"></i> Address
                        </span>
                        <span className={styles['info-value']}>
                          {currentUser.address || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role-Specific Details Section */}
                <div className={styles['details-section']}>
                  {/* Mentor Specific Information */}
                  {currentUser.role?.toLowerCase() === 'mentor' && (
                    <>
                      <div className={styles['details-card']}>
                        <h4 className={styles['section-title']}>
                          <i className="fas fa-chalkboard-teacher"></i> Teaching Information
                        </h4>
                        <hr className={styles['divider2']} />
                        <div className={styles['details-content']}>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Teaching Modality:</span>
                            <span className={styles['detail-value']}>
                              {currentUser.learn_modality || 'Not specified'}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Days of Availability:</span>
                            <span className={styles['detail-value']}>
                              {parseArrayString(currentUser.availability)}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Proficiency Level:</span>
                            <span className={styles['detail-value']}>
                              {currentUser.proficiency || 'Not specified'}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Teaching Style:</span>
                            <span className={styles['detail-value']}>
                              {parseArrayString(currentUser.teach_sty)}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Preferred Session Duration:</span>
                            <span className={styles['detail-value']}>
                              {currentUser.prefSessDur || 'Not specified'}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Subjects:</span>
                            <span className={styles['detail-value']}>
                              {parseArrayString(currentUser.subjects)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles['bio-card']}>
                        <h4 className={styles['section-title']}>
                          <i className="fas fa-user-edit"></i> Bio & Experience
                        </h4>
                        <hr className={styles['divider2']} />
                        <div className={styles['bio-content']}>
                          <div className={styles['detail-item2']}>
                            <span className={styles['detail-label']}>Short Bio:</span>
                            <span className={styles['detail-value2']}>
                              {currentUser.bio || 'No bio provided'}
                            </span>
                          </div>
                          <div className={styles['detail-item2']}>
                            <span className={styles['detail-label']}>Tutoring Experience:</span>
                            <span className={styles['detail-value2']}>
                              {currentUser.exp || 'No experience provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Learner Specific Information */}
                  {currentUser.role?.toLowerCase() === 'learner' && (
                    <>
                      <div className={styles['details-card']}>
                        <h4 className={styles['section-title']}>
                          <i className="fas fa-book-open"></i> Learning Preferences
                        </h4>
                        <hr className={styles['divider2']} />
                        <div className={styles['details-content']}>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Learning Modality:</span>
                            <span className={styles['detail-value']}>
                              {currentUser.learn_modality || 'Not specified'}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Days of Availability:</span>
                            <span className={styles['detail-value']}>
                              {parseArrayString(currentUser.availability)}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Learning Style:</span>
                            <span className={styles['detail-value']}>
                              {parseArrayString(currentUser.learn_sty)}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Preferred Session Duration:</span>
                            <span className={styles['detail-value']}>
                              {currentUser.prefSessDur || 'Not specified'}
                            </span>
                          </div>
                          <div className={styles['detail-item']}>
                            <span className={styles['detail-label']}>Subject of Interest:</span>
                            <span className={styles['detail-value']}>
                              {parseArrayString(currentUser.subjects)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles['bio-card']}>
                        <h4 className={styles['section-title']}>
                          <i className="fas fa-user-edit"></i> Bio & Goals
                        </h4>
                        <hr className={styles['divider2']} />
                        <div className={styles['bio-content']}>
                          <div className={styles['detail-item2']}>
                            <span className={styles['detail-label']}>Short Bio:</span>
                            <span className={styles['detail-value2']}>
                              {currentUser.bio || 'No bio provided'}
                            </span>
                          </div>
                          <div className={styles['detail-item2']}>
                            <span className={styles['detail-label']}>Learning Goals:</span>
                            <span className={styles['detail-value2']}>
                              {currentUser.goals || 'No goals provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={styles['modal-footer']}>
                <div className={styles['footer-actions']}>
                  <button className={`${styles['footer-btn']} ${styles.back}`} onClick={hideUserDetails}>
                    <i className="fas fa-arrow-left"></i> Back to Users
                  </button>
                  <button
                    className={`${styles['footer-btn']} ${styles.export}`}
                    onClick={handleExportPdf}
                  >
                    <i className="fas fa-file-pdf"></i> Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={printRef}>
        {/* ...existing table/content to export... */}
      </div>

      <button type="button" onClick={handleExportPdf}>Export PDF</button>
    </>
  );
};

const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@gordon.edu.ph",
    gender: "Male",
    course: "BS Information Technology (BSIT)",
    program: "BSIT",
    role: "Mentor",
    secondary_role: "N/A",
    year: "3rd Year",
    phoneNum: "09123456789",
    department: "College of Computer Studies",
    address: "Olongapo City",
    learn_modality: "Hybrid",
    availability: JSON.stringify(["Monday", "Wednesday", "Friday"]),
    proficiency: "Advanced",
    teach_sty: JSON.stringify(["Interactive", "Hands-on"]),
    subjects: JSON.stringify(["Programming", "Web Development", "Database"]),
    bio: "I'm passionate about teaching and helping others learn programming concepts.",
    exp: "2 years of tutoring experience in programming subjects."
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.garcia@gordon.edu.ph",
    gender: "Female",
    course: "BS Computer Science (BSCS)",
    program: "BSCS",
    role: "Learner",
    secondary_role: "N/A",
    year: "2nd Year",
    phoneNum: "09187654321",
    department: "College of Computer Studies",
    address: "Subic Bay",
    learn_modality: "Online",
    availability: JSON.stringify(["Tuesday", "Thursday", "Saturday"]),
    learn_sty: JSON.stringify(["Visual", "Practical"]),
    subjects: JSON.stringify(["Data Structures", "Algorithms"]),
    bio: "Looking to improve my programming skills and understanding of computer science concepts.",
    goals: "Master data structures and algorithms for better problem-solving skills."
  },
  {
    id: 3,
    name: "David Wilson",
    email: "david.wilson@gordon.edu.ph",
    gender: "Male",
    course: "BS Information Systems (BSIS)",
    program: "BSIS",
    role: "Mentor",
    secondary_role: "Learner",
    year: "4th Year",
    phoneNum: "09198765432",
    department: "College of Computer Studies",
    address: "Zambales",
    learn_modality: "Face-to-face",
    availability: JSON.stringify(["Monday", "Tuesday", "Thursday"]),
    proficiency: "Expert",
    teach_sty: JSON.stringify(["Project-based", "Collaborative"]),
    subjects: JSON.stringify(["Systems Analysis", "Project Management"]),
    bio: "Experienced in both teaching and learning various IT subjects.",
    exp: "3 years of academic tutoring experience."
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.chen@gordon.edu.ph",
    gender: "Female",
    course: "BS Information Technology (BSIT)",
    program: "BSIT",
    role: "Learner",
    secondary_role: "Mentor",
    year: "3rd Year",
    phoneNum: "09165432198",
    department: "College of Computer Studies",
    address: "Olongapo City",
    learn_modality: "Hybrid",
    availability: JSON.stringify(["Wednesday", "Friday", "Saturday"]),
    learn_sty: JSON.stringify(["Auditory", "Interactive"]),
    subjects: JSON.stringify(["Networking", "Cybersecurity"]),
    bio: "Passionate about networking and cybersecurity.",
    goals: "Improve understanding of network security protocols."
  }
];

export default function UsersPage() {
  return <Users users={sampleUsers} onUpdateUsers={() => console.log('Updating users...')} />;
}