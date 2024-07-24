const puppeteer = require('puppeteer');
const { Semaphore } = require('async-mutex');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const simulateView = async (url, ip, userAgent, semaphore, duration = 60000) => {
  await semaphore.acquire();
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({
      'X-Forwarded-For': ip,
      'User-Agent': userAgent,
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log(`Started streaming video for IP ${ip}`);

    await delay(duration);

    console.log(`Finished streaming video for IP ${ip}`);
  } catch (error) {
    console.error(`Error simulating view for IP ${ip}: ${error.message}`);
  } finally {
    await browser.close();
    semaphore.release();
  }
};

const generateRandomIp = () => {
  const getRandomSegment = () => Math.floor(Math.random() * 256);
  return `192.${getRandomSegment()}.${getRandomSegment()}.${getRandomSegment()}`;
};

const main = async () => {
  const videoUrl = 'https://www.youtube.com/watch?v=VwVqetd2Mxc';
  const userCount = 9; 
  const maxConcurrentViews = 3;
  const viewDuration = 60000; // Duration to simulate watching the video (1 minute)
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1',
  ];

  const semaphore = new Semaphore(maxConcurrentViews);
  const viewPromises = [];

  for (let i = 0; i < userCount; i++) {
    const userAgent = userAgents[i % userAgents.length];
    const ip = generateRandomIp();
    console.log(`Simulating view from IP: ${ip} with User-Agent: ${userAgent}`);
    viewPromises.push(simulateView(videoUrl, ip, userAgent, semaphore, viewDuration));
  }

  await Promise.all(viewPromises);

  console.log('Simulated views completed.');
};

main();
