const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function main() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-blink-features=AutomationControlled',
            ],
            ignoreHTTPSErrors: true,
            defaultViewport: null,
        });

        const page = await browser.newPage();
        await setupPage(page);

        console.log("Navigating to the login page...");
        await page.goto("https://filings.dos.ny.gov/ords/corpanc/r/ecorp/login_desktop", { 
            waitUntil: 'networkidle0', 
            timeout: 60000 
        });
        console.log("Page loaded.");

        await randomSleep(3000, 5000);

        await performLogin(page);

        console.log("Waiting for the list to appear...");
        await page.waitForSelector('ul.t-LinksList', { visible: true, timeout: 60000 });

        console.log("Extracting the first link URL...");
        const firstLinkUrl = await page.evaluate(() => {
            const firstLink = document.querySelector('ul.t-LinksList li.t-LinksList-item:nth-child(1) a.t-LinksList-link');
            return firstLink ? firstLink.getAttribute('href') : null;
        });
        await randomSleep(3000, 5000);

        if (!firstLinkUrl) {
            throw new Error("Couldn't find the first link URL");
        }

        console.log("Opening the first link URL...");
        await page.goto(new URL(firstLinkUrl, page.url()).href, { waitUntil: 'networkidle0' });

        console.log("First link page loaded.");
        await randomSleep(3000, 5000);

        console.log("Extracting the second link URL...");
        const secondLinkUrl = await page.evaluate(() => {
            const secondLink = document.querySelector('ul.t-LinksList li.t-LinksList-item:nth-child(2) a.t-LinksList-link');
            return secondLink ? secondLink.getAttribute('href') : null;
        });
        await randomSleep(3000, 5000);

        if (!secondLinkUrl) {
            throw new Error("Couldn't find the second link URL");
        }

        console.log("Opening the second link URL...");
        await page.goto(new URL(secondLinkUrl, page.url()).href, { waitUntil: 'networkidle0' });

        console.log("Second link page loaded.");

        await randomSleep(3000, 5000);
        await addData(page);

    } catch (e) {
        console.error("Main function error:", e);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function setupPage(page) {
    await page.setViewport({ 
        width: 1920 + Math.floor(Math.random() * 100), 
        height: 1080 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });

    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(60000);

    await page.evaluate(() => {
        window.scrollTo = (x, y) => {
            window.scrollX = x;
            window.scrollY = y;
        };
    });

    await page.evaluate(() => {
        Object.defineProperty(navigator, 'platform', { get: () => ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)] });
        Object.defineProperty(navigator, 'productSub', { get: () => '20100101' });
    });
}

async function randomSleep(min = 1000, max = 2000) {
    const sleepTime = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, sleepTime));
}

async function performLogin(page) {
    try {
        console.log("Attempting to login...");

        await page.waitForSelector('form', { visible: true, timeout: 30000 });

        await page.evaluate(() => {
            const usernameField = document.querySelector('input[name="P101_USERNAME"]');
            const passwordField = document.querySelector('input[name="P101_PASSWORD"]');
            const submitButton = document.querySelector('button#P101_LOGIN');

            if (!usernameField || !passwordField || !submitButton) {
                throw new Error("Couldn't find login elements");
            }

            usernameField.value = "redberyl";
            passwordField.value = "yD7?ddG0";

            submitButton.click();
        });

        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 })
            .catch(() => console.log("Navigation or response wait timed out."));

        console.log("Login success");
    } catch (e) {
        console.error("Login fail:", e);
    }
}

async function addData(page) {
    try {
        console.log("Attempting to add the name");

        await page.waitForSelector('form', { visible: true, timeout: 30000 });

        await page.evaluate(() => {
            const nameField = document.querySelector('input[name="P2_ENTITY_NAME"]');
            const submitButton = document.querySelector('button.t-Button--hot');

            if (!nameField || !submitButton) {
                throw new Error("Couldn't find name field or submit button");
            }

            nameField.value = "505050jar llc";

            submitButton.click();
        });

        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 })
            .catch(() => console.log("Navigation or response wait timed out."));

        console.log("Name added and continue button clicked.");
        await fillNextPage(page);
    } catch (e) {
        console.error("Adding name failed:", e);
    }
}

async function fillNextPage(page) {
    try {
        console.log("Filling the next page...");

        await page.waitForSelector('div#P4_INITIAL_STATEMENT_CONTAINER', { visible: true, timeout: 30000 });

        await page.evaluate(() => {
            const checkbox = document.querySelector('input#P4_INITIAL_STATEMENT_0');
            const nameField = document.querySelector('input[name="P4_ENTITY_NAME"]');
            const lawCheckbox = document.querySelector('input[name="P4_PURPOSES"]');
            const selectCountry = document.querySelector('#P4_COUNTY');

            if (!checkbox || !nameField || !lawCheckbox || !selectCountry) {
                throw new Error("Couldn't find the required elements");
            }

            checkbox.click();
            nameField.value = "505050jar llc";
            lawCheckbox.click();
            selectCountry.value = "4";
        });

        console.log("Checkbox and fields set.");

        await randomSleep(3000, 5000);
        await fillAdditionalFields(page);
    } catch (e) {
        console.error("Filling the next page failed:", e);
    }
}

async function fillAdditionalFields(page) {
    try {
        console.log("Filling the additional fields...");

        await page.waitForSelector('input[name="P4_SOP_NAME"]', { visible: true, timeout: 30000 });

        await page.evaluate(() => {
            // Fill the radio button
            document.querySelector('input[name="P4_SOP_ADDR_OPTION"][value="1"]').checked = true;
            
            // Fill the text fields
            document.querySelector('input[name="P4_SOP_NAME"]').value = 'John Doe';
            document.querySelector('input[name="P4_SOP_ADDR1"]').value = '123 Main Street';
            document.querySelector('input[name="P4_SOP_ADDR2"]').value = 'Suite 456';
            document.querySelector('input[name="P4_SOP_CITY"]').value = 'Albany';
            const selectState= document.querySelector('#P4_SOP_STATE');

            selectState.value="NY";

            const zipcode=document.querySelector('input[name="P4_SOP_POSTAL_CODE"]')

            zipcode.value="11557"

            

            // // Display required containers if they are initially hidden
            // document.querySelector('#P4_SOP_DISCLAIMER_CONTAINER').style.display = 'block';
            // document.querySelector('#P4_SOP_SERVICE_COMPANY_CONTAINER').style.display = 'block';

            // // Fill the service company dropdown (if needed)
            // document.querySelector('select[name="P4_SOP_SERVICE_COMPANY"]').value = '1040 EXPRESS ACCOUNTING SERVICES LLC';
        });

        console.log("Additional fields filled.");

        await randomSleep(3000, 5000);

        // Click the submit button to continue to the next page if required
        await page.evaluate(() => {
            const submitButton = document.querySelector('button.t-Button--hot');
            if (submitButton) {
                submitButton.click();
            }
        });

        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 })
            .catch(() => console.log("Navigation or response wait timed out."));

        console.log("Next step completed.");
    } catch (e) {
        console.error("Filling additional fields failed:", e);
    }
    await randomSleep(6000, 9000);
}

main();
