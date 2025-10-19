'use client';

import { useState, useRef } from 'react';
import styles from './files.module.css';

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  file?: File;
}

export default function FilesComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);

  // Sample files data for display
  const sampleFiles: FileItem[] = [
    { id: 1, name: "Mathematics_Notes.pdf", type: "application/pdf", size: "2.4 MB" },
    { id: 2, name: "Programming_Exercises.zip", type: "application/zip", size: "5.1 MB" },
    { id: 3, name: "Algorithms_Presentation.pptx", type: "application/vnd.ms-powerpoint", size: "3.2 MB" },
    { id: 4, name: "Data_Structures_Guide.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: "1.8 MB" },
    { id: 5, name: "Web_Development_Resources.zip", type: "application/zip", size: "7.5 MB" }
  ];

  const getFileIcon = (fileType: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    // Image files
    if (
      fileType.includes('image') ||
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/1829/1829548.png';
    }
    // PDF files
    else if (fileType.includes('pdf') || extension === 'pdf') {
      return 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png';
    }
    // Word documents
    else if (
      fileType.includes('word') ||
      fileType.includes('document') ||
      ['doc', 'docx'].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/281/281760.png';
    }
    // Excel files
    else if (
      fileType.includes('spreadsheet') ||
      fileType.includes('excel') ||
      ['xls', 'xlsx', 'csv'].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/281/281778.png';
    }
    // PowerPoint files
    else if (
      fileType.includes('presentation') ||
      fileType.includes('powerpoint') ||
      fileType.includes('ppt') ||
      ['ppt', 'pptx'].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/888/888879.png';
    }
    // Video files
    else if (
      fileType.includes('video') ||
      ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png';
    }
    // Zip/compressed files
    else if (
      fileType.includes('zip') ||
      fileType.includes('compressed') ||
      ['zip', '7z', 'rar', 'tar', 'gz'].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/888/888879.png';
    }
    // Text files
    else if (
      fileType.includes('text') ||
      ['txt', 'md', 'log', 'ini', 'conf'].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png';
    }
    // Code files
    else if (
      [
        'js', 'ts', 'py', 'java', 'cs', 'cpp', 'c', 'h', 'php', 'html', 'css', 'scss', 'json', 'xml', 'yaml', 'yml'
      ].includes(extension)
    ) {
      return 'https://cdn-icons-png.flaticon.com/512/2881/2881142.png';
    }
    // Default icon
    else {
      return 'https://cdn-icons-png.flaticon.com/512/25/25657.png';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(Array.from(selectedFiles));
    }
    event.target.value = '';
  };

  const handleFiles = (newFiles: File[]) => {
    if (!newFiles || newFiles.length === 0) return;

    const fileObjects: FileItem[] = newFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      file: file
    }));

    setFiles(prev => [...prev, ...fileObjects]);
  };

  const uploadFiles = async () => {
    try {
      // Simulate file upload
      console.log('Uploading files:', files);
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverDropZone(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverDropZone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverDropZone(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(Array.from(droppedFiles));
    }
  };

  // Initialize with sample files on component mount
  useState(() => {
    setFiles(sampleFiles);
  });

  return (
    <div className={styles.filesComponentWrapper}>
      {/* Header Section */}
      <div className={styles.filesComponentTableHeader}>
        <h2 className={styles.filesComponentTableTitle}>
          <i className={`fas fa-folder-open ${styles.filesComponentHeaderIcon}`}></i>
          Files and Documents
        </h2>
      </div>

      {/* Main Content Section */}
      <div className={styles.filesComponentLowerElement}>
        <div className={styles.filesComponentLowerGrid}>
          {/* File Upload Section */}
          <div className={styles.filesComponentUploadFile}>
            <div
              ref={dropZoneRef}
              className={`${styles.filesComponentDropZone} ${isOverDropZone ? styles.filesComponentDropZoneActive : ''}`}
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <i className={`fas fa-file-arrow-up ${styles.filesComponentDropZoneIcon}`}></i>
              <p>
                {isOverDropZone ? "Drop Files Here" : "Click or Drag Files to Upload"}
              </p>
            </div>

            <div className={styles.filesComponentBrowseFile}>
              <input
                type="file"
                ref={fileInputRef}
                className={styles.filesComponentFileUpload}
                onChange={onFileInputChange}
                multiple
                accept="*"
                style={{ display: 'none' }}
              />
            </div>

            <button onClick={triggerFileInput} className={styles.filesComponentCustomFileUpload}>
              <i className="fas fa-folder-open"></i> Browse Files
            </button>
          </div>

          {/* Uploaded Files Display Section */}
          <div className={styles.filesComponentDisplayedFiles}>
            <div className={styles.filesComponentFilesHeader}>
              <h3><i className="fas fa-file-alt"></i> Uploaded Files</h3>
              <div className={styles.filesComponentFileCount}>{files.length} files</div>
            </div>

            <div className={styles.filesComponentDisplayedContainer}>
              {files.length > 0 ? (
                files.map((file, index) => (
                  <div key={file.id} className={styles.filesComponentFileItem}>
                    <div className={styles.filesComponentFileContent}>
                      <img src={getFileIcon(file.type, file.name)} alt="file" />
                      <div className={styles.filesComponentFileInfo}>
                        <p className={styles.filesComponentFileName} title={file.name}>{file.name}</p>
                        <span className={styles.filesComponentFileType}>{file.type || file.name.split('.').pop()?.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className={styles.filesComponentFileActions}>
                      <button onClick={() => removeFile(index)} className={styles.filesComponentDeleteBtn}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.filesComponentNoFiles}>
                  <p>No files uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className={styles.filesComponentUploadButton}>
        <button onClick={uploadFiles} className={styles.filesComponentUploadBtn}>
          <i className="fas fa-upload"></i> Upload Files
        </button>
      </div>

      {/* Add FontAwesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
}