const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const winston = require('winston');

puppeteer.use(StealthPlugin());

// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ],
});

async function main() {
    let browser;

    const jsonData = {
        "nameField": "505050jar llc",
        "checked": true,
        "sop": {
            "name": "John Doe",
            "addr1": "123 Main Street",
            "addr2": "Suite 456",
            "city": "Albany",
            "postal_code": "11557"
        },
        "organizer": {
            "name": "Alex Englard",
            "addr1": "301 Mill Road, Suite U-5",
            "city": "Hewlett",
            "postal_code": "11557",
            "signature": "alex englard"
        },
        "filer": {
            "name": "Alex Englard",
            "addr1": "301 Mill Road, Suite U-5",
            "city": "Hewlett",
            "postal_code": "11557"
        },
        "registeredAgent": {
            "name": "Registered Agent Name",
            "addr1": "Agent Address 1",
            "addr2": "Agent Address 2",
            "city": "Agent City",
            "postal_code": "Agent Postal Code"
        }
    };

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

        await retry(async () => {
            logger.info("Navigating to the login page...");
            try {
                await page.goto("https://filings.dos.ny.gov/ords/corpanc/r/ecorp/login_desktop", { 
                    waitUntil: 'networkidle0', 
                    timeout: 60000 
                });
                logger.info("Page loaded.");
            } catch (err) {
                if (err.message.includes('net::ERR_CONNECTION_RESET')) {
                    logger.warn("Connection reset error encountered. Retrying...");
                    throw err;  // Throw error to trigger retry
                } else {
                    throw err;  // Rethrow other errors
                }
            }
        });

        await randomSleep(3000, 5000);
        await performLogin(page);

        logger.info("Waiting for the list to appear...");
        await page.waitForSelector('ul.t-LinksList', { visible: true, timeout: 60000 });

        logger.info("Opening the link Domestic Business Corporation and Domestic Limited Liability Company...");
        const firstLinkUrl = await page.evaluate(() => {
            const firstLink = document.querySelector('ul.t-LinksList li.t-LinksList-item:nth-child(1) a.t-LinksList-link');
            return firstLink ? firstLink.getAttribute('href') : null;
        });
        await randomSleep(3000, 5000);

        if (!firstLinkUrl) {
            throw new Error("Couldn't find the Domestic Business Corporation and Domestic Limited Liability Company");
        }

        logger.info("Opening the Domestic Business Corporation and Domestic Limited Liability Company...");
        await page.goto(new URL(firstLinkUrl, page.url()).href, { waitUntil: 'networkidle0' });

        logger.info("Domestic Business Corporation and Domestic Limited Liability Company page loaded.");
        await randomSleep(3000, 5000);

        logger.info("Getting the URL for Articles of Organization for a Domestic Limited Liability Company (not for professional service limited liability companies)...");
        const secondLinkUrl = await page.evaluate(() => {
            const secondLink = document.querySelector('ul.t-LinksList li.t-LinksList-item:nth-child(2) a.t-LinksList-link');
            return secondLink ? secondLink.getAttribute('href') : null;
        });
        await randomSleep(3000, 5000);

        if (!secondLinkUrl) {
            throw new Error("Couldn't find the Articles of Organization for a Domestic Limited Liability Company (not for professional service limited liability companies) URL");
        }

        logger.info("Opening the Articles of Organization for a Domestic Limited Liability Company (not for professional service limited liability companies) URL...");
        await page.goto(new URL(secondLinkUrl, page.url()).href, { waitUntil: 'networkidle0' });

        logger.info("Articles of Organization for a Domestic Limited Liability Company (not for professional service limited liability companies) page loaded.");
        await randomSleep(3000, 5000);
        await addData(page, jsonData);

        logger.info("Waiting for the preview page to be loaded...");
        await page.waitForSelector('.page-6.app-EFILING', { visible: true, timeout: 60000 });

        logger.info("Next step completed and preview loaded.");

        await randomSleep(180000, 220000);

    } catch (e) {
        logger.error("Main function error:", e);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function setupPage(page) {
    await page.setViewport({ 
        width: 1920, 
        height: 1080, 
        deviceScaleFactor: 1, 
        hasTouch: false, 
        isLandscape: true, 
        isMobile: false 
    });

    const { width, height } = await page.evaluate(() => ({
        width: window.screen.availWidth,
        height: window.screen.availHeight
    }));
    await page.setViewport({ width, height });

    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(120000);

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
        logger.info("Attempting to login...");

        await page.waitForSelector('form', { visible: true, timeout: 120000 });

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

        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 })
            .catch(() => logger.warn("Navigation or response wait timed out."));

        logger.info("Login success");
    } catch (e) {
        logger.error("Login fail:", e);
    }
}

async function addData(page, data) {
    try {
        logger.info("Attempting to add the name");

        await page.waitForSelector('form', { visible: true, timeout: 120000 });

        await page.evaluate((data) => {
            const nameField = document.querySelector('input[name="P2_ENTITY_NAME"]');
            const checkbox = document.querySelector('input[name="P2_CHECKBOX"]');
            const submitButton = document.querySelector('button.t-Button--hot');

            if (!nameField || !submitButton) {
                throw new Error("Couldn't find name field or submit button");
            }

            nameField.value = data.nameField;
            if (nameField.value !== "505050jar llc") {
                throw new Error(`The value for the entity name is incorrect. It should be 505050jar llc`);
            }

            if (checkbox) {
                checkbox.checked = data.checked;
            }

            submitButton.click();
        }, data);

        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 })
            .catch(() => logger.warn("Navigation or response wait timed out."));

        logger.info("Name added successfully");
    } catch (e) {
        await page.evaluate((message) => {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `Adding name failed: ${message}`;
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '0';
            errorDiv.style.left = '0';
            errorDiv.style.backgroundColor = 'red';
            errorDiv.style.color = 'white';
            errorDiv.style.padding = '10px';
            errorDiv.style.zIndex = '1000';
            document.body.appendChild(errorDiv);
        }, e.message);
        logger.error("Adding name failed:", e);
    }
}

async function fillNextPage(page, data) {
    try {
        logger.info("Filling the next page...");

        await page.waitForSelector('div#P4_INITIAL_STATEMENT_CONTAINER', { visible: true, timeout: 30000 });

        await page.evaluate((data) => {
            const radioButtons = document.querySelectorAll('input[name="P4_INITIAL_STATEMENT"]');
            if (radioButtons.length > 0) {
                radioButtons[0].checked = true;
            }

            document.querySelector('input[name="P4_ENTITY_NAME"]').value = data.nameField;
            document.querySelector('#P4_COUNTY').value = "4";

            const effectiveDate = document.querySelector('input#P4_EXISTENCE_OPTION_0');
            const Dissolution_Date = document.querySelector('input#P4_DISSOLUTION_OPTION_0');
            const liability_statement = document.querySelector('input#P4_LIAB_STATEMENT_0');

            if (effectiveDate) {
                effectiveDate.click();
                const radio1 = document.querySelector("input#P4_EXISTENCE_TYPE_0");
                const radio2 = document.querySelector("input#P4_EXISTENCE_TYPE_1");

                if (radio1 && radio1.checked) {
                    radio1.checked = true;
                } else if (radio2 && radio2.checked) {
                    const effectiveDateInput = document.querySelector('input[name="P4_EXIST_CALENDAR"]');
                    if (effectiveDateInput) {
                        effectiveDateInput.value = data.effectiveDate;

                        effectiveDateInput.dispatchEvent(new Event('change', { bubbles: true }));

                        const dateComponent = document.querySelector('#P4_EXIST_CALENDAR');
                        if (dateComponent) {
                            const event = new Event('ojInputDateValueChanged', { bubbles: true });
                            dateComponent.dispatchEvent(event);
                        }
                    }
                }
            }

            if (Dissolution_Date) {
                Dissolution_Date.click();
                const radio1 = document.querySelector("input#P4_DISSOLUTION_TYPE_0");
                const radio2 = document.querySelector("input#P4_DISSOLUTION_TYPE_1");

                if (radio1 && radio1.checked) {
                    radio1.checked = true;
                } else if (radio2 && radio2.checked) {
                    const effectiveDateInput = document.querySelector('input[name="P4_DIS_CALENDAR"]');
                    if (effectiveDateInput) {
                        effectiveDateInput.value = data.effectiveDate;

                        effectiveDateInput.dispatchEvent(new Event('change', { bubbles: true }));

                        const dateComponent = document.querySelector('#P4_DIS_CALENDAR');
                        if (dateComponent) {
                            const event = new Event('ojInputDateValueChanged', { bubbles: true });
                            dateComponent.dispatchEvent(event);
                        }
                    }
                }
            }

            if (liability_statement) {
                liability_statement.click();
            }

            const opt1 = document.querySelector("input#P4_SOP_ADDR_OPTION_0");
            const opt2 = document.querySelector("input#P4_SOP_ADDR_OPTION_1");

            if (opt1 && opt1.checked) {
                document.querySelector('input[name="P4_SOP_NAME"]').value = data.sop.name;
                document.querySelector('input[name="P4_SOP_ADDR1"]').value = data.sop.addr1;
                document.querySelector('input[name="P4_SOP_ADDR2"]').value = data.sop.addr2;
                document.querySelector('input[name="P4_SOP_CITY"]').value = data.sop.city;
                document.querySelector('input[name="P4_SOP_POSTAL_CODE"]').value = data.sop.postal_code;
            } else if (opt2 && opt2.checked) {
                const serviceCompanySelect = document.querySelector("#P4_SOP_SERVICE_COMPANY");
                if (serviceCompanySelect) {
                    serviceCompanySelect.value = "440";
                }
                document.querySelector('input[name="P4_SOP_NAME"]').value = data.sop.name;
                document.querySelector('input[name="P4_SOP_ADDR1"]').value = data.sop.addr1;
                document.querySelector('input[name="P4_SOP_ADDR2"]').value = data.sop.addr2;
                document.querySelector('input[name="P4_SOP_CITY"]').value = data.sop.city;
                document.querySelector('input[name="P4_SOP_POSTAL_CODE"]').value = data.sop.postal_code;
            }

            const agentOpt1 = document.querySelector("input#P4_AGENT_ADDR_OPTION_0");
            const agentOpt2 = document.querySelector("input#P4_AGENT_ADDR_OPTION_1");

            if (agentOpt1 && agentOpt1.checked) {
                document.querySelector('input[name="P4_AGENT_NAME"]').value = data.registeredAgent.name;
                document.querySelector('input[name="P4_AGENT_ADDR1"]').value = data.registeredAgent.addr1;
                document.querySelector('input[name="P4_AGENT_ADDR2"]').value = data.registeredAgent.addr2;
                document.querySelector('input[name="P4_AGENT_CITY"]').value = data.registeredAgent.city;
                document.querySelector('input[name="P4_AGENT_POSTAL_CODE"]').value = data.registeredAgent.postal_code;
            } else if (agentOpt2 && agentOpt2.checked) {
                const registeredAgentSelect = document.querySelector("#P4_AGENT_SERVICE_COMPANY");
                if (registeredAgentSelect) {
                    registeredAgentSelect.value = "440";
                }
            }

            document.querySelector('input[name="P4_ORGANIZER_NAME"]').value = data.organizer.name;
            document.querySelector('input[name="P4_ORGANIZER_ADDR1"]').value = data.organizer.addr1;
            document.querySelector('input[name="P4_ORGANIZER_CITY"]').value = data.organizer.city;
            document.querySelector('input[name="P4_ORGANIZER_POSTAL_CODE"]').value = data.organizer.postal_code;
            document.querySelector('input[name="P4_SIGNATURE"]').value = data.organizer.signature;

            document.querySelector('#P4_FILER_NAME').value = data.filer.name;
            document.querySelector('#P4_FILER_ADDR1').value = data.filer.addr1;
            document.querySelector('input[name="P4_FILER_CITY"]').value = data.filer.city;
            document.querySelector('input[name="P4_FILER_POSTAL_CODE"]').value = data.filer.postal_code;

        }, data);

        logger.info("Next page filled.");
    } catch (e) {
        await page.evaluate((message) => {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `Next page fill failed: ${message}`;
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '0';
            errorDiv.style.left = '0';
            errorDiv.style.backgroundColor = 'red';
            errorDiv.style.color = 'white';
            errorDiv.style.padding = '10px';
            errorDiv.style.zIndex = '1000';
            document.body.appendChild(errorDiv);
        }, e.message);
        logger.error("Filling next page failed:", e);
    }
    await page.evaluate(() => {
        const submitButton = document.querySelector('button.t-Button--hot');
        if (submitButton) {
            submitButton.click();
        }
    });
}

async function retry(fn, retries = 10, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            await fn();
            return;
        } catch (e) {
            logger.error(`Attempt ${i + 1} failed:`, e);
            if (e.message.includes('net::ERR_CONNECTION_RESET')) {
                logger.warn(`Connection reset error encountered. Retrying in ${delay / 1000} seconds...`);
            } else {
                throw e; // Rethrow non-retryable errors
            }
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw e;
            }
        }
    }
}

main();
