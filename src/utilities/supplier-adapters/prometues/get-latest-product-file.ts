import puppeteer from 'puppeteer';

export const getLatestProductFile = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'], // Use this option if you encounter sandbox issues
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1000, height: 800 });

  try {
    await page.goto('https://www.prometeus.nl/i/downloads.html');
    // Log in
    await page.click('#btnUserMenu');
    await page.waitForSelector('#txtUserName_new');
    await page.type('#txtUserName_new', 'info@nutri.se');
    await page.type('#txtPassword_new', 'Sonysony2022!');
    await page.click('#btnSubmitLogin_new');

    await page.waitForNavigation();

    const downloadButton = await page.$("//a[contains(., 'Click here')]");
    if (downloadButton) {
      await (downloadButton as any).click();
    }

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './test-folder/prometeus',
    });

    await page.waitForNetworkIdle(); // Wait until the download is complete
  } catch (e) {
    console.error(
      'something went wrong while getting latest prometeus file',
      e,
    );
  } finally {
    await browser.close();
  }
};
