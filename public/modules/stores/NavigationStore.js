/* for overlay events that don't require any component refreshing. */

const event = require('events');

function NavigationStore() {
  const navigationStore = Object.create(event.EventEmitter.prototype);
  let navigationOptions = {
    isNavBarShowing: true,
    selectedMarkdown: null,
  };

  function subscribeListener(callback) {
    navigationStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    navigationStore.removeListener('change', callback);
  }

  function isNavBarShowing() {
    return navigationOptions.isNavBarShowing;
  }

  function getSelectedMarkdown() {
    return navigationOptions.selectedMarkdown;
  }

  function setOptions(newOpts) {
    Object.assign(navigationOptions, newOpts);
    navigationStore.emit('change', navigationOptions);
  }

  return {
    subscribeListener,
    unsubscribeListener,
    getSelectedMarkdown,
    isNavBarShowing,
    setOptions,
  };
}
export default new NavigationStore;
