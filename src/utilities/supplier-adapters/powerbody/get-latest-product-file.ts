import puppeteer from 'puppeteer';

export const getLatestProductFile = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'], // Use this option if you encounter sandbox issues
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1000, height: 800 });

  try {
    await page.goto('https://www.powerbody.eu/customer/account/login/');
    // Log in
    await page.type('#login', 'info@nutri.se');
    await page.type('#password', 'Sonysony2022!');
    await page.keyboard.press('Enter');

    await page.waitForNavigation();

    page.click('.download-price-list a');

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './test-folder',
    });

    await page.waitForTimeout(30000); // Wait until the download is complete
  } catch (e) {
    console.error(
      'something went wrong while getting latest powerbody file',
      e,
    );
  } finally {
    await browser.close();
  }
};
