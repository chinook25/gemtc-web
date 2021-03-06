'use strict';
define([
  'angular',
  'angular-mocks',
  '../analyses/analyses',
  '../models/models',
  './createModel'
], function(angular) {
  describe('the CreateModelController', function() {
    var scope, q,
      stateParamsMock = {},
      stateMock = jasmine.createSpyObj('$state', ['current']),
      problemDefer,
      pairwiseOptionsMock = ['pairwise 1'],
      leaveOneOutOptionsMock = [],
      nodeSplitOptionsMock = ['nodesplit 1'],
      likelihoodLinkOptionsMock = [],
      modelSaveDefer,
      problemMock,
      modelSaveResultMock,
      modelServiceMock = jasmine.createSpyObj('ModelService', [
        'cleanModel',
        'createModelBatch',
        'isVariableBinary',
        'getBinaryCovariateNames',
        'isProblemWithCovariates',
        'getCovariateBounds'
      ]),
      modelResourceMock = jasmine.createSpyObj('ModelResource', ['save']),
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', [
        'createNodeSplitOptions',
        'createLikelihoodLinkOptions',
        'estimateRunLength'
      ]),
      problemResourceMock = jasmine.createSpyObj('ProblemResource', ['get']),
      pageTitleServiceMock = jasmine.createSpyObj('PageTitleService', ['setPageTitle']);
    var createModelServiceMock = jasmine.createSpyObj('CreateModelController', [
      'createLikelihoodLink',
      'createPairWiseComparison',
      'createPairwiseOptions',
      'createNodeSplitComparison',
      'createLeaveOneOutOptions',
      'heterogeneityParamsChange',
      'getFirstStudy',
      'buildCovariateOptions',
      'getModelWithCovariates'
    ]);

    beforeEach(angular.mock.module('gemtc.models'));
    beforeEach(angular.mock.module('gemtc.createModel'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      q = $q;
      problemDefer = q.defer();
      modelSaveDefer = q.defer();
      modelSaveResultMock = {
        $promise: modelSaveDefer.promise
      };

      problemMock = {
        $promise: problemDefer.promise,
        entries: [{
          study: 'study 1'
        }],
        treatments: [{
          id: 1,
          name: "treatment1"
        }],
        studyLevelCovariates: {
          'study 1': {
            COVARIATE_1: null,
            COVARIATE_2: null
          }
        }
      };

      problemResourceMock.get.and.returnValue(problemMock);
      createModelServiceMock.createLeaveOneOutOptions.and.returnValue(leaveOneOutOptionsMock);
      createModelServiceMock.createPairwiseOptions.and.returnValue(pairwiseOptionsMock);
      createModelServiceMock.buildCovariateOptions.and.returnValue(['COVARIATE_1', 'COVARIATE_2']);
      analysisServiceMock.createNodeSplitOptions.and.returnValue(nodeSplitOptionsMock);

      modelResourceMock.save.and.returnValue(modelSaveResultMock);

      $controller('CreateModelController', {
        $scope: scope,
        $q: q,
        $stateParams: stateParamsMock,
        $state: stateMock,
        ModelService: modelServiceMock,
        ModelResource: modelResourceMock,
        AnalysisService: analysisServiceMock,
        ProblemResource: problemResourceMock,
        PageTitleService: pageTitleServiceMock,
        CreateModelService: createModelServiceMock
      });
    }));

    describe('when first initialised', function() {

      it('should place a basic model on the scope', function() {
        expect(scope.model.linearModel).toBe('random');
        expect(scope.model.modelType.mainType).toBe('network');
        expect(scope.model.burnInIterations).toBe(5000);
        expect(scope.model.inferenceIterations).toBe(20000);
        expect(scope.model.thinningFactor).toBe(10);
      });

      it('should get the problem', function() {
        expect(problemResourceMock.get).toHaveBeenCalled();
      });

      it('should place createModel on the scope', function() {
        expect(scope.createModel).toBeDefined();
      });

      it('should place isAddButtonDisabled on the scope', function() {
        expect(scope.isAddButtonDisabled).toBeDefined();
      });
    });

    describe('once the problem is loaded', function() {
      beforeEach(function() {
        likelihoodLinkOptionsMock = [{
          name: 'option 1',
          compatibility: 'compatible'
        }, {
          name: 'option 2',
          compatibility: 'incompatible'
        }];
        analysisServiceMock.createLikelihoodLinkOptions.and.returnValue(likelihoodLinkOptionsMock);
        createModelServiceMock.createLikelihoodLink.and.returnValue(likelihoodLinkOptionsMock[0]);
        createModelServiceMock.getModelWithCovariates.and.returnValue(scope.model);
        problemDefer.resolve(problemMock);
        scope.$apply();
      });

      it('should retrieve pairwise options', function() {
        expect(createModelServiceMock.createPairwiseOptions).toHaveBeenCalledWith(problemMock);
      });

      it('should retrieve nodesplitting options', function() {
        expect(analysisServiceMock.createNodeSplitOptions).toHaveBeenCalledWith(problemMock);
      });

      it('should retrieve likelihood link options and place them on the scope, and set the model ll/link function to be the first compatible one', function() {
        expect(analysisServiceMock.createLikelihoodLinkOptions).toHaveBeenCalledWith(problemMock);
        expect(scope.likelihoodLinkOptions[0]).toEqual(likelihoodLinkOptionsMock[0]);
        expect(scope.likelihoodLinkOptions[1]).toEqual(likelihoodLinkOptionsMock[1]);
        expect(scope.model.likelihoodLink).toEqual(likelihoodLinkOptionsMock[0]);
      });

      it('should place covariate options on the scope', function() {
        expect(scope.covariateOptions).toEqual(['COVARIATE_1', 'COVARIATE_2']);
      });

    });

    describe('createModel', function() {
      describe('when creating a random network model', function() {
        var model = {
          linearModel: 'random',
          modelType: {
            mainType: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihoodLink: {
            likelihood: 'likelihood',
            link: 'link'
          },
          outcomeScale: {
            type: 'heuristically'
          },
          leaveOneOut: {}
        };

        var cleanedModel = {};
        modelServiceMock.cleanModel.and.returnValue(cleanedModel);

        beforeEach(function() {
          modelResourceMock.save.calls.reset();
          scope.createModel(model);
        });

        it('should save the model', function() {
          expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, cleanedModel, jasmine.any(Function));
        });

        it('should set isAddingModel to true', function() {
          expect(scope.isAddingModel).toBe(true);
        });
      });

      describe('when creating nodesplitting model', function() {
        var frontendModel = {
          linearModel: 'random',
          modelType: {
            mainType: 'node-split'
          },
          title: 'modelTitle nodesplit',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihoodLink: {
            likelihood: 'likelihood',
            link: 'link'
          },
          nodeSplitComparison: {
            from: {
              id: 1,
              name: 'fromName'
            },
            to: {
              id: 2,
              name: 'toName'
            }
          },
          outcomeScale: {
            type: 'heuristically'
          },
          leaveOneOut: {}
        };

        var cleanedModel = {};

        modelServiceMock.cleanModel.and.returnValue(cleanedModel);

        beforeEach(function() {
          modelResourceMock.save.calls.reset();
          scope.createModel(frontendModel);
        });

        it('should save the cleanedModel model', function() {
          expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, cleanedModel, jasmine.any(Function));
        });

        it('should set isAddingModel to true', function() {
          expect(scope.isAddingModel).toBe(true);
        });
      });

      describe('when creating model that has the outcome scale set', function() {
        var frontendModel = {
          linearModel: 'random',
          modelType: {
            mainType: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihoodLink: {
            likelihood: 'likelihood',
            link: 'link'
          },
          outcomeScale: {
            type: 'fixed',
            value: 123456
          },
          leaveOneOut: {}
        };

        var cleanedModel = {};
        modelServiceMock.cleanModel.and.returnValue(cleanedModel);

        beforeEach(function() {
          modelResourceMock.save.calls.reset();
          scope.createModel(frontendModel);
        });

        it('should place the scale value on the model', function() {
          expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, cleanedModel, jasmine.any(Function));
        });
      });

      describe('when creating a batch of pairwise models', function() {
        it('should call the modelService createModelBatch', function() {
          var modelBatch = [{
            id: 1
          }, {
            id: 2
          }];
          modelServiceMock.createModelBatch.and.returnValue(modelBatch);
          var model = {
            linearModel: 'random',
            modelType: {
              subType: 'all-pairwise'
            }
          };
          scope.createModel(model);
          expect(modelServiceMock.createModelBatch).toHaveBeenCalledWith(model, scope.comparisonOptions, scope.nodeSplitOptions);
        });
      });
    });

    describe('isAddButtonDisabled', function() {
      it('should return true if the estimateRunLength is greater than 300', function() {
        var model = {
          title: 'title',
          burnInIterations: 1000,
          inferenceIterations: 100,
          thinningFactor: 10,
          modelType: {
            mainType: 'consistency'
          }
        };

        scope.estimateRunLength = 301;

        expect(scope.isAddButtonDisabled(model)).toBe(true);
      });

      it('should return false when the model is ready to save', function() {
        var model = {
          title: 'title',
          burnInIterations: 1000,
          inferenceIterations: 100,
          thinningFactor: 10,
          modelType: {
            mainType: 'consistency'
          }
        };

        scope.estimateRunLength = 299;
        scope.isAddingModel = false;
        model.likelihoodLink = {
          compatibility: 'compatibility'
        };
        model.outcomeScale = {
          outcomeScale: {
            value: 1,
            type: 'fixed'
          }
        };

        expect(scope.isAddButtonDisabled(model)).toBe(false);
      });

      it('should return true if the model is a regression model and the selected covariate includes null values', function() {
        var model = {
          title: 'title',
          burnInIterations: 1000,
          inferenceIterations: 100,
          thinningFactor: 10,
          modelType: {
            mainType: 'regression'
          },
          covariateOption: 'my cov'
        };

        scope.estimateRunLength = 299;
        scope.isAddingModel = false;
        model.likelihoodLink = {
          compatibility: 'compatibility'
        };
        model.outcomeScale = {
          outcomeScale: {
            value: 1,
            type: 'fixed'
          }
        };

        var problem = {
          entries: [{
            study: 'study 1'
          }, {
            study: 'study 2'
          }],
          studyLevelCovariates: {
            'study 1': {
              SOME_COVARIATE: 1,
              'my cov': 1
            },
            'study 2': {
              SOME_COVARIATE: null,
              'my cov': null
            }
          }
        };

        expect(scope.isAddButtonDisabled(model, problem)).toBeTruthy();
      });

      it('should return false if sensitivity weightingFactor is invalid', function() {
        var model = {
          title: 'title',
          burnInIterations: 1000,
          inferenceIterations: 100,
          thinningFactor: 10,
          modelType: {
            mainType: 'consistency'
          },
          sensitivity: {
            weightingFactor: undefined
          }
        };

        scope.estimateRunLength = 299;
        scope.isAddingModel = false;
        scope.isWeighted = true;
        model.likelihoodLink = {
          compatibility: 'compatibility'
        };
        model.outcomeScale = {
          outcomeScale: {
            value: 1,
            type: 'fixed'
          }
        };

        var problem = {
          studyLevelCovariates: {
            'study 1': {
              SOME_COVARIATE: 1,
              'my cov': 1
            },
            'study 2': {
              SOME_COVARIATE: null,
              'my cov': null
            }
          }
        };

        expect(scope.isAddButtonDisabled(model, problem)).toBe(true);
      });
    });
  });
});
