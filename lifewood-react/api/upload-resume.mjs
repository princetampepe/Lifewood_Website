/**
 * Vercel Serverless Function — /api/upload-resume
 * Handles resume/CV file uploads to Cloudinary.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in env vars.
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

/**
 * Promise-based Cloudinary upload
 */
function uploadToCloudinary(fileStream, options) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });

    fileStream.pipe(upload);
    fileStream.on('error', reject);
  });
}

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
    // Validate environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        error: 'Cloudinary credentials not configured',
        details: 'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET',
      });
    }

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

    // Create read stream
    const fileStream = fs.createReadStream(file.filepath);

    // Upload to Cloudinary with promise-based approach
    const result = await uploadToCloudinary(fileStream, {
      folder: `lifewood/resumes/${new Date().getFullYear()}`,
      resource_type: 'auto',
      public_id: `${applicantEmail}-${Date.now()}`,
      metadata: {
        applicant_name: applicantName,
        applicant_email: applicantEmail,
      },
    });

    // Return success with URL
    return res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      fileSize: result.bytes,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
