/* eslint no-console:0 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import gulpHelp from 'gulp-help';
import yargs from 'yargs';
import runSequence from 'run-sequence';
import loadPlugins from 'gulp-load-plugins';
import assignPolyfill from 'lodash.assign';

const CWD = process.cwd();
const GULP_DIR = path.resolve(`${CWD}/gulp`);
const GULP_CONFIG_PATH = path.resolve(`${GULP_DIR}/config/gulp.conf.js`);

const $ = loadPlugins({
    config: path.resolve(`${CWD}/package.json`)
});

let gulp;
let originalGulpConfig;

Object.assign = Object.assign || assignPolyfill;

try {
    originalGulpConfig = require(GULP_CONFIG_PATH);
} catch (e) {
    originalGulpConfig = {};
}

const config = Object.assign({}, originalGulpConfig, { args: yargs.argv });

log(chalk.yellow.bold('Original gulp config', JSON.stringify(originalGulpConfig)));
log(chalk.yellow.bold('Merged gulp config', JSON.stringify(config)));

export function load(_gulp) {
    if (!_gulp) {
        throw new Error('An instance of gulp must be provided!');
    }

    gulp = gulpHelp(_gulp);

    fs.readdirSync(GULP_DIR).forEach((file) => {
        if ((/.js$/).test(file)) {
            const filepath = `${GULP_DIR}/${file.split('.')[0]}`;

            log(chalk.magenta.bold('Loading file:', filepath));
            require(filepath)(this, gulp, $, config);
            log(chalk.green.bold('Loaded file:', filepath));
        }
    });

    return this;
}

export function task(name, description, subtasks, args = {}) {
    if (isObject(name)) {
        const options = name;
        name = options.name;
        description = options.description;
        subtasks = options.subtasks;
        args = options.args;
    }

    log(chalk.magenta.bold('Loading task:', name));
    gulp.task(name, description, (done) => runSequence.use(gulp).apply(runSequence, subtasks.concat([done])), { options: args });
    log(chalk.green.bold('Loaded task:', name));

    return this;
}

export function subtask(name, ...args) {
    log(chalk.magenta.bold('Loading subtask:', name));
    gulp.task.apply(gulp, [name, false].concat(args));
    log(chalk.green.bold('Loaded task:', name));

    return this;
}

function log(msg) {
    if (config.args.debug) {
        console.log(msg);
    }
}

function isObject(value) {
    const type = typeof value;
    return !!value && (type === 'object' || type === 'function');
}

export default {
    load,
    task,
    subtask
};
