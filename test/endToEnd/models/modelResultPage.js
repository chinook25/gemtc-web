var browser;
var assert = require('assert');
function ModelResultPage(browserArg) {
  browser = browserArg;
}

ModelResultPage.prototype = {
  waitForPageToLoad: function() {
    browser.waitForElementVisible('#model-results-header', 50000);
  },
  end: function() {
    browser.end();
  },
  waitForResults: function() {
    browser.waitForElementVisible('#model-results-results-header', 80000);
  },
  extendRunLength: function () {
    browser
      .click('#open-run-length-dialog-btn')
      .waitForElementVisible('.reveal-modal', 500)
      .clearValue('#nr-burn-in-input')
      .setValue('#nr-burn-in-input', '110')
      .clearValue('#nr-inference-input')
      .setValue('#nr-inference-input', '60')
      .click('#submit-extend-run-length-btn');
  },
  assertDirectiveImagesRendered: function(directiveName) {
   
    browser.elements('tag name', directiveName, function(result) {
      result.value.map(function(v) {
        // this stopeped working for some reason 
          browser.elementIdElement(v.ELEMENT, 'tag name', 'img', function(imgResult) {
          browser.elementIdSize(imgResult.value.ELEMENT, function(sizeResult) {
            assert(sizeResult.value.height > 0);
            assert(sizeResult.value.width > 0);
          });
        });
      });
    });
  }
};

module.exports = ModelResultPage;
