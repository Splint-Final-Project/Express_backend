import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import dotenv from "dotenv";

dotenv.config();

const aws_key = {
  access: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

export const s3Client = new S3Client({
  region: aws_key.region,
  credentials: {
    accessKeyId: aws_key.access,
    secretAccessKey: aws_key.secret,
  },
});

export const bucketName = 'pickle-time-ducket';  // 스펠링 틀린 거 짜치네요...ㅠㅠ

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });