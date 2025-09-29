'use client';

import { useState, useRef } from 'react';

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
    <div className="files-wrapper">
      {/* Header Section */}
      <div className="table-header">
        <h2 className="table-title">
          <i className="fas fa-folder-open header-icon"></i>
          Files and Documents
        </h2>
      </div>

      {/* Main Content Section */}
      <div className="lower-element">
        <div className="lower-grid">
          {/* File Upload Section */}
          <div className="upload-file">
            <div
              ref={dropZoneRef}
              className={`drop-zone ${isOverDropZone ? 'drop-zone-active' : ''}`}
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <i className="fas fa-file-arrow-up drop-zone-icon"></i>
              <p>
                {isOverDropZone ? "Drop Files Here" : "Click or Drag Files to Upload"}
              </p>
            </div>

            <div className="browse-file">
              <input
                type="file"
                ref={fileInputRef}
                className="file-upload"
                onChange={onFileInputChange}
                multiple
                accept="*"
                style={{ display: 'none' }}
              />
            </div>

            <button onClick={triggerFileInput} className="custom-file-upload">
              <i className="fas fa-folder-open"></i> Browse Files
            </button>
          </div>

          {/* Uploaded Files Display Section */}
          <div className="displayed-files">
            <div className="files-header">
              <h3><i className="fas fa-file-alt"></i> Uploaded Files</h3>
              <div className="file-count">{files.length} files</div>
            </div>

            <div className="displayed-container">
              {files.length > 0 ? (
                files.map((file, index) => (
                  <div key={file.id} className="file-item">
                    <div className="file-content">
                      <img src={getFileIcon(file.type, file.name)} alt="file" />
                      <div className="file-info">
                        <p className="file-name" title={file.name}>{file.name}</p>
                        <span className="file-type">{file.type || file.name.split('.').pop()?.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button onClick={() => removeFile(index)} className="delete-btn">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-files">
                  <p>No files uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="upload-button">
        <button onClick={uploadFiles} className="upload-btn">
          <i className="fas fa-upload"></i> Upload Files
        </button>
      </div>

      {/* Add FontAwesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      <style jsx>{`
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

        .files-wrapper {
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
          overflow-y: auto;
        }

        .files-wrapper::-webkit-scrollbar {
          display: none;
        }
        
        .files-wrapper {
          -ms-overflow-style: none; 
          scrollbar-width: none;  
        }

        .table-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          gap: 1rem;
          flex-wrap: wrap;
          color: #0b2548;
          position: sticky;
          top: 0;
          z-index: 20;
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

        /* Main Content Styles */
        .lower-element {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 10px;
          background-color: #fff;
          overflow: hidden;
          height: 542px;
          padding: 1rem;
        }

        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 50px;
          width: 100%;
          height: 100%;
        }

        /* Upload Section Styles */
        .upload-file {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          border-right: 1px solid var(--border);
        }

        .drop-zone {
          border: 3px dashed #a6a6a6;
          width: 90%;
          height: 250px; 
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          border-radius: 12px;
          background-color: rgba(59, 154, 169, 0.05);
        }

        .drop-zone > * {
          pointer-events: none;
        }

        .file-upload {
          pointer-events: auto;
        }

        .drop-zone-icon {
          font-size: 8rem;
          color: #a6a6a6;
          opacity: 0.1;
          margin-bottom: 1rem;
          transition: all 0.2s ease;
        }

        .drop-zone-active .drop-zone-icon {
          color: #066678;
          opacity: 0.3;
        }

        .drop-zone p {
          color: gray;
          font-size: 1rem;
          font-weight: 500;
          margin-top: 30px;
          user-select: none;
        }

        .drop-zone-active {
          background-color: rgba(6, 102, 120, 0.1) !important;
          border: 3px dashed var(--primary) !important;
        }

        .drop-zone:hover {
          background-color: rgba(6, 102, 120, 0.05);
          border-color: var(--primary) !important;
        }

        .custom-file-upload {
          background-color: rgb(40, 70, 86);
          color: white;
          width: 91%;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
          border: none;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 1rem;
          gap: 0.5rem;
        }

        .custom-file-upload:hover {
          background-color: rgb(54, 87, 105);
        }

        /* Files Display Section Styles */
        .displayed-files {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 15px;
          width: 100%;
          height: 100%;
        }

        .files-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 5px solid rgb(26, 71, 112);
          padding-bottom: 1rem;
        }

        .files-header h3 {
          color: rgb(40, 70, 86);
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .file-count {
          background-color: rgba(59, 154, 169, 0.1);
          color: var(--primary-dark);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .displayed-container {
          height: 100%;
          overflow-y: auto;
          padding-right: 5px;
        }

        .displayed-container::-webkit-scrollbar {
          display: none;
        }
        
        .displayed-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f9f9f9;
          padding: 12px;
          border-radius: 8px;
          min-height: 60px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          border-left: 4px solid var(--primary);
        }

        .file-item:hover {
          background-color: rgba(59, 154, 169, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .file-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .file-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
          font-weight: 500;
          color: var(--text-dark);
          margin: 0;
          text-align: left;
        }

        .file-type {
          font-size: 0.75rem;
          color: #666;
          margin-top: 4px;
        }

        .file-actions {
          display: flex;
          gap: 8px;
        }

        .delete-btn {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-size: 1rem;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background-color: rgba(244, 67, 54, 0.1);
        }

        .no-files {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #a6a6a6;
          font-size: 1rem;
        }

        .displayed-files img {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        /* Upload Button Styles */
        .upload-button {
          display: flex;
          justify-content: flex-end;
          padding: 1rem;
          background-color: #f5f7fa;
          border-top: 1px solid var(--border);
        }

        .upload-btn {
          background-color: rgb(209, 207, 207);
          color: rgb(40, 70, 86);
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-btn:hover {
          background-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 154, 169, 0.5);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .lower-grid {
            grid-template-columns: 1fr;
            grid-gap: 20px;
          }

          .upload-file {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding-bottom: 2rem;
          }

          .lower-element {
            height: auto;
          }
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .files-wrapper {
            width: 95%;
            margin-left: 1rem;
          }
        }

        @media (max-width: 480px) {
          .files-wrapper {
            width: 95%;
          }

          .file-name {
            max-width: 180px;
          }
        }

        @media (max-width: 1200px) {
          .files-wrapper {
            width: 95%;
            margin-left: 1rem;
          }
        }

        @media (max-width: 1024px) {
          .lower-grid {
            grid-template-columns: 1fr;
            grid-gap: 20px;
          }

          .upload-file {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding-bottom: 2rem;
            height: auto;
          }

          .drop-zone {
            height: 200px;
          }

          .lower-element {
            height: auto;
            padding: 1rem 0.5rem;
          }

          .displayed-files {
            padding: 0 5px;
          }
        }

        @media (max-width: 768px) {
          .files-wrapper {
            width: 100%;
            margin-left: 0;
            height: auto;
            max-height: none;
          }

          .table-header {
            padding: 1rem;
          }

          .drop-zone {
            height: 150px;
          }

          .file-item {
            padding: 10px;
          }

          .file-name {
            max-width: 200px;
          }
        }

        @media (max-width: 576px) {
          .table-title {
            font-size: 1.3rem;
          }

          .drop-zone {
            height: 120px;
          }

          .drop-zone p {
            font-size: 0.9rem;
          }

          .custom-file-upload {
            height: 45px;
            font-size: 0.9rem;
          }

          .file-name {
            max-width: 150px;
            font-size: 0.9rem;
          }

          .upload-btn {
            padding: 0.6rem 1.5rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 400px) {
          .table-title {
            font-size: 1.05rem;
          }

          .header-icon {
            font-size: 1.1rem;
          }

          .file-name {
            max-width: 120px;
          }

          .file-content img {
            width: 28px;
            height: 28px;
          }

          .file-type {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}