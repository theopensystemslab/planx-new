
// require syntax is used to enable overwriting objects from the original module
const reactNavi = require('react-navi');

const originalUseCurrentRoute = reactNavi.useCurrentRoute;

function reactNaviDecorator(story, { parameters }) {
  delete reactNavi['useCurrentRoute'];
  reactNavi.useCurrentRoute = parameters?.reactNavi?.useCurrentRoute ?? originalUseCurrentRoute;
  return story();  
}

reactNavi['reactNaviDecorator'] = reactNaviDecorator;

module.exports = reactNavi;