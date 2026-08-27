const cloudinary = require('../config/cloudinary')

function uploadFile(file, folder = 'wiryaa') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    }, (error, result) => {
      if (error) return reject(error)
      return resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      })
    })
    stream.end(file.buffer)
  })
}

async function uploadProfileFiles(files = {}) {
  const uploaded = await Promise.all(Object.entries(files).map(async ([field, entries]) => {
    if (field === 'certificationAttachments') return [field, await Promise.all(entries.map((file) => uploadFile(file, 'wiryaa/find-jobs')))]
    return [field, await uploadFile(entries[0], 'wiryaa/find-jobs')]
  }))
  return Object.fromEntries(uploaded)
}

module.exports = { uploadFile, uploadProfileFiles }
