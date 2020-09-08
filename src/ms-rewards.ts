import puppeteer from 'puppeteer';
import { credentials } from './config';
import { randomInt } from './randomInt';

export async function getSearchLinks(browser: puppeteer.Browser) {
  const page = await browser.newPage();

  await page.goto('https://www.bing.com/');
  await page.waitFor('#crs_pane a');

  const links = page.evaluate(() =>
    Array.from(document.querySelectorAll('#crs_pane a')).map(
      (a: HTMLAnchorElement) => a.textContent
    )
  );

  await page.close();

  return links;
}

export async function login(browser: puppeteer.Browser, isMobile = false) {
  const page = await browser.newPage();
  if (isMobile) {
    page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25'
    );
  }

  // Navigate to the login page
  // Ensure username and password are given
  if (!credentials.username) {
    console.error('username is required but was not given');
    process.exit(1);
  } else if (!credentials.password) {
    console.error('password is required but was not given');
    process.exit(1);
  }

  await page.goto('https://login.live.com');

  // Login
  await page.type('[name="loginfmt"]', credentials.username, { delay: 32 });
  const formHandle = await page.$('form');
  await formHandle.press('Enter');
  await page.waitFor('.has-identity-banner');
  await page.type('[name="passwd"]', credentials.password, { delay: 32 });
  await formHandle.press('Enter');
  await page.waitForNavigation();
  page.close();
}

export async function runSearch(
  browser: puppeteer.Browser,
  text: string,
  isMobile = false
) {
  const searchPage = await browser.newPage();
  if (isMobile) {
    searchPage.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25'
    );
  } else {
    searchPage.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.41'
    );
  }

  await searchPage.goto('https://bing.com/');
  await searchPage.waitFor(500);

  // Check if log in carried over
  // await searchPage.evaluate(async () => {
  //   const signInAnchor: HTMLAnchorElement = document.querySelector('#id_l');
  //   const loggedInUsername = signInAnchor.textContent;
  //   const signedOut = loggedInUsername.toLocaleLowerCase() === 'sign in';
  //
  //   if (!signedOut) return signedOut;
  //
  //   // Click sign in if necessary
  //   signInAnchor.click();
  //
  //   // HACK: Wait arbitrary time for cookies to be loaded.
  //   return new Promise(resolve => setTimeout(resolve, 1000));
  // });

  await searchPage.type('[name="q"]', text, { delay: 26 });
  const formHandle = await searchPage.$('#sb_form');
  await formHandle.press('Enter');
  await searchPage.waitForNavigation();
  await searchPage.waitFor(randomInt(2000, 5000));

  await searchPage.close();
}
