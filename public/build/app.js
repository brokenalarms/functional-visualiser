(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\app.jsx":[function(require,module,exports){
'use strict';
//==========================================
// Main root-level app module.
// The whole application is defined by the 'App'
// React component, and all state flows uni-directionally
// down from it.
//==========================================

var _createClass = (function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
})();

var _get = function get(_x, _x2, _x3) {
    var _again = true;_function: while (_again) {
        var object = _x,
            property = _x2,
            receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);if (parent === null) {
                return undefined;
            } else {
                _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
            }
        } else if ('value' in desc) {
            return desc.value;
        } else {
            var getter = desc.get;if (getter === undefined) {
                return undefined;
            }return getter.call(receiver);
        }
    }
};

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUi2 = _interopRequireDefault(_materialUi);

var _layoutD3RootD3RootJsx = require('./layout/D3Root/D3Root.jsx');

var _layoutD3RootD3RootJsx2 = _interopRequireDefault(_layoutD3RootD3RootJsx);

var _layoutLeftNavLeftNavJsx = require('./layout/LeftNav/LeftNav.jsx');

var _layoutLeftNavLeftNavJsx2 = _interopRequireDefault(_layoutLeftNavLeftNavJsx);

var RaisedButton = _materialUi2['default'].RaisedButton;

var ThemeManager = new _materialUi2['default'].Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);

var App = (function (_React$Component) {
    _inherits(App, _React$Component);

    _createClass(App, null, [{
        key: 'childContextTypes',

        //boilerplate for material-UI initialisation
        value: {
            muiTheme: _react2['default'].PropTypes.object
        },
        enumerable: true
    }]);

    function App(props) {
        var _this = this;

        _classCallCheck(this, App);

        _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this, props);

        this.handleButtonClick = function () {
            console.log('button clicked');
            _this.setState({
                word: ++_this.state.word,
                showNavBar: !_this.state.showNavBar
            });
        };

        this.defaultProps = {
            word: 1,
            showNavBar: false
        };
        this.state = {
            word: 1,
            inputContent: 'start value',
            showNavBar: true
        };
    }

    //boilerplate for material-UI initialisation

    _createClass(App, [{
        key: 'getChildContext',
        value: function getChildContext() {
            return {
                muiTheme: ThemeManager.getCurrentTheme()
            };
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2['default'].createElement('div', { className: 'test' }, _react2['default'].createElement(_layoutLeftNavLeftNavJsx2['default'], null), _react2['default'].createElement('div', null, _react2['default'].createElement(RaisedButton, { label: 'Default', onClick: this.handleButtonClick }), _react2['default'].createElement('h1', null, 'react working! ', this.state.word), _react2['default'].createElement(_layoutD3RootD3RootJsx2['default'], { word: this.props.word })));
        }
    }]);

    return App;
})(_react2['default'].Component);

_react2['default'].render(_react2['default'].createElement(App, null), document.getElementById('app'));

},{"./layout/D3Root/D3Root.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\layout\\D3Root\\D3Root.jsx","./layout/LeftNav/LeftNav.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\layout\\LeftNav\\LeftNav.jsx","material-ui":"material-ui","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\layout\\D3Root\\D3Root.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
})();

var _get = function get(_x, _x2, _x3) {
    var _again = true;_function: while (_again) {
        var object = _x,
            property = _x2,
            receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);if (parent === null) {
                return undefined;
            } else {
                _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
            }
        } else if ('value' in desc) {
            return desc.value;
        } else {
            var getter = desc.get;if (getter === undefined) {
                return undefined;
            }return getter.call(receiver);
        }
    }
};

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var D3Root = (function (_React$Component) {
    _inherits(D3Root, _React$Component);

    function D3Root(props) {
        var _this = this;

        _classCallCheck(this, D3Root);

        _get(Object.getPrototypeOf(D3Root.prototype), 'constructor', this).call(this, props);

        this.componentDidMount = function () {
            _this.element = _react2['default'].findDOMNode(_this);
            initialize(_this.element);
        };

        this.element = null;
    }

    _createClass(D3Root, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            console.log('d3root has received props');
            console.log(nextProps);
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate() {
            console.log('d3root updating');
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            console.log('d3root updated');
            update(this.element);
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2['default'].createElement('div', { className: 'd3-test' });
        }
    }]);

    return D3Root;
})(_react2['default'].Component);

exports['default'] = D3Root;
;

function initialize(element) {
    _d32['default'].select(element).append('svg').attr('class', 'function-block').append('text').attr('x', 10).attr('y', 10).attr('dy', '.35em').text('d3 appended element inside react component - first attempt');
    console.log('drawn');
}

function update(element) {
    _d32['default'].select(element).append('text').text('element updated');
}
module.exports = exports['default'];

},{"d3":"d3","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\layout\\LeftNav\\LeftNav.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
})();

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUi2 = _interopRequireDefault(_materialUi);

var LeftNav = _materialUi2['default'].LeftNav;
var MenuItem = _materialUi2['default'].MenuItem;

var LeftNavBar = (function () {
    function LeftNavBar() {
        var _this = this;

        _classCallCheck(this, LeftNavBar);

        this.handleClick = function () {
            console.log('handlingclick');
            _this.toggle();
        };
    }

    _createClass(LeftNavBar, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            console.log('left nav mounted');
            // this.refs.leftNav.toggle();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            console.log('left nav has received props');
            console.log(nextProps);
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate() {
            console.log('left nav updating');
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            console.log('left nav updated');
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(LeftNav, { ref: 'leftNav',
                menuItems: this.props.menuItems,
                docked: false,
                onChange: this.handleClick,
                className: 'left-nav' });
        }
    }], [{
        key: 'displayName',
        value: 'LeftNavBar',
        enumerable: true
    }, {
        key: 'defaultProps',
        value: {
            menuItems: [{
                route: 'get-started',
                text: 'Get Started'
            }, {
                route: 'customization',
                text: 'Customization'
            }, {
                route: 'components',
                text: 'Components'
            }, {
                type: MenuItem.Types.SUBHEADER,
                text: 'Resources'
            }, {
                type: MenuItem.Types.LINK,
                payload: 'https://github.com/callemall/material-ui',
                text: 'GitHub'
            }, {
                text: 'Disabled',
                disabled: true
            }, {
                type: MenuItem.Types.LINK,
                payload: 'https://www.google.com',
                text: 'Disabled Link',
                disabled: true
            }]
        },
        enumerable: true
    }]);

    return LeftNavBar;
})();

exports['default'] = LeftNavBar;
;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}]},{},["C:\\Users\\pitch\\functional-visualiser\\public\\modules\\app.jsx"])


//# sourceMappingURL=app.js.map