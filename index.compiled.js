'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /* eslint no-console:0 */


exports.load = load;
exports.task = task;
exports.subtask = subtask;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _gulpHelp = require('gulp-help');

var _gulpHelp2 = _interopRequireDefault(_gulpHelp);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _gulpLoadPlugins = require('gulp-load-plugins');

var _gulpLoadPlugins2 = _interopRequireDefault(_gulpLoadPlugins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CWD = process.cwd();
var GULP_DIR = _path2.default.resolve(CWD + '/gulp');
var GULP_CONFIG_PATH = _path2.default.resolve(GULP_DIR + '/config/gulp.conf.js');

var $ = (0, _gulpLoadPlugins2.default)({
    config: _path2.default.resolve(CWD + '/package.json')
});

var gulp = void 0;
var originalGulpConfig = void 0;

try {
    originalGulpConfig = require(GULP_CONFIG_PATH);
} catch (e) {
    originalGulpConfig = {};
}

var config = Object.assign({}, originalGulpConfig, { args: _yargs2.default.argv });

log(_chalk2.default.yellow.bold('Original gulp config', JSON.stringify(originalGulpConfig)));
log(_chalk2.default.yellow.bold('Merged gulp config', JSON.stringify(config)));

function load(_gulp) {
    var _this = this;

    if (!_gulp) {
        throw new Error('An instance of gulp must be provided!');
    }

    gulp = (0, _gulpHelp2.default)(_gulp);

    _fs2.default.readdirSync(GULP_DIR).forEach(function (file) {
        if (/.js$/.test(file)) {
            var filepath = GULP_DIR + '/' + file.split('.')[0];

            log(_chalk2.default.magenta.bold('Loading file:', filepath));
            require(filepath)(_this, gulp, $, config);
            log(_chalk2.default.green.bold('Loaded file:', filepath));
        }
    });

    return this;
}

function task(name, description, subtasks) {
    var args = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    if (isObject(name)) {
        var options = name;
        name = options.name;
        description = options.description;
        subtasks = options.subtasks;
        args = options.args;
    }

    log(_chalk2.default.magenta.bold('Loading task:', name));
    gulp.task(name, description, function (done) {
        return _runSequence2.default.use(gulp).apply(_runSequence2.default, subtasks.concat([done]));
    }, { options: args });
    log(_chalk2.default.green.bold('Loaded task:', name));

    return this;
}

function subtask(name) {
    log(_chalk2.default.magenta.bold('Loading subtask:', name));

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    gulp.task.apply(gulp, [name, false].concat(args));
    log(_chalk2.default.green.bold('Loaded task:', name));

    return this;
}

function log(msg) {
    if (config.args.debug) {
        console.log(msg);
    }
}

function isObject(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return !!value && (type === 'object' || type === 'function');
}

exports.default = {
    load: load,
    task: task,
    subtask: subtask
};
