'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './filemanager.module.css';

interface File {
  id: number;
  file_name: string;
  created_at: string;
  File_type: string;
  file_size: number;
  webViewLink?: string;
}

interface FileManagerComponentProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export default function FileManagerComponent({ files: propFiles, setFiles }: FileManagerComponentProps) {
  const [files, setFilesState] = useState<File[]>([]);
  const [showFileActions, setShowFileActions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sorting and filtering
  const [sortKey, setSortKey] = useState<keyof File | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uniqueFileTypes, setUniqueFileTypes] = useState<string[]>([]);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const typeFilterRef = useRef<HTMLDivElement>(null);

  // Sample data with proper File_type values
  const sampleFiles: File[] = [
    {
      id: 1,
      file_name: "Mathematics_Notes.pdf",
      created_at: "2024-01-15",
      File_type: "PDF",
      file_size: 2450,
      webViewLink: "https://example.com/file1"
    },
    {
      id: 2,
      file_name: "Programming_Exercises.zip",
      created_at: "2024-01-14",
      File_type: "ZIP",
      file_size: 5120
    },
    {
      id: 3,
      file_name: "Physics_Lab_Report.docx",
      created_at: "2024-01-13",
      File_type: "Word",
      file_size: 1800
    },
    {
      id: 4,
      file_name: "Data_Structures_Guide.pdf",
      created_at: "2024-01-12",
      File_type: "PDF",
      file_size: 3200
    },
    {
      id: 5,
      file_name: "Chemistry_Formula_Sheet.xlsx",
      created_at: "2024-01-11",
      File_type: "Excel",
      file_size: 950
    },
    {
      id: 6,
      file_name: "Web_Development_Tutorials.zip",
      created_at: "2024-01-10",
      File_type: "ZIP",
      file_size: 7800
    },
    {
      id: 7,
      file_name: "Algorithms_Presentation.pptx",
      created_at: "2024-01-09",
      File_type: "PowerPoint",
      file_size: 4200
    },
    {
      id: 8,
      file_name: "Database_Diagrams.pdf",
      created_at: "2024-01-08",
      File_type: "PDF",
      file_size: 1500
    }
  ];

  // Safe data processing function
  const processFiles = (fileList: File[]) => {
    return fileList.map(file => ({
      ...file,
      File_type: file.File_type || 'Unknown',
      file_name: file.file_name || 'Unnamed File',
      created_at: file.created_at || new Date().toISOString(),
      file_size: file.file_size || 0
    }));
  };

  // Update internal files state when propFiles changes or use sample data
  useEffect(() => {
    const filesToUse = propFiles && propFiles.length > 0 ? propFiles : sampleFiles;
    const processedFiles = processFiles(filesToUse);
    setFilesState(processedFiles);
    
    const types = ['all', ...new Set(processedFiles.map((file) => file.File_type))];
    setUniqueFileTypes(types);
  }, [propFiles]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredFiles = files.filter(file => {
    if (selectedFileType !== 'all' && file.File_type !== selectedFileType) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        file.file_name.toLowerCase().includes(query) ||
        file.File_type.toLowerCase().includes(query)
      );
    }

    return true;
  }).sort((a, b) => {
    if (!sortKey) return 0;

    let compareA: any = sortKey === 'file_size' ? Number(a[sortKey]) : a[sortKey];
    let compareB: any = sortKey === 'file_size' ? Number(b[sortKey]) : b[sortKey];

    if (sortKey === 'created_at') {
      compareA = new Date(a[sortKey]).getTime();
      compareB = new Date(b[sortKey]).getTime();
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const openFileActions = (file: File, event: React.MouseEvent) => {
    setSelectedFile(file);
    setShowFileActions(true);
    event.stopPropagation();
  };

  const closeFileActions = () => {
    setShowFileActions(false);
    setSelectedFile(null);
  };

  const viewFile = (file: File) => {
    console.log('View file:', file.id);
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      alert(`Viewing file: ${file.file_name}\n(Web view link not available)`);
    }
    closeFileActions();
  };

  const downloadFile = (file: File) => {
    console.log('Download file:', file.id);
    alert(`Downloading file: ${file.file_name}`);
    closeFileActions();
  };

  const deleteFile = (file: File) => {
    console.log('Delete file:', file.id);
    if (confirm(`Are you sure you want to delete "${file.file_name}"?`)) {
      const updatedFiles = files.filter((f) => f.id !== file.id);
      setFilesState(updatedFiles);
      setFiles(updatedFiles);
    }
    closeFileActions();
  };

  const sortFiles = (key: keyof File) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleFileTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFileType(e.target.value);
    setShowTypeFilter(false);
  };

  const toggleTypeFilter = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowTypeFilter(!showTypeFilter);
  };

  const getFileIcon = (fileType: string | undefined) => {
    const type = (fileType || 'file').toLowerCase();
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word') || type.includes('doc')) return 'fas fa-file-word';
    if (type.includes('excel') || type.includes('xls')) return 'fas fa-file-excel';
    if (type.includes('powerpoint') || type.includes('ppt')) return 'fas fa-file-powerpoint';
    if (type.includes('image')) return 'fas fa-file-image';
    if (type.includes('video')) return 'fas fa-file-video';
    if (type.includes('zip') || type.includes('rar')) return 'fas fa-file-archive';
    return 'fas fa-file';
  };

  // Close type filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
        setShowTypeFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFileActions();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (showFileActions) {
        closeFileActions();
      }
    };

    if (showFileActions) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showFileActions]);

  return (
    <div className={styles.fileManagerTableContainer}>
      <div className={styles.fileManagerTableHeader}>
        <h2 className={styles.fileManagerTableTitle}>
          <i className={`fas fa-folder-open ${styles.fileManagerHeaderIcon}`}></i>
          Uploaded Files
        </h2>

        <div className={styles.fileManagerSearchContainer}>
          <div className={styles.fileManagerSearchWrapper}>
            <i className={`fas fa-search ${styles.fileManagerSearchIcon}`}></i>
            <input
              type="text"
              value={searchQuery}
              placeholder="Search files..."
              className={styles.fileManagerSearchInput}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className={styles.fileManagerTableScrollContainer}>
        <table className={styles.fileManagerDataTable}>
          <thead>
            <tr>
              <th 
                onClick={() => sortFiles('file_name')} 
                className={styles.fileManagerSortableHeader}
              >
                FILE NAME
                {sortKey === 'file_name' && (
                  <span className={`${styles.fileManagerSortArrow} ${sortOrder === 'desc' ? styles.fileManagerSortArrowDesc : ''}`}>
                    ▲
                  </span>
                )}
              </th>
              <th 
                onClick={() => sortFiles('created_at')} 
                className={styles.fileManagerSortableHeader}
              >
                DATE
                {sortKey === 'created_at' && (
                  <span className={`${styles.fileManagerSortArrow} ${sortOrder === 'desc' ? styles.fileManagerSortArrowDesc : ''}`}>
                    ▲
                  </span>
                )}
              </th>
              <th>
                <div className={styles.fileManagerThContent} ref={typeFilterRef}>
                  <span>FILE TYPE</span>
                  <i
                    className={`fas fa-filter ${styles.fileManagerFilterIcon}`}
                    onClick={toggleTypeFilter}
                  ></i>
                  {showTypeFilter && (
                    <div className={styles.fileManagerTypeFilterDropdown}>
                      <select
                        value={selectedFileType}
                        onChange={handleFileTypeFilter}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.fileManagerHeaderFilter}
                      >
                        {uniqueFileTypes.map((type) => (
                          <option key={type} value={type}>
                            {type === 'all' 
                              ? 'All Types' 
                              : type.charAt(0).toUpperCase() + type.slice(1)
                            }
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </th>
              <th 
                onClick={() => sortFiles('file_size')} 
                className={styles.fileManagerSortableHeader}
              >
                FILE SIZE
                {sortKey === 'file_size' && (
                  <span className={`${styles.fileManagerSortArrow} ${sortOrder === 'desc' ? styles.fileManagerSortArrowDesc : ''}`}>
                    ▲
                  </span>
                )}
              </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file.id}>
                <td>
                  <i className={`${getFileIcon(file.File_type)} ${styles.fileManagerFileIconSmall}`}></i>
                  {file.file_name}
                </td>
                <td>{formatDate(file.created_at)}</td>
                <td>
                  <span className={styles.fileManagerFileTypeBadge}>{file.File_type}</span>
                </td>
                <td>{file.file_size.toLocaleString()} KB</td>
                <td>
                  <button
                    onClick={(e) => openFileActions(file, e)}
                    className={styles.fileManagerDetailsBtn}
                  >
                    <i className="fas fa-ellipsis-v"></i> <span>Actions</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredFiles.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.fileManagerNoFiles}>
                  <i className="fas fa-search" style={{marginRight: '10px'}}></i>
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* File Actions Modal */}
      {showFileActions && selectedFile && (
        <div className={styles.fileManagerModalOverlay}>
          <div className={styles.fileManagerFileModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.fileManagerModalHeader}>
              <h3 className={styles.fileManagerModalTitle}>
                <i className="fas fa-file-alt"></i> File Actions
              </h3>
              <button className={styles.fileManagerCloseBtn} onClick={closeFileActions}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.fileManagerModalBody}>
              <div className={styles.fileManagerFileInfo}>
                <div className={styles.fileManagerFileIconLarge}>
                  <i className={getFileIcon(selectedFile.File_type)}></i>
                </div>
                <div className={styles.fileManagerFileDetails}>
                  <h4>{selectedFile.file_name}</h4>
                  <p>
                    {selectedFile.File_type} • {selectedFile.file_size.toLocaleString()} KB • {formatDate(selectedFile.created_at)}
                  </p>
                </div>
              </div>

              <div className={styles.fileManagerActionButtons}>
                <button onClick={() => viewFile(selectedFile)} className={`${styles.fileManagerActionBtn} ${styles.fileManagerActionBtnView}`}>
                  <i className="fas fa-eye"></i> View
                </button>
                <button onClick={() => downloadFile(selectedFile)} className={`${styles.fileManagerActionBtn} ${styles.fileManagerActionBtnDownload}`}>
                  <i className="fas fa-download"></i> Download
                </button>
                <button onClick={() => deleteFile(selectedFile)} className={`${styles.fileManagerActionBtn} ${styles.fileManagerActionBtnDelete}`}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Font Awesome CSS */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
}