import crypto from "crypto";

export const encryptData = async (data) => {
  const cipher = crypto.createCipheriv(
    process.env.ENCRYPTION_ALGORITHM,
    Buffer.from(process.env.ENCRYPTION_KEY, "base64"),
    Buffer.from(process.env.ENCRYPTION_IV, "base64")
  );
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted
};

export const decryptData = async(encryption)=>{
  const decipher = crypto.createDecipheriv(
    process.env.ENCRYPTION_ALGORITHM,
    Buffer.from(process.env.ENCRYPTION_KEY, "base64"),
    Buffer.from(process.env.ENCRYPTION_IV, "base64")
  )
  let decrypted = decipher.update(encryption, "hex", "utf-8")
  decrypted += decipher.final()
  return decrypted
}




