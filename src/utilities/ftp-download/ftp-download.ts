import * as ftp from 'basic-ftp';
import * as fs from 'fs';

export const downloadFiles = async (directory: string, saveTo: string) => {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: 21,
    });

    // const productFilesDirectory =
    //   "/public_html/nutri-stock/medusa/powerbody.xls";
    const productFilesDirectory = directory;
    const localDirectory = './product_downloads';
    // const localFilePath = `${localDirectory}/powerbody.xls`;
    const localFilePath = `${localDirectory}/${saveTo}`;

    if (!fs.existsSync(localDirectory)) {
      fs.mkdirSync(localDirectory);
    }

    // Delete the local file if it already exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    const remoteFilePath = `${productFilesDirectory}`;
    await client.downloadTo(localFilePath, remoteFilePath);

    return {
      message: 'file downloaded and any existing local file deleted.',
    };
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
};
