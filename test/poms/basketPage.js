const { By, until } = require('selenium-webdriver');

class BasketPage {
    constructor(driver) {
        this.driver = driver;
    }

    async getLastItem() {
        const basketItems = await this.driver.findElements(By.css('.basket-item'));
        return basketItems[basketItems.length - 1];
    }


    async getTitleOfItem(basketItem) {
        const title = await basketItem.findElement(By.css('h2')).getText();
        return title;
    }

    async getAmountOfItem(basketItem) {
        const inputElement = await this.driver.wait(until.elementLocated(By.css('.input-count input')), 5000);
        return await inputElement.getAttribute('value');
    }

    async increaseCountOfItemBy(basketItem, count) {
        const buttons = await basketItem.findElements(By.css('.round-button'));
        const plus = buttons[1];
        for (let i = 0; i < count; i++) {
            await plus.click();
        }
    }

}

module.exports = BasketPage;
