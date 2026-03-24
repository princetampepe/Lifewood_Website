/**
 * Vercel Serverless Function — /api/upload-resume
 * Handles resume/CV file uploads to Cloudinary.
 * Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in env vars.
 *
 * Expected POST body (multipart/form-data):
 *   - file: File object (PDF, DOC, DOCX, images, TXT)
 *   - applicantName: string (for folder organization)
 *   - applicantEmail: string (for metadata)
 */

import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = files.file && files.file[0];
    const applicantName = fields.applicantName && fields.applicantName[0];
    const applicantEmail = fields.applicantEmail && fields.applicantEmail[0];

    // Validate file exists
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type and size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        error: `Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF, TXT`,
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `File size exceeds 10MB limit`,
      });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `lifewood/resumes/${new Date().getFullYear()}`,
        resource_type: 'auto',
        public_id: `${applicantEmail}-${Date.now()}`,
        metadata: {
          applicant_name: applicantName,
          applicant_email: applicantEmail,
        },
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            error: 'Failed to upload file to Cloudinary',
            details: error.message,
          });
        }

        // Return the secure URL
        res.status(200).json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          fileSize: result.bytes,
          uploadedAt: new Date().toISOString(),
        });
      }
    );

    // Pipe file to upload stream
    const fileStream = fs.createReadStream(file.filepath);
    fileStream.pipe(uploadStream);

    // Error handling for file stream
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      return res.status(500).json({
        error: 'Error reading file',
        details: error.message,
      });
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
