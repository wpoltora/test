const { Builder, By, until } = require('selenium-webdriver');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const ProductPage = require('./poms/productPage');
const BasketPage = require('./poms/basketPage');
const ContactPage = require('./poms/contactPage');
const PageBase = require('./poms/pageBase');

describe('Webstore Tests', function () {
    let driver, productPage, basketPage, contactPage, pageBase;
    const browser = process.env.BROWSER || 'chrome';

    // Setup: This will run before all the tests
    before(async function () {
        switch (browser) {
            case 'chrome':
                options = new chrome.Options();
                options.addArguments('--ignore-certificate-errors');
                driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();
                break;
            case 'firefox':
                options = new firefox.Options();
                options.setAcceptInsecureCerts(true);
                driver = new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
                break;
            default:
                throw new Error(`Unsupported browser: ${browser}`);
        }

        productPage = new ProductPage(driver);
        basketPage = new BasketPage(driver);
        contactPage = new ContactPage(driver);
        pageBase = new PageBase(driver);
        await driver.get('https://localhost');
        await dismissCookieBar(driver);
    });

    // Cleanup: This will run after all the tests
    after(async function () {
        if (driver) {
            await driver.quit();  // Close the browser after tests
        }
    });

    // Test Group 1: Homepage tests
    describe('Homepage Tests', function () {
        it('should load the homepage and verify title', async function () {
            await driver.get('https://localhost');
            const title = await driver.getTitle();
            assert.equal(title, 'Stella - wyjątkowe zaproszenia ślubne');
        });

        it('should have a visible header', async function () {
            await driver.get('https://localhost');
            const header = await driver.findElement(By.css('header')); // Adjust the selector as per your site
            const isDisplayed = await header.isDisplayed();
            assert.isTrue(isDisplayed, 'Header is not displayed on homepage');
        });

        it('should have a visible navbar', async function () {
            await driver.get('https://localhost');
            const header = await driver.findElement(By.className('navbar')); // Adjust the selector as per your site
            const isDisplayed = await header.isDisplayed();
            assert.isTrue(isDisplayed, 'Navbar is not displayed on homepage');
        });

        it('should have a visible footer', async function () {
            await driver.get('https://localhost');
            const header = await driver.findElement(By.css('footer')); // Adjust the selector as per your site
            const isDisplayed = await header.isDisplayed();
            assert.isTrue(isDisplayed, 'Footer is not displayed on homepage');
        });

        describe('Webstore Responsiveness Tests', function () {

            it('should display mobile menu correctly on mobile screen size', async function () {
                await driver.manage().window().setRect({ width: 375, height: 812 });
                await driver.get('https://localhost');

                let mobileMenu = await driver.findElement(By.id('hamburger'));
                assert.isTrue(await mobileMenu.isDisplayed(), 'Mobile menu should be visible on mobile size');

                let navbarUl = await driver.findElement(By.css('#navbar > div > ul'));
                assert.isFalse(await navbarUl.isDisplayed(), 'Navbar links should not be visible before menu click');

                await mobileMenu.click();
                assert.isTrue(await navbarUl.isDisplayed(), 'Navbar links should be visible after menu click');
            });

            it('should display tablet menu correctly on tablet screen size', async function () {
                await driver.manage().window().setRect({ width: 768, height: 1024 });
                await driver.get('https://localhost');

                let tabletMenu = await driver.findElement(By.id('hamburger'));
                assert.isTrue(await tabletMenu.isDisplayed(), 'Tablet menu should be visible on tablet size');

                let navbarUl = await driver.findElement(By.css('#navbar > div > ul'));
                assert.isFalse(await navbarUl.isDisplayed(), 'Navbar links should not be visible before menu click');

                await tabletMenu.click();
                assert.isTrue(await navbarUl.isDisplayed(), 'Navbar links should be visible after menu click');
            });

            it('should display desktop menu correctly on desktop screen size', async function () {
                await driver.manage().window().setRect({ width: 1920, height: 1080 });
                await driver.get('https://localhost');

                let desktopMenu = await driver.findElement(By.id('hamburger'));
                assert.isFalse(await desktopMenu.isDisplayed(), 'Desktop menu should not be visible on desktop size');

                let navbarUl = await driver.findElement(By.css('#navbar > div > ul'));
                assert.isTrue(await navbarUl.isDisplayed(), 'Navbar links should be visible before menu click');
            });

        });

        describe('Searchbar Tests', function () {
            it('should display searchbar', async function () {
                await driver.get('https://localhost');
                let searchIcon = await pageBase.getSearchIcon();
                let searchInput = await pageBase.getSearchInput();
                assert.isFalse(await searchInput.isDisplayed(), 'Search input should not be visible on start');
                assert.isTrue(await searchIcon.isDisplayed(), 'Search icon is not displayed');
                await searchIcon.click();
                assert.isTrue(await searchInput.isDisplayed(), 'Search input should be visible on click');
            });

            it('should display correct message if less than 3 characters inserted', async function () {
                await driver.get('https://localhost');
                const searchInput = await pageBase.getSearchInput();
                pageBase.clickSearchIcon();
                assert.equal(await pageBase.getSearchMessage(), 'Wpisz przynajmniej trzy litery', "Should display a different message");
                await searchInput.sendKeys('r');
                assert.equal(await pageBase.getSearchMessage(), 'Wpisz przynajmniej trzy litery', "Should display a different message");
                await searchInput.sendKeys('ó');
                assert.equal(await pageBase.getSearchMessage(), 'Wpisz przynajmniej trzy litery', "Should display a different message");
                await searchInput.sendKeys('ż');
                const messageElement = await driver.findElement(By.css('#searchbar-results > p'));
                await driver.wait(until.stalenessOf(messageElement), 5000);
                try {
                    await pageBase.getSearchMessage(); // Try to get the message
                    assert.fail('Expected NoSuchElementError, but no error was thrown'); // Fail the test if no error is thrown
                } catch (e) {
                    if (e.name === 'NoSuchElementError') {
                        return;
                    } else {
                        throw e;  // Rethrow unexpected errors
                    }
                }
            });
        });
    });

    describe('Contact Tests', function () {
        it('should accept only correct email format', async function () {
            await driver.get('https://localhost/kontakt');
            await contactPage.setFields('John Doe', 'invailid-email', 'Test message');
            await contactPage.submit();
            let emailValidationMessage = await contactPage.getValidationMessage(By.id('email'));
            assert.isNotEmpty(emailValidationMessage, 'Form should not accept an incorrect email');
            await contactPage.setEmail('email@email.com');
            emailValidationMessage = await contactPage.getValidationMessage(By.id('email'));
            assert.isEmpty(emailValidationMessage, 'Form should accept a correct email');
        });

        it('should clear fields after submission', async function () {
            await driver.get('https://localhost/kontakt');
            await contactPage.setFields('John Does', 'email@email.com', 'Test message');
            await contactPage.submit();
            assert.isTrue(await contactPage.isClear(), 'Fields should be cleared after submit');
        });
    });

    describe('Basket Tests', function () {
        it('should add 50 items to basket and increase by one', async function () {

        });
    });


    describe('Webstore end-to-end tests', function () {
        describe('Shop Tests', function () {
            it('should add item to basket and check cart details', async function () {
                await driver.get('https://localhost/produkt/Zaproszenia/Róże');
                await productPage.addToCart();
                await driver.get('https://localhost/koszyk');
                const lastBasketItem = await basketPage.getLastItem();
                const basketItemTitle = await basketPage.getTitleOfItem(lastBasketItem);
                assert.include(basketItemTitle, 'Zaproszenie róże', 'Title is not correct');
            });
            it('should add 50 items to basket and increase by one', async function () {
                await driver.get('https://localhost/produkt/Zaproszenia/Róże');
                await productPage.setCount('55');
                await productPage.addToCart();
                await driver.get('https://localhost/koszyk');
                const lastBasketItem = await basketPage.getLastItem();
                await basketPage.increaseCountOfItemBy(lastBasketItem, 3);
                assert(await basketPage.getAmountOfItem(), '58', 'The number should be 58');
            });
        });

        describe('Search Tests', function () {
            it('should search correct product and show it on click', async function () {
                await driver.get('https://localhost');
                await pageBase.clickSearchIcon();
                const searchInput = await pageBase.getSearchInput();
                await searchInput.sendKeys('Zaproszenie róże');
                await driver.sleep(2000);
                const item = await driver.wait(until.elementIsVisible(driver.findElement(By.css('#searchbar-results .item'))), 5000);
                await item.click();
                let title = await driver.wait(until.elementLocated(By.css('h2.heading')), 5000);
                assert.equal(await title.getText(), 'Zaproszenie róże');
            });
        });
    });

});

async function dismissCookieBar(driver) {
    let cookieBar;
    try {
        cookieBar = await driver.wait(until.elementLocated(By.css('.cookies-popup')), 5000);
    } catch (error) {
        console.log("No cookie bar found.");
    }

    if (cookieBar) {
        let dismissButton = await cookieBar.findElement(By.id('accept-cookies'));
        await dismissButton.click();
        console.log("Cookie bar dismissed");
    }
}
