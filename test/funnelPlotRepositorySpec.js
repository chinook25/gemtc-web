'use strict';
var proxyquire = require('proxyquire'),
  sinon = require('sinon');

var queryStub = {
    query: function() {
      console.log('query being called');
    }
  },
  dbStub = function() {
    return queryStub;
  };

var funnelPlotRepository = proxyquire('../standalone-app/funnelPlotRepository', {
  './db': dbStub
});

describe('the funnelplot repository', function() {
  describe('create', function() {

    var query;
    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
      query.onCall(0).yields(null);
    });

    afterEach(function() {
      queryStub.query.restore();
    });

    it('should call db with the values to create', function(done) {
      var includedComparisons = [{
          t1: 3,
          t2: 4
        }, {
          t1: 5,
          t2: 7
        }],
        newFunnelPlot = {
          includedComparisons: includedComparisons
        },
        modelId = 1;
      
      var expectedQuery = "INSERT INTO funnelplot (modelId, t1, t2) VALUES " +
        "($1, $2, $3),($4, $5, $6)";
      var expectedValues = [
        modelId, includedComparisons[0].t1, includedComparisons[0].t2,
        modelId, includedComparisons[1].t1, includedComparisons[1].t2
      ];

      funnelPlotRepository.create(modelId, newFunnelPlot, function() {
        sinon.assert.calledWith(query, expectedQuery, expectedValues);
        done();
      });
    });
  });
});