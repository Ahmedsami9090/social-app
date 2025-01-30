import dotenv from 'dotenv'
import { v2 as cloudinary } from "cloudinary";
dotenv.config()

const serverUpload  = async (path, folder = "generals")=> {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET 
    });

    const uploadResult = cloudinary.uploader.upload(path, {
        use_filename : true,
        folder : folder,

    })
    
    return uploadResult
}

export default serverUpload