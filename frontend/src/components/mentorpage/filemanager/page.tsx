'use client';

import { useState, useEffect, useRef } from 'react';

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
      File_type: file.File_type || 'Unknown', // Ensure File_type is never undefined
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

  const filteredFiles = files.filter(file => {
    // Apply type filter
    if (selectedFileType !== 'all' && file.File_type !== selectedFileType) {
      return false;
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        file.file_name.toLowerCase().includes(query) ||
        file.File_type.toLowerCase().includes(query)
      );
    }

    return true;
  }).sort((a, b) => {
    // Apply sorting
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
    // Simulate download
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFileTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFileType(e.target.value);
    setShowTypeFilter(false);
  };

  const toggleTypeFilter = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowTypeFilter(!showTypeFilter);
  };

  // Fixed getFileIcon function with safe type handling
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
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">
          <i className="fas fa-folder-open header-icon"></i>
          Uploaded Files
        </h2>

        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              value={searchQuery}
              placeholder="Search files..."
              className="search-input"
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="data-table">
          <thead>
            <tr>
              <th 
                onClick={() => sortFiles('file_name')} 
                className="sortable-header"
              >
                FILE NAME
                {sortKey === 'file_name' && (
                  <span className={`sort-arrow ${sortOrder === 'desc' ? 'sort-arrow-desc' : ''}`}>
                    ▲
                  </span>
                )}
              </th>
              <th 
                onClick={() => sortFiles('created_at')} 
                className="sortable-header"
              >
                DATE
                {sortKey === 'created_at' && (
                  <span className={`sort-arrow ${sortOrder === 'desc' ? 'sort-arrow-desc' : ''}`}>
                    ▲
                  </span>
                )}
              </th>
              <th>
                <div className="th-content" ref={typeFilterRef}>
                  <span>FILE TYPE</span>
                  <i
                    className="fas fa-filter filter-icon"
                    onClick={toggleTypeFilter}
                  ></i>
                  {showTypeFilter && (
                    <div className="type-filter-dropdown">
                      <select
                        value={selectedFileType}
                        onChange={handleFileTypeFilter}
                        onClick={(e) => e.stopPropagation()}
                        className="header-filter"
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
                className="sortable-header"
              >
                FILE SIZE
                {sortKey === 'file_size' && (
                  <span className={`sort-arrow ${sortOrder === 'desc' ? 'sort-arrow-desc' : ''}`}>
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
                  <i className={`${getFileIcon(file.File_type)} file-icon-small`}></i>
                  {file.file_name}
                </td>
                <td>{formatDate(file.created_at)}</td>
                <td>
                  <span className="file-type-badge">{file.File_type}</span>
                </td>
                <td>{file.file_size.toLocaleString()} KB</td>
                <td>
                  <button
                    onClick={(e) => openFileActions(file, e)}
                    className="details-btn"
                  >
                    <i className="fas fa-ellipsis-v"></i> <span>Actions</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredFiles.length === 0 && (
              <tr>
                <td colSpan={5} className="no-files">
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
        <div className="modal-overlay">
          <div className="file-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fas fa-file-alt"></i> File Actions
              </h3>
              <button className="close-btn" onClick={closeFileActions}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="file-info">
                <div className="file-icon-large">
                  <i className={getFileIcon(selectedFile.File_type)}></i>
                </div>
                <div className="file-details">
                  <h4>{selectedFile.file_name}</h4>
                  <p>
                    {selectedFile.File_type} • {selectedFile.file_size.toLocaleString()} KB • {formatDate(selectedFile.created_at)}
                  </p>
                </div>
              </div>

              <div className="action-buttons">
                <button onClick={() => viewFile(selectedFile)} className="action-btn view">
                  <i className="fas fa-eye"></i> View
                </button>
                <button onClick={() => downloadFile(selectedFile)} className="action-btn download">
                  <i className="fas fa-download"></i> Download
                </button>
                <button onClick={() => deleteFile(selectedFile)} className="action-btn delete">
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Font Awesome CSS */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      <style jsx>{`
        /* ... (keep all the previous CSS styles exactly as they were) ... */
        
        /* Base Styles */
        :root {
          --primary: #3b9aa9;
          --primary-light: #6dd1e3;
          --primary-dark: #0b3e8a;
          --secondary: #ffc107;
          --danger: #f44336;
          --success: #4caf50;
          --warning: #ffa000;
          --text-dark: #0b2548;
          --text-light: #f5f7fa;
          --bg-light: #ffffff;
          --border: #e1e4e8;
        }

        .table-container {
          background: var(--bg-light);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(26, 79, 159, 0.5);
          width: 90%;
          margin-top: 2rem;
          margin-left: 2.5rem;
          padding: 0 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          height: 37.4rem;
          max-height: 37.4rem;
          overflow: hidden;
        }

        .table-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          gap: 1rem;
          flex-wrap: wrap;
          color: var(--text-light);
          position: sticky;
          top: 0;
          z-index: 20;
          border-radius: 20px 20px 0 0;
        }

        .table-title {
          margin: 0;
          font-size: 1.6rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .header-icon {
          font-size: 1.4rem;
        }

        .search-container {
          margin-left: auto;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--primary);
          z-index: 1;
        }

        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid rgb(17, 17, 95);
          border-radius: 8px;
          width: 250px;
          font-size: 0.9rem;
          height: 40px;
          transition: all 0.3s ease;
          position: relative;
        }

        .search-input:focus {
          outline: none;
          box-shadow: 0 2px 8px rgba(54, 88, 141, 0.7);
          border-color: var(--primary);
        }

        .table-scroll-container {
          overflow-y: auto;
          flex: 1;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          position: sticky;
          top: 0;
          background-color: #e5e5e5;
          color: var(--text-dark);
          font-weight: 600;
          padding: 1rem 0.75rem;
          border-bottom: 2px solid var(--primary);
          cursor: pointer;
          transition: background-color 0.2s;
          user-select: none;
        }

        .data-table th:hover {
          background-color: rgba(59, 154, 169, 0.1);
        }

        .data-table td {
          padding: 0.8rem 0.75rem;
          vertical-align: middle;
          border-bottom: 1px solid #eee;
          font-size: 0.9rem;
        }

        .data-table tr:hover {
          background-color: rgba(59, 154, 169, 0.05);
        }

        .sort-arrow {
          display: inline-block;
          margin-left: 5px;
          transition: transform 0.2s ease;
          font-size: 0.8em;
        }

        .sort-arrow-desc {
          transform: rotate(180deg);
        }

        .file-icon-small {
          margin-right: 8px;
          color: var(--primary);
          width: 16px;
        }

        .file-type-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background-color: rgba(59, 154, 169, 0.1);
          color: var(--primary-dark);
        }

        .details-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--primary-dark);
          background-color: rgba(73, 152, 164, 0.103);
          color: var(--primary-dark);
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .details-btn:hover {
          background-color: rgba(59, 154, 169, 0.2);
          transform: translateY(-1px);
        }

        .no-files {
          text-align: center;
          padding: 2rem;
          color: var(--text-dark);
          font-size: 1.1rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .file-modal {
          background: white;
          border-radius: 12px;
          width: 400px;
          max-width: 90vw;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .file-icon-large {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          background: rgba(59, 154, 169, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: var(--primary);
        }

        .file-details {
          flex: 1;
          min-width: 0;
        }

        .file-details h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-dark);
          font-size: 1.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-details p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-btn {
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s;
          font-size: 1rem;
          width: 100%;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-btn.view {
          background-color: rgba(59, 154, 169, 0.1);
          color: var(--primary-dark);
        }

        .action-btn.view:hover {
          background-color: rgba(59, 154, 169, 0.2);
        }

        .action-btn.download {
          background-color: rgba(76, 175, 80, 0.1);
          color: #2e7d32;
        }

        .action-btn.download:hover {
          background-color: rgba(76, 175, 80, 0.2);
        }

        .action-btn.delete {
          background-color: rgba(244, 67, 54, 0.1);
          color: #d32f2f;
        }

        .action-btn.delete:hover {
          background-color: rgba(244, 67, 54, 0.2);
        }

        /* Type Filter Dropdown */
        .th-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
        }

        .filter-icon {
          cursor: pointer;
          color: var(--primary);
          font-size: 0.9em;
          transition: transform 0.2s ease;
          padding: 4px;
        }

        .filter-icon:hover {
          transform: scale(1.1);
          color: var(--primary-dark);
        }

        .type-filter-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: white;
          border: 1px solid var(--border);
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          padding: 0.5rem;
          min-width: 140px;
        }

        .header-filter {
          width: 100%;
          background: white;
          border: 1px solid var(--border);
          color: var(--text-dark);
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem;
          font-size: 0.9rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .header-filter:hover {
          background-color: rgba(59, 154, 169, 0.1);
          border-color: var(--primary);
        }

        .header-filter:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 154, 169, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .table-container {
            width: 95%;
            margin-left: 1rem;
            height: 35rem;
          }

          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
          }

          .search-container {
            margin-left: 0;
            width: 100%;
          }

          .search-input {
            width: 100%;
          }

          .table-title {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .table-container {
            width: 100%;
            margin-left: 0;
            border-radius: 10px;
            margin: 1rem 0;
          }

          .data-table {
            font-size: 0.8rem;
          }

          .details-btn span {
            display: none;
          }

          .file-modal {
            width: 95vw;
          }
        }
      `}</style>
    </div>
  );
}