/**
 * Vercel Serverless Function — /api/upload-resume
 * Handles resume/CV file uploads to Cloudinary with unsigned uploads.
 * Requires CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in env vars.
 */

import busboy from 'busboy';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';

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
    if (!cloudName) {
      console.error('[Upload] Missing Cloudinary cloud name');
      return res.status(500).json({
        error: 'Server configuration error - Cloud name not set',
      });
    }

    console.log('[Upload] Using cloud:', cloudName, 'preset:', uploadPreset);

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

          // Use unsigned upload API
          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
          const publicId = `${applicantEmail}-${Date.now()}`;
          
          // Create FormData for multipart upload
          const formData = new FormData();
          formData.append('file', new Blob([fileBuffer], { type: fileMimetype }), fileName);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', `lifewood/resumes/${new Date().getFullYear()}`);
          formData.append('public_id', publicId);
          formData.append('type', 'upload');

          try {
            const uploadRes = await fetch(uploadUrl, {
              method: 'POST',
              body: formData,
            });

            if (!uploadRes.ok) {
              const errorData = await uploadRes.json();
              console.error('[Upload] Cloudinary error:', errorData);
              return resolve(
                res.status(500).json({
                  error: 'Upload to Cloudinary failed',
                  details: errorData.error?.message || 'Unknown error',
                })
              );
            }

            const result = await uploadRes.json();
            const publicUrl = result.secure_url;

            console.log('[Upload] Success:', {
              publicUrl,
              resourceType: result.resource_type,
              deliveryType: result.type,
            });
            return resolve(
              res.status(200).json({
                success: true,
                url: publicUrl,
                publicId: result.public_id,
                resourceType: result.resource_type,
                deliveryType: result.type,
                fileSize: result.bytes,
                uploadedAt: new Date().toISOString(),
              })
            );
          } catch (uploadError) {
            console.error('[Upload] Upload error:', uploadError);
            return resolve(
              res.status(500).json({
                error: 'Upload to Cloudinary failed',
                details: uploadError instanceof Error ? uploadError.message : String(uploadError),
              })
            );
          }
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
