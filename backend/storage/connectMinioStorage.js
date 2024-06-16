import * as Minio from 'minio';
import multer from 'multer';

export const minioClient = new Minio.Client({
  endPoint: 'localhost', // 추후 변경 가능
  port: 9000,
  useSSL: false,
  accessKey: 'minio',
  secretKey: 'test1234',
});

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });