/**
 * Vercel Serverless Function — /api/upload-resume
 * Handles resume/CV file uploads to Cloudinary.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in env vars.
 */

import { v2 as cloudinary } from 'cloudinary';
import busboy from 'busboy';
import { Readable } from 'stream';

// Configure Cloudinary
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate Cloudinary is configured
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[Upload] Missing Cloudinary config', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      });
      return res.status(500).json({
        error: 'Server configuration error - Cloudinary not set up',
      });
    }

    return new Promise((resolve) => {
      let applicantName = '';
      let applicantEmail = '';
      let fileBuffer = null;
      let fileMimetype = '';
      let fileName = '';

      const bb = busboy({ headers: req.headers });

      bb.on('file', (fieldname, file, info) => {
        fileName = info.filename;
        fileMimetype = info.mimeType;

        console.log('[Upload] File received:', {
          fieldname,
          fileName,
          fileMimetype,
        });

        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
          console.log('[Upload] File buffered:', fileBuffer.length, 'bytes');
        });
      });

      bb.on('field', (fieldname, value) => {
        if (fieldname === 'applicantName') applicantName = value;
        if (fieldname === 'applicantEmail') applicantEmail = value;
      });

      bb.on('close', async () => {
        try {
          if (!fileBuffer) {
            return resolve(
              res.status(400).json({ error: 'No file provided' })
            );
          }

          // Validate file type
          const ALLOWED_TYPES = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
          ];

          if (!ALLOWED_TYPES.includes(fileMimetype)) {
            return resolve(
              res.status(400).json({
                error: `Invalid file type: ${fileMimetype}`,
              })
            );
          }

          // Validate file size (10MB)
          const MAX_SIZE = 10 * 1024 * 1024;
          if (fileBuffer.length > MAX_SIZE) {
            return resolve(
              res.status(400).json({
                error: `File too large: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB (max 10MB)`,
              })
            );
          }

          console.log('[Upload] Starting Cloudinary upload for:', applicantEmail);

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
                console.error('[Upload] Cloudinary error:', error.message);
                return resolve(
                  res.status(500).json({
                    error: 'Upload to Cloudinary failed',
                    details: error.message,
                  })
                );
              }

              console.log('[Upload] Success:', result.secure_url);
              return resolve(
                res.status(200).json({
                  success: true,
                  url: result.secure_url,
                  publicId: result.public_id,
                  fileSize: result.bytes,
                  uploadedAt: new Date().toISOString(),
                })
              );
            }
          );

          // Pipe buffer to upload stream
          const bufferStream = Readable.from([fileBuffer]);
          bufferStream.pipe(uploadStream);
        } catch (error) {
          console.error('[Upload] Unexpected error:', error);
          return resolve(
            res.status(500).json({
              error: 'Upload failed',
              details: error instanceof Error ? error.message : String(error),
            })
          );
        }
      });

      bb.on('error', (error) => {
        console.error('[Upload] Busboy error:', error);
        return resolve(
          res.status(400).json({
            error: 'Invalid request',
            details: error.message,
          })
        );
      });

      req.pipe(bb);
    });
  } catch (error) {
    console.error('[Upload] Handler error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
