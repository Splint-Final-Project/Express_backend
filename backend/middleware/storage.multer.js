import multer from "multer";
import path from 'path';
import fs from 'fs';

try {
  fs.readdirSync('images'); // 폴더 확인
} catch(err) {
  console.error('uploads 폴더가 없습니다. 폴더를 생성합니다.');
    fs.mkdirSync('images'); // 폴더 생성
}

export const upload = multer({
  storage: multer.diskStorage({ // 저장한공간 정보 : 하드디스크에 저장
      destination(req, file, done) { // 저장 위치
          done(null, 'images/'); // images 폴더 안에 저장
      },
      filename(req, file, done) { // 파일명을 어떤 이름으로 올릴지
          const ext = path.extname(file.originalname); // 파일의 확장자
          done(null, `1${ext}`); // 파일 이름을 1로 고정하고 확장자 유지
      }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5메가로 용량 제한
});