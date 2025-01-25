import multer from "multer";
import fs from 'fs'
import { nanoid } from "nanoid";

export const fileTypes = {
    image : ['image/jpeg', 'image/png', 'image/webp', 'image/svg'],
    video : ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv'],
    pdf : ['application/pdf'],
    audio : ['audio/mp3', 'audio/aac', 'audio/ogg', 'audio/wav']
}
const multerLocal = (validTypes = [], path = "generals") => {
    const uploadPath = `uploads/${path}`
    if(!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, {recursive : true})
    }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = nanoid(5) + file.originalname
      cb(null, uniqueSuffix);
    },
  });
  const fileFilter =  (req, file, cb) => {
    if(validTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new Error('invalid file type.'), false)
    }
  }
  const upload = multer({ storage, fileFilter });
  return upload
};
export default multerLocal
