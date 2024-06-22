import User from "../models/user.model.js";
import { userEditFormat } from "./dto/user.dto.js";

//storage
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { bucketName, s3Client, aws_key } from "../storage/connectS3.js";

import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); 
    // $ne는 MongoDB에서 사용하는 비교 연산자 중 하나로, "not equal"을 의미합니다. 즉, $ne는 특정 필드의 값이 주어진 값과 같지 않은 문서를 찾을 때 사용됩니다.

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getObjectUrl = (bucketName, region, objectKey) => {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
};

export const createImgUrl = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // 파일을 공개적으로 읽을 수 있도록 설정
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const objectUrl = getObjectUrl(bucketName, aws_key.region, params.Key);

    res.json({ url: objectUrl });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUrlImgForGeneratedImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    console.log('Image downloaded successfully'); // 이미지 다운로드 성공 로그
    const imageBuffer = Buffer.from(response.data, 'binary');
    const fileName = `${uuidv4()}.png`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: imageBuffer,
      ContentType: 'image/png',
      ACL: 'public-read', // 파일을 공개적으로 읽을 수 있도록 설정
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    const objectUrl = getObjectUrl(bucketName, aws_key.region, params.Key);
    
    res.json({ url: objectUrl });
  } catch (error) {
    res.status(500).json({ message: 'Image download failed', error });
  }
}

export const editProfile = async (req, res) => {
	try {
		const updates = req.body;
    const user = req.user;

    // DTO에 존재하지 않는 키가 있는지 확인
    const updateKeys = Object.keys(updates);
    const userDto = Object.keys(userEditFormat(user));

    for (let key of updateKeys) {
      if (!userDto.includes(key)) {
        return res
          .status(404)
          .json({ error: `${key} 데이터는 수정할 수 없는 데이터 입니다.` });
      }
    }

    Object.assign(user, updates);

    const updatedUser = await user.save();

		res.status(200).json({updates: userEditFormat(updatedUser)})
	} catch (error) {
		console.error(error);
    res.status(500).json({ error: "Internal server error" });
	}
};