'use strict';
define([], function() {
  var dependencies = ['UserResource'];
  var NavbarDirective = function(UserResource) {
    return {
      restrict: 'E',
      templateUrl: './navbarDirective.html',
      transclude: true,
      link: function(scope) {
        scope.user = UserResource.get();
      }
    };
  };
  return dependencies.concat(NavbarDirective);
});
