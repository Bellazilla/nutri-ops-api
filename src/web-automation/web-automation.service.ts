import { Injectable } from '@nestjs/common';
import { getLatestProductFile as getLatestPowerbodyFile } from 'utilities/supplier-adapters/powerbody/get-latest-product-file';
import { getLatestProductFile as getLatestPrometeusFile } from 'utilities/supplier-adapters/prometues/get-latest-product-file';
import * as fs from 'fs';
import { ErrorLogsService } from 'error-logs/error-logs.service';
import { ErrorLogType } from 'error-logs/error-logs.entity';
import { EmailServiceService } from 'email-service/email-service.service';
import { EmailType } from 'email-service/email-service.entity';
@Injectable()
export class WebAutomationService {
  constructor(
    private errorLogsService: ErrorLogsService,
    private emailService: EmailServiceService,
  ) {}

  async getLatestPrometeusFile() {
    const folderPath = './test-folder/prometeus';
    try {
      await getLatestPrometeusFile();
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error(`Error reading folder: ${err}`);
        } else {
          console.log('List of files in the folder:');
          files.forEach((file) => {
            console.log(file);
            fs.rename(
              `${folderPath}/${file}`,
              `${folderPath}/products.xls`,
              () => {
                if (err) {
                  console.error('error renaming file');
                } else {
                  console.log('File has been renamed successfully.');
                }
              },
            );
          });
        }
      });

      return 'succesfully updated prometeus file';
    } catch (e) {
      const errorMessage = `Downloading of file using Puppeteer, Check the logs for more information.`;
      this.errorLogsService.create({
        type: ErrorLogType.ProductSync,
        description: errorMessage,
      });
      console.error('somethin went wrong', e);
      if (process.env.ADMIN_EMAIL_ADDRESS) {
        await this.emailService.send({
          recipient: process.env.ADMIN_EMAIL_ADDRESS,
          subject: 'NutriOps - File Download Failure',
          body: errorMessage,
          type: EmailType.Failure,
        });
      }
      return {
        status: 500,
        error: e,
      };
    }
  }

  async getLatestPowerbodyProductFile() {
    const folderPath = './test-folder';
    try {
      await getLatestPowerbodyFile();
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error(`Error reading folder: ${err}`);
        } else {
          console.log('List of files in the folder:');
          files.forEach((file) => {
            console.log(file);
            fs.rename(
              `${folderPath}/${file}`,
              `${folderPath}/powerbody.xls`,
              () => {
                if (err) {
                  console.error('error renaming file');
                } else {
                  console.log('File has been renamed successfully.');
                }
              },
            );
          });
        }
      });

      return 'succesfully updated powerbody file';
    } catch (e) {
      const errorMessage = `Downloading of file using Puppeteer, Check the logs for more information.`;
      this.errorLogsService.create({
        type: ErrorLogType.ProductSync,
        description: errorMessage,
      });
      console.error('somethin went wrong', e);
      if (process.env.ADMIN_EMAIL_ADDRESS) {
        await this.emailService.send({
          recipient: process.env.ADMIN_EMAIL_ADDRESS,
          subject: 'NutriOps - File Download Failure',
          body: errorMessage,
          type: EmailType.Failure,
        });
      }
      return {
        status: 500,
        error: e,
      };
    }
  }
}
