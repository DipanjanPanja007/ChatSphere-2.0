import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import "dotenv/config"

// Configuration of cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath, picName) => {

    try {
        if (!localFilePath) {
            console.log("local path not found when uploading on cloudinary");
            return null;
        }

        /* 
         * todo:  Delete previous Image if exists
         */

        // upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { public_id: `${picName}` })
        // file uploaded successfully
        console.log("file uploaded successfully", response.url);
        console.log(response);
        return response;

    } catch (error) {
        // remove the locally saved temp file if upload fails
        console.log(error);

        return null;
    } finally {
        fs.unlinkSync(localFilePath)
    }
};


const deleteFromCloudinary = async (imageUrl) => {

    const urlArray = imageUrl.split("/");
    const fileName = urlArray[urlArray.length - 1];
    const imageName = fileName.split(".")[0] + "." + fileName.split(".")[1];
    console.log("imageName", imageName);


    cloudinary.uploader.destroy(imageName, (error, result) => {
        console.log(error, result);
    })

};

export { uploadOnCloudinary, deleteFromCloudinary }