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
    const file = entries[0]
    return [field, await uploadFile(file, 'wiryaa/find-jobs')]
  }))
  return Object.fromEntries(uploaded)
}

module.exports = { uploadFile, uploadProfileFiles }
