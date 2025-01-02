const { By } = require('selenium-webdriver');

class PageBase {
    constructor(driver) {
        this.driver = driver;
    }

    async getSearchIcon() {
        return await this.driver.findElement(By.css('#search > a'));
    }

    async getSearchMessage() {
        return await this.driver.findElement(By.css('#searchbar-results > p')).getText();
    }

    async clickSearchIcon() {
        let searchIcon = await this.getSearchIcon();
        await searchIcon.click();
    }

    async getSearchInput() {
        return await this.driver.findElement(By.id('searchbar-input'));
    }
}

module.exports = PageBase;
