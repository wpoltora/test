const { By } = require('selenium-webdriver');

class ProductPage {
    constructor(driver) {
        this.driver = driver;
    }

    async addToCart() {
        const addToCartButton = await this.driver.findElement(By.xpath("//form[@class='customize-form']//button[@type='submit']"));
        await addToCartButton.click();
    }

    async setCount(count) {
        let input = await this.driver.findElement(By.id('productAmount'));
        await input.clear();
        await input.sendKeys(count);
    }
}

module.exports = ProductPage;
