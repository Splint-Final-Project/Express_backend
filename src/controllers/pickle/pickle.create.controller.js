import { vectorDataSaver } from "../../langchain/dataSaver.js";
import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { verify, refund } from "../../utils/payments.js";

//storage
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucketName, s3Client, aws_key } from "../../storage/connectS3.js";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";

var today = new Date();
var tomorrow = new Date(today.setDate(today.getDate() + 1));

export const createPickle = async (req, res) => {
  const user = req.user;
  const { imp_uid } = req.body;

  if (!imp_uid) {
    try {
      const {
        discount,
        title,
        category,
        capacity,
        imgUrl,
        explanation,
        goals,
        cost,
        place,
        address,
        detailedAddress,
        areaCode,
        latitude,
        longitude,
        when,
        deadLine,
      } = req.body;
      const points = user.points.current;
      if (discount > points) {
        return res.status(400).json({
          message: "포인트가 부족합니다.",
        });
      }
      const totalCost = cost - discount;
      if (totalCost !== 0) {
        return res.status(400).json({
          message: "금액이 알맞지 않습니다.",
        });
      }
      // Deduct points from the user
      if (discount > 0) {
        user.points.current -= discount;
        user.points.history.push({
          type: "use",
          message: `피클 생성: ${title}`,
          date: new Date(),
          amount: discount,
          remaining: user.points.current,
        });
        await user.save();
      }

      const pickleData = {
        title,
        category,
        capacity,
        imgUrl,
        explanation,
        goals,
        cost,
        place,
        address,
        detailedAddress,
        areaCode,
        latitude,
        longitude,
        when,
        deadLine,
      };
      const newPickle = new Pickle({
        ...pickleData,
        // deadLine: tomorrow,
        viewCount: 0, // 초기 viewCount 설정
        isCancelled: false,
      });

      // 데이터베이스에 저장
      await newPickle.save();

      // 참가자 정보 생성
      const newParticipation = new Participation({
        user: req.user._id,
        pickle: newPickle._id,
        payment_uid: "points",
        amount: 0,
        discount: discount,
        status: "points",
        isLeader: true,
      });

      await newParticipation.save();

      // 벡터 db에 저장
      await vectorDataSaver(newPickle);
      res
        .status(201)
        .json({ message: "Pickle created successfully", pickle: newPickle });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  } else {
    try {
      // 이미 존재하는 결제정보인지 확인
      const already = await Participation.find({
        payment_uid: imp_uid,
      });

      if (already.length > 0) {
        // await refund(imp_uid);
        return res.status(400).json({
          message: "이미 존재하는 결제 정보입니다. 해킹이 의심됩니다.",
        });
      }

      // 결제 정보 단건 불러오기
      const { payment } = await verify(imp_uid);

      // 결제 정보가 없을 경우
      if (!payment?.amount) {
        const refundResult = await refund(imp_uid);
        return res.status(404).json({
          message: "결제 정보가 존재하지 않습니다. 피클 생성에 실패했습니다.",
          refundResult,
        });
      }
      const pickleData = JSON.parse(payment.custom_data);

      //결제 금액 확인
      if (
        pickleData.cost - pickleData.discount !== payment.amount ||
        payment.status !== "paid"
      ) {
        const refundResult = await refund(imp_uid);
        return res.status(400).json({
          message: "결제에 실패했습니다. 금액 위변조가 의심됩니다.",
          refundResult,
        });
      }

      if (pickleData.discount > user.points.current) {
        const refundResult = await refund(imp_uid);
        return res.status(400).json({
          message: "포인트가 부족합니다.",
          refundResult,
        });
      }
      if (pickleData.discount > 0) {
        user.points.current -= pickleData.discount;
        user.points.history.push({
          type: "use",
          message: `피클 생성: ${pickleData.title}`,
          date: new Date(),
          amount: pickleData.discount,
          remaining: user.points.current,
        });
        await user.save();
      }

      // 새로운 피클 생성
      const newPickle = new Pickle({
        ...pickleData,
        // deadLine: tomorrow,
        viewCount: 0, // 초기 viewCount 설정
        isCancelled: false,
      });

      // 데이터베이스에 저장
      await newPickle.save();

      // 참가자 정보 생성
      const newParticipation = new Participation({
        user: req.user._id,
        pickle: newPickle._id,
        payment_uid: imp_uid,
        amount: payment.amount,
        discount: pickleData.discount,
        status: "paid",
        isLeader: true,
      });

      await newParticipation.save();

      // 벡터 db에 저장
      await vectorDataSaver(newPickle);
      res
        .status(201)
        .json({ message: "Pickle created successfully", pickle: newPickle });
    } catch (error) {
      const refundResult = refund(imp_uid);
      res.status(500).json({
        message: error,
        refundResult,
      });
    }
  }
};

const getObjectUrl = (bucketName, region, objectKey) => {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
};

export const createImgUrl = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // 파일을 공개적으로 읽을 수 있도록 설정
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const objectUrl = getObjectUrl(bucketName, aws_key.region, params.Key);

    res.json({ url: objectUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUrlImgForGeneratedImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log(imageUrl);

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    console.log("Image downloaded successfully"); // 이미지 다운로드 성공 로그
    const imageBuffer = Buffer.from(response.data, "binary");
    const fileName = `${uuidv4()}.png`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: imageBuffer,
      ContentType: "image/png",
      ACL: "public-read", // 파일을 공개적으로 읽을 수 있도록 설정
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const objectUrl = getObjectUrl(bucketName, aws_key.region, params.Key);

    res.json({ url: objectUrl });
  } catch (error) {
    res.status(500).json({ message: "Image download failed", error });
  }
};
