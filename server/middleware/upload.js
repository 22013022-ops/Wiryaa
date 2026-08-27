const multer = require('multer')
const AppError = require('../utils/AppError')

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
const fileFilter = (req, file, callback) => {
  if (allowedTypes.has(file.mimetype)) return callback(null, true)
  return callback(new AppError('Only image, video, PDF, DOC, and DOCX files can be uploaded.', 400))
}

const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 3 } })
const uploadFindJobsFiles = upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'resume', maxCount: 1 }, { name: 'workSamples', maxCount: 1 }])

module.exports = { uploadFindJobsFiles }
