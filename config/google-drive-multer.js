/**
 * acknowledgement : this code is inspired by https://github.com/omardoma/multer-drive
 */
const { google } = require('googleapis');

class DriveStorage {
  constructor(opts) {
    this.drive = google.drive(Object.assign(opts, { version: 'v3' }));
  }

  _handleFile(
    req,
    { mimetype: mimeType, originalname: name, stream: body,fieldname:fieldname },
    cb,
  ) {
  //  console.log(mimeTypemname,body,fieldname) 
  if (mimeType != "video/webm" && mimeType != 'audio/webm') { throw Error("file not supported"); };
    this.drive.files
      .create(
        {
          resource: {
            name:req.filename,
            mimeType,
            "appProperties": {
                originalName: req.query.name,
                type: fieldname,
                userId: req.user._id,
                trackId: req.trackID
              }
          },
          media: {
            mimeType,
            body 
          },
        },
        { maxRedirects: 0 },
      )
      .then(({ data: { id: googleId } }) =>
        cb(null, {
          googleId,
        }),
      )
      .catch(err => cb(err, null));
  }

  _removeFile(req, { googleId: fileId }, cb) {
    this.drive.files.delete(
      {
        fileId,
      },
      cb,
    );
  }
}

module.exports = opts => new DriveStorage(opts)