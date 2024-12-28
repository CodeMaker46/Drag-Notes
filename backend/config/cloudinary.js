const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Verify environment variables
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Log environment variables (without secrets)
console.log('Cloudinary Environment:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
  apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
  apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on mimetype
    const resourceType = file.mimetype.startsWith('image/') ? 'image' : 
                        file.mimetype.startsWith('video/') ? 'video' : 'raw';

    return {
      folder: 'paaword',
      resource_type: resourceType,
      allowed_formats: [
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
        // Documents
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        // Text
        'txt', 'rtf', 'csv',
        // Code
        'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml',
        // Archives
        'zip', 'rar', '7z',
        // Audio
        'mp3', 'wav', 'ogg',
        // Video
        'mp4', 'avi', 'mov', 'wmv'
      ],
      public_id: `${Date.now()}-${file.originalname}`,
      chunk_size: 6000000, // 6MB chunks for better upload handling
      timeout: 600000 // 10 minutes timeout for large files
    };
  }
});

// Verify Cloudinary configuration
cloudinary.api.ping()
  .then(() => {
    console.log('✅ Cloudinary configuration verified successfully');
  })
  .catch((error) => {
    console.error('❌ Cloudinary configuration error:', error.message);
    // Don't throw error, just log it
  });

module.exports = {
  cloudinary,
  storage
};
