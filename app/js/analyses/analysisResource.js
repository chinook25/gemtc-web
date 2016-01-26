'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var AnalysisResource = function($resource) {
    return $resource('/analyses/:analysisId', {
      analysisId: '@analysisId'
    }, {
      setPrimaryModel: {
        url: '/analyses/:analysisId/setPrimaryModel',
        method: 'POST',
      }
    });
  };
  return dependencies.concat(AnalysisResource);
});
