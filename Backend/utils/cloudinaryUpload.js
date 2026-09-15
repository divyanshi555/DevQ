import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

export const uploadBufferToCloudinary = (buffer, folder, filename) => {
  const sanitizedFilename = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const publicId = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${sanitizedFilename}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder,
        public_id: publicId,
        type: 'authenticated'
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          secure_url: cloudinary.url(result.public_id, {
            resource_type: 'raw',
            type: 'authenticated',
            secure: true,
            sign_url: true
          }),
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  const authenticatedResult = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    type: 'authenticated'
  });

  if (authenticatedResult.result === 'ok') {
    return authenticatedResult;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    type: 'upload'
  });
};

export const uploadImageBufferToCloudinary = (buffer, folder, publicId) => (
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder,
        public_id: publicId,
        overwrite: true,
        invalidate: true
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  })
);

export const deleteImageFromCloudinary = (publicId) => (
  cloudinary.uploader.destroy(publicId, {resource_type: 'image', invalidate: true})
);
