module.exports = function(browser, url) {
    browser
        .url(url)
        .waitForElementVisible('button[type="submit"]', 5000)
        .click('button[type="submit"]')
        .pause(1000)
        .source(function(result) {
            // Source will be stored in result.value
            // console.log(result.value);
        })
        .assert.containsText('h2', 'Sign in with your Google Account')
        .pause(1000)
        .setValue('input[type=email]', 'addistestuser1@gmail.com')
        .click('input[type="submit"]')
        .pause(1000)
        .setValue('input[type=password]', 'speciaalvoordejenkins')
        .click('#signIn')
    if (process.env.GEMTC_NIGHTWATCH_URL === 'http://localhost:3001') {
        browser.pause(3000) // wait for submit button to become active (thanks for keeping us safe google)
            .click('#submit_approve_access')
    }

    return browser;
};
