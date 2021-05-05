const AWSXRay = require('aws-xray-sdk-core');

AWSXRay.setLogger(console);

async function launchBrowser() {
  try { // for aws-based image
    const chromium = require('chrome-aws-lambda');
    console.info('launching chrome-aws-lambda browser');
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    return browser;
  } catch (e) { // for custom-built image
    console.info('launching puppeteer browser');
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: true,
      dumpio: true,
      args: [
        '--autoplay-policy=user-gesture-required',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-domain-reliability',
        '--disable-extensions',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-notifications',
        '--disable-offer-store-unmasked-wallet-cards',
        '--disable-popup-blocking',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-setuid-sandbox',
        '--disable-speech-api',
        '--disable-sync',
        '--disk-cache-size=33554432',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-sandbox',
        '--no-zygote',
        '--password-store=basic',
        '--use-gl=swiftshader',
        '--use-mock-keychain',
        '--single-process',
      ],
    });
    return browser;
  }
}

function createNewSubsegment(subsegmentName) {
  const segment = AWSXRay.getSegment();
  if (!segment) return { close() { } };
  return segment.addNewSubsegment(subsegmentName);
}

async function lambdaHandler(event, context) {
  console.info(`EVENT ${JSON.stringify(event, null, 2)}`);
  AWSXRay.setContextMissingStrategy('LOG_ERROR');
  const browserLaunchSubsegment = createNewSubsegment('browser launch');
  const browser = await launchBrowser();
  browserLaunchSubsegment.close();
  console.info('browser launched');
  const newTabSubsegment = createNewSubsegment('open new tab');
  const page = await browser.newPage();
  newTabSubsegment.close();
  console.info('opened new tab');
  let extractedText = '';
  try {
    const pageGotoSubsegment = createNewSubsegment('opening url');
    await page.goto(event.url, {
      waitUntil: 'networkidle0',
      timeout: 10 * 1000,
    });
    pageGotoSubsegment.close();
    console.info('page opened');
    const textExtractSubsegment = createNewSubsegment('extracting text');
    extractedText = await page.$eval('*', (el) => el.innerText);
    textExtractSubsegment.close();
    console.info('text extracted');
  } finally {
    console.info('finally');
    await page.close();
    console.info('page closed');
    await browser.close();
    console.info('browser closed');
  }
  return extractedText;
}

module.exports = { handler: lambdaHandler };
