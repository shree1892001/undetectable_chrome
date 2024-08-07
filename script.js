// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// puppeteer.use(StealthPlugin());

// async function main() {
//     let browser;

//     const jsonData = {
//         "nameField": "505050jar llc",
//         "checked": true,
//         "sop": {
//             "name": "John Doe",
//             "addr1": "123 Main Street",
//             "addr2": "Suite 456",
//             "city": "Albany",
//             "postal_code": "11557"
//         },
//         "organizer": {
//             "name": "Alex Englard",
//             "addr1": "301 Mill Road, Suite U-5",
//             "city": "Hewlett",
//             "postal_code": "11557",
//             "signature": "alex englard"
//         },
//         "filer": {
//             "name": "Alex Englard",
//             "addr1": "301 Mill Road, Suite U-5",
//             "city": "Hewlett",
//             "postal_code": "11557"
//         }
//     };

//     try {
//         browser = await puppeteer.launch({
//             headless: false,
//             args: [
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//                 '--disable-infobars',
//                 '--window-position=0,0',
//                 '--ignore-certifcate-errors',
//                 '--ignore-certifcate-errors-spki-list',
//                 '--disable-blink-features=AutomationControlled',
//             ],
//             ignoreHTTPSErrors: true,
//             defaultViewport: null,
//         });

//         const page = await browser.newPage();
//         await setupPage(page);

//         console.log("Navigating to the login page...");
//         await page.goto("https://filings.dos.ny.gov/ords/corpanc/r/ecorp/login_desktop", { 
//             waitUntil: 'networkidle0', 
//             timeout: 60000 
//         });
//         console.log("Page loaded.");

//         await randomSleep(3000, 5000);
//         await performLogin(page);

//         console.log("Waiting for the list to appear...");
//         await page.waitForSelector('ul.t-LinksList', { visible: true, timeout: 60000 });

//         console.log("Extracting the first link URL...");
//         const firstLinkUrl = await page.evaluate(() => {
//             const firstLink = document.querySelector('ul.t-LinksList li.t-LinksList-item:nth-child(1) a.t-LinksList-link');
//             return firstLink ? firstLink.getAttribute('href') : null;
//         });
//         await randomSleep(3000, 5000);

//         if (!firstLinkUrl) {
//             throw new Error("Couldn't find the first link URL");
//         }

//         console.log("Opening the first link URL...");
//         await page.goto(new URL(firstLinkUrl, page.url()).href, { waitUntil: 'networkidle0' });

//         console.log("First link page loaded.");
//         await randomSleep(3000, 5000);

//         console.log("Extracting the second link URL...");
//         const secondLinkUrl = await page.evaluate(() => {
//             const secondLink = document.querySelector('ul.t-LinksList li.t-LinksList-item:nth-child(2) a.t-LinksList-link');
//             return secondLink ? secondLink.getAttribute('href') : null;
//         });
//         await randomSleep(3000, 5000);

//         if (!secondLinkUrl) {
//             throw new Error("Couldn't find the second link URL");
//         }

//         console.log("Opening the second link URL...");
//         await page.goto(new URL(secondLinkUrl, page.url()).href, { waitUntil: 'networkidle0' });

//         console.log("Second link page loaded.");
//         await randomSleep(3000, 5000);
//         await addData(page, jsonData);

//         console.log("Waiting for the next page...");
//         await page.waitForSelector('.page-6.app-EFILING', { visible: true, timeout: 60000 });

//         console.log("Next step completed and new page loaded.");

//         await randomSleep(180000, 220000);

//     } catch (e) {
//         console.error("Main function error:", e);
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
// }

// async function setupPage(page) {
//     await page.setViewport({ 
//         width: 1920, 
//         height: 1080, 
//         deviceScaleFactor: 1, 
//         hasTouch: false, 
//         isLandscape: true, 
//         isMobile: false 
//     });

//     const { width, height } = await page.evaluate(() => ({
//         width: window.screen.availWidth,
//         height: window.screen.availHeight
//     }));
//     await page.setViewport({ width, height });

//     await page.setJavaScriptEnabled(true);
//     await page.setDefaultNavigationTimeout(120000);

//     await page.evaluate(() => {
//         window.scrollTo = (x, y) => {
//             window.scrollX = x;
//             window.scrollY = y;
//         };
//     });

//     await page.evaluate(() => {
//         Object.defineProperty(navigator, 'platform', { get: () => ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)] });
//         Object.defineProperty(navigator, 'productSub', { get: () => '20100101' });
//     });
// }

// async function randomSleep(min = 1000, max = 2000) {
//     const sleepTime = Math.floor(Math.random() * (max - min + 1)) + min;
//     await new Promise(resolve => setTimeout(resolve, sleepTime));
// }

// async function performLogin(page) {
//     try {
//         console.log("Attempting to login...");

//         await page.waitForSelector('form', { visible: true, timeout: 120000 });

//         await page.evaluate(() => {
//             const usernameField = document.querySelector('input[name="P101_USERNAME"]');
//             const passwordField = document.querySelector('input[name="P101_PASSWORD"]');
//             const submitButton = document.querySelector('button#P101_LOGIN');

//             if (!usernameField || !passwordField || !submitButton) {
//                 throw new Error("Couldn't find login elements");
//             }

//             usernameField.value = "redberyl";
//             passwordField.value = "yD7?ddG0";

//             submitButton.click();
//         });

//         await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 })
//             .catch(() => console.log("Navigation or response wait timed out."));

//         console.log("Login success");
//     } catch (e) {
//         console.error("Login fail:", e);
//     }
// }

// async function addData(page, data) {
//     try {
//         console.log("Attempting to add the name");

//         await page.waitForSelector('form', { visible: true, timeout: 120000 });

//         await page.evaluate((data) => {
//             const nameField = document.querySelector('input[name="P2_ENTITY_NAME"]');
//             const checkbox = document.querySelector('input[name="P2_CHECKBOX"]');
//             const submitButton = document.querySelector('button.t-Button--hot');

//             if (!nameField || !submitButton) {
//                 throw new Error("Couldn't find name field or submit button");
//             }

//             nameField.value = data.nameField;
//             if (nameField.value !== "505050jar llc") {
//                 throw new Error(`The value for the entity name is incorrect. It should be ${data.nameField}`);
//             }

//             if (checkbox) {
//                 checkbox.checked = data.checked;
//             }

//             submitButton.click();
//         }, data);

//         await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 })
//             .catch(() => console.log("Navigation or response wait timed out."));

//         console.log("Name added and continue button clicked.");
//         await fillNextPage(page, data);

//     } catch (e) {
//         console.error("Adding name failed:", e);
//     }
// }

// async function fillNextPage(page, data) {
//     try {
//         console.log("Filling the next page...");

//         await page.waitForSelector('div#P4_INITIAL_STATEMENT_CONTAINER', { visible: true, timeout: 30000 });

//         await page.evaluate((data) => {
//             const radioButtons = document.querySelectorAll('input[name="P4_INITIAL_STATEMENT"]');
//             if (radioButtons.length > 0) {
//                 radioButtons[0].checked = true;
//             }

//             document.querySelector('input[name="P4_ENTITY_NAME"]').value = data.nameField;
//             document.querySelector('#P4_COUNTY').value = "4";

//             const effectiveDate = document.querySelector('input#P4_EXISTENCE_OPTION_0');
//             const Dissolution_Date = document.querySelector('input#P4_DISSOLUTION_OPTION_0');
//             const liability_statement = document.querySelector('input#P4_LIAB_STATEMENT_0');

//             if (effectiveDate) effectiveDate.click();
//             if (Dissolution_Date) Dissolution_Date.click();
//             if (liability_statement) liability_statement.click();

//             const opt1 = document.querySelector("input#P4_SOP_ADDR_OPTION_0");
//             const opt2 = document.querySelector("input#P4_SOP_ADDR_OPTION_1");

//             if (opt1.checked) {
//                 document.querySelector('input[name="P4_SOP_NAME"]').value = data.sop.name;
//                 document.querySelector('input[name="P4_SOP_ADDR1"]').value = data.sop.addr1;
//                 document.querySelector('input[name="P4_SOP_ADDR2"]').value = data.sop.addr2;
//                 document.querySelector('input[name="P4_SOP_CITY"]').value = data.sop.city;
//                 document.querySelector('input[name="P4_SOP_POSTAL_CODE"]').value = data.sop.postal_code;
//             } else if (opt2.checked) {
//                 const serviceCompanySelect = document.querySelector("#P4_SOP_SERVICE_COMPANY");
//                 serviceCompanySelect.value = "440";
//                 document.querySelector('input[name="P4_SOP_NAME"]').value = data.sop.name;
//                 document.querySelector('input[name="P4_SOP_ADDR1"]').value = data.sop.addr1;
//                 document.querySelector('input[name="P4_SOP_ADDR2"]').value = data.sop.addr2;
//                 document.querySelector('input[name="P4_SOP_CITY"]').value = data.sop.city;
//                 document.querySelector('input[name="P4_SOP_POSTAL_CODE"]').value = data.sop.postal_code;
//             }
//             document.querySelector('input[name="P4_ORGANIZER_NAME"]').value = data.organizer.name;
//             document.querySelector('input[name="P4_ORGANIZER_ADDR1"]').value = data.organizer.addr1;
//             document.querySelector('input[name="P4_ORGANIZER_CITY"]').value = data.organizer.city;
//             document.querySelector('input[name="P4_ORGANIZER_POSTAL_CODE"]').value = data.organizer.postal_code;
//             document.querySelector('input[name="P4_SIGNATURE"]').value = data.organizer.signature;

//             document.querySelector('#P4_FILER_NAME').value = data.filer.name;
//             document.querySelector('#P4_FILER_ADDR1').value = data.filer.addr1;
//             document.querySelector('input[name="P4_FILER_CITY"]').value = data.filer.city;
//             document.querySelector('input[name="P4_FILER_POSTAL_CODE"]').value = data.filer.postal_code;

//         }, data);

//         console.log("Next page filled.");

//         await page.evaluate(() => {
//             const submitButton = document.querySelector('button.t-Button--hot');
//             if (submitButton) {
//                 submitButton.click();
//             }
//         });

//         // Wait for the new page with the specific class to be fully loaded
//         await page.waitForSelector('.page-6.app-EFILING', { visible: true, timeout: 60000 });

//         console.log("Next step completed and new page loaded.");

//     } catch (e) {
//         console.error("Filling additional fields failed:", e);
//     }
// }

// main();


const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

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
        await addData(page, jsonData);

        console.log("Waiting for the next page...");
        await page.waitForSelector('.page-6.app-EFILING', { visible: true, timeout: 60000 });

        console.log("Next step completed and new page loaded.");

        await randomSleep(180000, 220000);

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
        console.log("Attempting to login...");

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
            .catch(() => console.log("Navigation or response wait timed out."));

        console.log("Login success");
    } catch (e) {
        console.error("Login fail:", e);
    }
}

async function addData(page, data) {
    try {
        console.log("Attempting to add the name");

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
                throw new Error(`The value for the entity name is incorrect. It should be ${data.nameField}`);
            }

            if (checkbox) {
                checkbox.checked = data.checked;
            }

            submitButton.click();
        }, data);

        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 })
            .catch(() => console.log("Navigation or response wait timed out."));

        console.log("Name added and continue button clicked.");
        await fillNextPage(page, data);

    } catch (e) {
        console.error("Adding name failed:", e);
    }
}

async function fillNextPage(page, data) {
    try {
        console.log("Filling the next page...");

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
                const  radio1=document.querySelector("input#P4_EXISTENCE_TYPE_0");
                if(radio1.checked ==true){
                    radio1.checked=true
                }
                const radio2=document.querySelector("input#P4_EXISTENCE_TYPE_1")

                    if(radio2.checked ==true){
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


                const radio1=document.querySelector("input#P4_DISSOLUTION_TYPE_0");
                const radio2=document.querySelector("input#P4_DISSOLUTION_TYPE_1"); 

                if(radio1.checked==true){
                    radio1.checked ;
                }
               else if(radio2.checked==true){
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
            if (liability_statement) liability_statement.click();

            const opt1 = document.querySelector("input#P4_SOP_ADDR_OPTION_0");
            const opt2 = document.querySelector("input#P4_SOP_ADDR_OPTION_1");

            if (opt1.checked) {
                document.querySelector('input[name="P4_SOP_NAME"]').value = data.sop.name;
                document.querySelector('input[name="P4_SOP_ADDR1"]').value = data.sop.addr1;
                document.querySelector('input[name="P4_SOP_ADDR2"]').value = data.sop.addr2;
                document.querySelector('input[name="P4_SOP_CITY"]').value = data.sop.city;
                document.querySelector('input[name="P4_SOP_POSTAL_CODE"]').value = data.sop.postal_code;
            } else if (opt2.checked) {
                const serviceCompanySelect = document.querySelector("#P4_SOP_SERVICE_COMPANY");
                serviceCompanySelect.value = "440";
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
                registeredAgentSelect.value = "440";
                
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

        console.log("Next page filled.");

        await page.evaluate(() => {
            const submitButton = document.querySelector('button.t-Button--hot');
            if (submitButton) {
                submitButton.click();
            }
        });

        // Wait for the new page with the specific class to be fully loaded
        await page.waitForSelector('.page-6.app-EFILING', { visible: true, timeout: 60000 });

        console.log("Next step completed and new page loaded.");

    } catch (e) {
        console.error("Filling additional fields failed:", e);
    }
}

main();
