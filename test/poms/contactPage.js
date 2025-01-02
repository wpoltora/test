const { By, until } = require('selenium-webdriver');

class ContactPage {
    constructor(driver) {
        this.driver = driver;
    }
    async setName(name) {
        await this.driver.findElement(By.id('name')).sendKeys(name);
    }

    async setEmail(email) {
        await this.driver.findElement(By.id('email')).sendKeys(email);
    }

    async setMessage(message) {
        await this.driver.findElement(By.id('message')).sendKeys(message);
    }

    async setFields(name, email, message) {
        this.setName(name);
        this.setEmail(email);
        this.setMessage(message);
    }

    async submit() {
        let submitButton = await this.driver.findElement(By.css('form button[type="submit"]'));
        await this.driver.executeScript('arguments[0].scrollIntoView();', submitButton);
        await this.driver.wait(until.elementIsVisible(submitButton), 5000, 'Submit button is not visible');
        await this.driver.wait(until.elementIsEnabled(submitButton), 5000, 'Submit button is not clickable');
        await this.driver.sleep(1000);
        await submitButton.click();
    }

    async getValidationMessage(selector) {
        let field = await this.driver.findElement(selector);
        return await field.getAttribute('validationMessage');
    }

    async isClear() {
        let nameField = await this.driver.findElement(By.id('name'));
        let emailField = await this.driver.findElement(By.id('email'));
        let messageField = await this.driver.findElement(By.id('message'));
        return !(await nameField.getAttribute('value') || await emailField.getAttribute('value') || await messageField.getAttribute('value'));
    }
}
module.exports = ContactPage;
