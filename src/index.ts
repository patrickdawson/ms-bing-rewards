import puppeteer from 'puppeteer';
import { getSearchLinks, login, runSearch } from './ms-rewards';
import randomWords = require('random-words');

const isDev = process.env.NDOE_ENV !== 'production';

async function main(isMobile: boolean) {
  const browser = await puppeteer.launch({
    // devtools: isDev
    headless: false
  });

  await login(browser, isMobile);

  // Create a list of searches to run, but don't run them yet
  const searchCount = isMobile ? 21 : 31;
  const runnableSearches = randomWords(searchCount).map(word => () =>
    runSearch(browser, word, isMobile)
  );

  // Open searches in browser serially
  for (const search of runnableSearches) {
    await search();
  }

  await browser.close();
}

// main().catch(err => console.log(err));
if (process.argv.length >= 3 && process.argv[2] === 'mobile') {
  console.log('Mobile Search');
  main(true).catch(err => console.log(err));
} else {
  console.log('Desktop Search');
  main(false).catch(err => console.log(err));
}
