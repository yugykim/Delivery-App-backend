import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'Kimchinumbereats123';

@Controller('upload')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    AWS.config.update({
      credentials: {
        accessKeyId: 'AKIAVWP24BI7YNRFYJLW',
        secretAccessKey: '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',
      },
    });
    //upload budcket
    try {
      //it should be very unique name
      /*
      //create bucket for the begining
      const upload = await new AWS.S3()
        .createBucket({ Bucket: 'Kimchinumbereats123' })
        .promise();
      */
      const objectName = `${Date.now() + file.originalname}`;
      const upload = await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      console.log(upload);
    } catch (e) {
      console.log(e);
    }
  }
}
