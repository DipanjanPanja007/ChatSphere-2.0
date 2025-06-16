import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import "dotenv/config"
import path from "path";
import mime from "mime-types";

// Configuration of cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath, picName) => {
    try {
        if (!localFilePath) {
            console.log("Local file path missing.");
            return null;
        }

        const mimeType = mime.lookup(localFilePath);
        const ext = path.extname(localFilePath).toLowerCase();

        // Determine correct resource_type
        let resourceType = "auto";

        if (mimeType?.startsWith("image/")) resourceType = "image";
        else if (mimeType?.startsWith("video/")) resourceType = "video";
        else if (mimeType?.startsWith("audio/")) resourceType = "video"; // still needed
        else resourceType = null; // ✅ for PDFs, ZIPs, DOCX, etc.

        if (!resourceType) return { skipped: true };

        const response = await cloudinary.uploader.upload(localFilePath, {
            public_id: picName,
            resource_type: resourceType,
        });

        console.log("✅ Uploaded:", response.secure_url);
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    } finally {
        fs.unlinkSync(localFilePath);
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