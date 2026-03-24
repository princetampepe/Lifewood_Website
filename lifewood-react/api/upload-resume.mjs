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

// Configure Cloudinary - only once at startup
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
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
    // Validate Cloudinary is configured
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      });
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Cloudinary credentials not configured',
      });
    }

    // Parse multipart form data
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];
    const applicantName = fields.applicantName?.[0];
    const applicantEmail = fields.applicantEmail?.[0];

    console.log('Upload request received:', {
      fileName: file?.originalFilename,
      fileSize: file?.size,
      fileMime: file?.mimetype,
      applicantEmail,
    });

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
        error: `Invalid file type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF, TXT`,
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`,
      });
    }

    // Upload to Cloudinary with promise-based approach
    const uploadResult = await new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(file.filepath);
      
      const upload = cloudinary.uploader.upload_stream(
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
            reject(error);
          } else {
            console.log('Cloudinary upload success:', {
              publicId: result.public_id,
              url: result.secure_url,
            });
            resolve(result);
          }
        }
      );

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        reject(error);
      });

      fileStream.pipe(upload);
    });

    // Return success
    return res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileSize: uploadResult.bytes,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
