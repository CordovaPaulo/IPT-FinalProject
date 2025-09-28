const cloudinary = require('../service/cloudinary');
const { uploadFile } = require('../service/drive');
const streamifier = require('streamifier');
const { getValuesFromToken } = require('../service/jwt');

// unchanged Cloudinary upload
exports.upToCloudinary = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(buffer).pipe(stream);
            });
        };
        const result = await streamUpload(req.file.buffer);
        res.status(200).json({
            message: 'Image uploaded successfully!',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Image upload failed.' });
    }
};

// Helper for Google Drive uploads with parent and user subfolder
async function uploadFilesToDriveWithParent(files, parentFolder, username) {
    const results = [];
    // The folder path will be: parentFolder/username
    const folderPath = `${parentFolder}/${username}`;
    let folderWebViewLink = null;
    for (const file of files) {
        const uploadResult = await uploadFile({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            folder: folderPath, // Let drive.js handle finding/creating both parent and subfolder
        });
        results.push(uploadResult);
        // Save the folder's webViewLink if available
        if (!folderWebViewLink && uploadResult.folderWebViewLink) {
            folderWebViewLink = uploadResult.folderWebViewLink;
        }
    }
    return { results, folderPath, folderWebViewLink };
}

// Mentor credentials upload
exports.uploadMentorCredentials = async (req, res) => {
    try {
        const user = getValuesFromToken(req, res);
        const username = user?.username || 'unknown_user';
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files provided.' });
        }
        // Parent folder: "mentor_credentials", subfolder: username
        const { results, folderPath, folderWebViewLink } = await uploadFilesToDriveWithParent(req.files, 'mentor_credentials', username);

        let folderUrl = null;
        if (results.length > 0 && results[0].parentFolderId) {
            folderUrl = `https://drive.google.com/drive/folders/${results[0].parentFolderId}`;
        } else if (folderWebViewLink) {
            folderUrl = folderWebViewLink;
        }

        res.status(200).json({
            message: 'Mentor credentials uploaded successfully!',
            files: results,
            folderPath,
            folderUrl
        });
    } catch (error) {
        console.error('Error uploading mentor credentials:', error);
        res.status(500).json({ message: 'Mentor credentials upload failed.' });
    }
};

// Mentor learning materials upload
exports.uploadLearningMaterials = async (req, res) => {
    try {
        const user = getValuesFromToken(req, res);
        const username = user?.username || 'unknown_user';
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files provided.' });
        }
        // Parent folder: "learning_materials", subfolder: username
        const { results, folderPath, folderWebViewLink } = await uploadFilesToDriveWithParent(req.files, 'learning_materials', username);

        let folderUrl = null;
        if (results.length > 0 && results[0].parentFolderId) {
            folderUrl = `https://drive.google.com/drive/folders/${results[0].parentFolderId}`;
        } else if (folderWebViewLink) {
            folderUrl = folderWebViewLink;
        }

        res.status(200).json({
            message: 'Learning materials uploaded successfully!',
            files: results,
            folderPath,
            folderUrl
        });
    } catch (error) {
        console.error('Error uploading learning materials:', error);
        res.status(500).json({ message: 'Learning materials upload failed.' });
    }
};