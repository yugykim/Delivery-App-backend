import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = 'yugy-uber-eat-123';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly configService: ConfigService) {}
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: 'AKIAVWP24BI77PO2R3TF',
        secretAccessKey: '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',
      },
      region: 'ca-central-1',
    });
    //upload budcket
    try {
      const objectName = `${Date.now() + file.originalname}`;
      const params = {
        Body: file.buffer,
        Bucket: BUCKET_NAME,
        Key: objectName,
        ContentType: 'binary/octet-stream',
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      return null;
    }
  }
}
