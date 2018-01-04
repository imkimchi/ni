'use strict';

require('babel-polyfill');

var _childProcessPromise = require('child-process-promise');

var _npm = require('./lib/npm');

var _npm2 = _interopRequireDefault(_npm);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fixMsg = function fixMsg(e) {
    return e === 'No packages found' && 'There\'s no uninstalled dependency';
};
var depCheck = function depCheck(str, obj) {
    return !str.startsWith('./') && !obj.hasOwnProperty(str);
};
var checkExtension = function checkExtension(file) {
    return file.includes('.js') ? file : file + '.js';
};

var colored = function colored(color, msg) {
    return console.log(_chalk2.default[color](msg));
};
var identifyPath = function identifyPath() {
    return process.argv[3];
};

var dependencies = [];
var uninstalledDeps = [];
var argv = process.argv;_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var getLatest = function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(dep) {
            var res;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _childProcessPromise.exec)('npm show ' + dep + ' version');

                        case 2:
                            res = _context.sent;
                            return _context.abrupt('return', res.stdout.replace('\n', ""));

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function getLatest(_x) {
            return _ref2.apply(this, arguments);
        };
    }();

    var directory, targetFile, actualPath, texts, codeArray, re, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, line, packagePath, installedDeps, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, dep, npmOpt, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _dep, errorMsg;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    directory = identifyPath() ? process.argv[3] : process.cwd();
                    targetFile = checkExtension(argv[2]);
                    actualPath = directory + '/' + targetFile;
                    _context2.next = 5;
                    return _fsExtra2.default.readFile(actualPath, "utf8");

                case 5:
                    texts = _context2.sent;
                    codeArray = texts.split('\n');
                    re = /require\('(.*)'\)/;
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context2.prev = 11;


                    for (_iterator = codeArray[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        line = _step.value;

                        if (re.test(line)) dependencies.push(line.match(re)[1]);
                    }

                    _context2.next = 19;
                    break;

                case 15:
                    _context2.prev = 15;
                    _context2.t0 = _context2['catch'](11);
                    _didIteratorError = true;
                    _iteratorError = _context2.t0;

                case 19:
                    _context2.prev = 19;
                    _context2.prev = 20;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 22:
                    _context2.prev = 22;

                    if (!_didIteratorError) {
                        _context2.next = 25;
                        break;
                    }

                    throw _iteratorError;

                case 25:
                    return _context2.finish(22);

                case 26:
                    return _context2.finish(19);

                case 27:
                    packagePath = directory + '/package.json';
                    _context2.next = 30;
                    return _fsExtra2.default.readJSON(packagePath);

                case 30:
                    installedDeps = _context2.sent;
                    _iteratorNormalCompletion2 = true;
                    _didIteratorError2 = false;
                    _iteratorError2 = undefined;
                    _context2.prev = 34;


                    for (_iterator2 = dependencies[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        dep = _step2.value;

                        if (depCheck(dep, installedDeps.dependencies)) {
                            uninstalledDeps.push(dep);
                        }
                    }

                    _context2.next = 42;
                    break;

                case 38:
                    _context2.prev = 38;
                    _context2.t1 = _context2['catch'](34);
                    _didIteratorError2 = true;
                    _iteratorError2 = _context2.t1;

                case 42:
                    _context2.prev = 42;
                    _context2.prev = 43;

                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }

                case 45:
                    _context2.prev = 45;

                    if (!_didIteratorError2) {
                        _context2.next = 48;
                        break;
                    }

                    throw _iteratorError2;

                case 48:
                    return _context2.finish(45);

                case 49:
                    return _context2.finish(42);

                case 50:
                    _context2.prev = 50;
                    npmOpt = {
                        cwd: directory,
                        save: true
                    };
                    _context2.next = 54;
                    return _npm2.default.install(uninstalledDeps, npmOpt);

                case 54:
                    colored("Uninstalled dependencies download complete !", 'magenta');
                    _iteratorNormalCompletion3 = true;
                    _didIteratorError3 = false;
                    _iteratorError3 = undefined;
                    _context2.prev = 58;
                    for (_iterator3 = uninstalledDeps[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        _dep = _step3.value;

                        console.log(_chalk2.default.gray(_dep) + '@' + getLatest(_dep) + ' ' + _chalk2.default.green('✔︎') + '\n');
                    }
                    _context2.next = 66;
                    break;

                case 62:
                    _context2.prev = 62;
                    _context2.t2 = _context2['catch'](58);
                    _didIteratorError3 = true;
                    _iteratorError3 = _context2.t2;

                case 66:
                    _context2.prev = 66;
                    _context2.prev = 67;

                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }

                case 69:
                    _context2.prev = 69;

                    if (!_didIteratorError3) {
                        _context2.next = 72;
                        break;
                    }

                    throw _iteratorError3;

                case 72:
                    return _context2.finish(69);

                case 73:
                    return _context2.finish(66);

                case 74:
                    _context2.next = 80;
                    break;

                case 76:
                    _context2.prev = 76;
                    _context2.t3 = _context2['catch'](50);
                    errorMsg = fixMsg(_context2.t3);

                    console.log(_chalk2.default.redBright('Failed:') + ' ' + errorMsg);

                case 80:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _callee2, undefined, [[11, 15, 19, 27], [20,, 22, 26], [34, 38, 42, 50], [43,, 45, 49], [50, 76], [58, 62, 66, 74], [67,, 69, 73]]);
}))();
