(function (React, designSystem) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

  var MyDashboard = function MyDashboard(props) {
    return /*#__PURE__*/React__default["default"].createElement(designSystem.Box, {
      className: "dashboard-welcome"
    }, /*#__PURE__*/React__default["default"].createElement(designSystem.H1, null, "Welcome to the TTPS Admin Panel"), /*#__PURE__*/React__default["default"].createElement("a", {
      className: "dashboard-btn",
      href: "/admin/resources/users"
    }, "Manage Users"));
  };

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
      return e;
    };
    var t,
      e = {},
      r = Object.prototype,
      n = r.hasOwnProperty,
      o = Object.defineProperty || function (t, e, r) {
        t[e] = r.value;
      },
      i = "function" == typeof Symbol ? Symbol : {},
      a = i.iterator || "@@iterator",
      c = i.asyncIterator || "@@asyncIterator",
      u = i.toStringTag || "@@toStringTag";
    function define(t, e, r) {
      return Object.defineProperty(t, e, {
        value: r,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }), t[e];
    }
    try {
      define({}, "");
    } catch (t) {
      define = function (t, e, r) {
        return t[e] = r;
      };
    }
    function wrap(t, e, r, n) {
      var i = e && e.prototype instanceof Generator ? e : Generator,
        a = Object.create(i.prototype),
        c = new Context(n || []);
      return o(a, "_invoke", {
        value: makeInvokeMethod(t, r, c)
      }), a;
    }
    function tryCatch(t, e, r) {
      try {
        return {
          type: "normal",
          arg: t.call(e, r)
        };
      } catch (t) {
        return {
          type: "throw",
          arg: t
        };
      }
    }
    e.wrap = wrap;
    var h = "suspendedStart",
      l = "suspendedYield",
      f = "executing",
      s = "completed",
      y = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var p = {};
    define(p, a, function () {
      return this;
    });
    var d = Object.getPrototypeOf,
      v = d && d(d(values([])));
    v && v !== r && n.call(v, a) && (p = v);
    var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
    function defineIteratorMethods(t) {
      ["next", "throw", "return"].forEach(function (e) {
        define(t, e, function (t) {
          return this._invoke(e, t);
        });
      });
    }
    function AsyncIterator(t, e) {
      function invoke(r, o, i, a) {
        var c = tryCatch(t[r], t, o);
        if ("throw" !== c.type) {
          var u = c.arg,
            h = u.value;
          return h && "object" == typeof h && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
            invoke("next", t, i, a);
          }, function (t) {
            invoke("throw", t, i, a);
          }) : e.resolve(h).then(function (t) {
            u.value = t, i(u);
          }, function (t) {
            return invoke("throw", t, i, a);
          });
        }
        a(c.arg);
      }
      var r;
      o(this, "_invoke", {
        value: function (t, n) {
          function callInvokeWithMethodAndArg() {
            return new e(function (e, r) {
              invoke(t, n, e, r);
            });
          }
          return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(e, r, n) {
      var o = h;
      return function (i, a) {
        if (o === f) throw new Error("Generator is already running");
        if (o === s) {
          if ("throw" === i) throw a;
          return {
            value: t,
            done: !0
          };
        }
        for (n.method = i, n.arg = a;;) {
          var c = n.delegate;
          if (c) {
            var u = maybeInvokeDelegate(c, n);
            if (u) {
              if (u === y) continue;
              return u;
            }
          }
          if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
            if (o === h) throw o = s, n.arg;
            n.dispatchException(n.arg);
          } else "return" === n.method && n.abrupt("return", n.arg);
          o = f;
          var p = tryCatch(e, r, n);
          if ("normal" === p.type) {
            if (o = n.done ? s : l, p.arg === y) continue;
            return {
              value: p.arg,
              done: n.done
            };
          }
          "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
        }
      };
    }
    function maybeInvokeDelegate(e, r) {
      var n = r.method,
        o = e.iterator[n];
      if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
      var i = tryCatch(o, e.iterator, r.arg);
      if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
      var a = i.arg;
      return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
    }
    function pushTryEntry(t) {
      var e = {
        tryLoc: t[0]
      };
      1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
    }
    function resetTryEntry(t) {
      var e = t.completion || {};
      e.type = "normal", delete e.arg, t.completion = e;
    }
    function Context(t) {
      this.tryEntries = [{
        tryLoc: "root"
      }], t.forEach(pushTryEntry, this), this.reset(!0);
    }
    function values(e) {
      if (e || "" === e) {
        var r = e[a];
        if (r) return r.call(e);
        if ("function" == typeof e.next) return e;
        if (!isNaN(e.length)) {
          var o = -1,
            i = function next() {
              for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
              return next.value = t, next.done = !0, next;
            };
          return i.next = i;
        }
      }
      throw new TypeError(typeof e + " is not iterable");
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: !0
    }), o(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: !0
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
      var e = "function" == typeof t && t.constructor;
      return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
    }, e.mark = function (t) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
    }, e.awrap = function (t) {
      return {
        __await: t
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
      return this;
    }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
      void 0 === i && (i = Promise);
      var a = new AsyncIterator(wrap(t, r, n, o), i);
      return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
        return t.done ? t.value : a.next();
      });
    }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
      return this;
    }), define(g, "toString", function () {
      return "[object Generator]";
    }), e.keys = function (t) {
      var e = Object(t),
        r = [];
      for (var n in e) r.push(n);
      return r.reverse(), function next() {
        for (; r.length;) {
          var t = r.pop();
          if (t in e) return next.value = t, next.done = !1, next;
        }
        return next.done = !0, next;
      };
    }, e.values = values, Context.prototype = {
      constructor: Context,
      reset: function (e) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
      },
      stop: function () {
        this.done = !0;
        var t = this.tryEntries[0].completion;
        if ("throw" === t.type) throw t.arg;
        return this.rval;
      },
      dispatchException: function (e) {
        if (this.done) throw e;
        var r = this;
        function handle(n, o) {
          return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
        }
        for (var o = this.tryEntries.length - 1; o >= 0; --o) {
          var i = this.tryEntries[o],
            a = i.completion;
          if ("root" === i.tryLoc) return handle("end");
          if (i.tryLoc <= this.prev) {
            var c = n.call(i, "catchLoc"),
              u = n.call(i, "finallyLoc");
            if (c && u) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            } else if (c) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            } else {
              if (!u) throw new Error("try statement without catch or finally");
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            }
          }
        }
      },
      abrupt: function (t, e) {
        for (var r = this.tryEntries.length - 1; r >= 0; --r) {
          var o = this.tryEntries[r];
          if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
            var i = o;
            break;
          }
        }
        i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
        var a = i ? i.completion : {};
        return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
      },
      complete: function (t, e) {
        if ("throw" === t.type) throw t.arg;
        return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
      },
      finish: function (t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
        }
      },
      catch: function (t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.tryLoc === t) {
            var n = r.completion;
            if ("throw" === n.type) {
              var o = n.arg;
              resetTryEntry(r);
            }
            return o;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function (e, r, n) {
        return this.delegate = {
          iterator: values(e),
          resultName: r,
          nextLoc: n
        }, "next" === this.method && (this.arg = t), y;
      }
    }, e;
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  AdminBro.env.REACT_APP_API_URL;
  var UploadUsers = function UploadUsers() {
    var _useState = React.useState(null),
      _useState2 = _slicedToArray(_useState, 2),
      file = _useState2[0],
      setFile = _useState2[1];
    var handleDrop = function handleDrop(files) {
      setFile(files[0]);
    };
    var handleSubmit = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
        var formData, response;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              e.preventDefault();
              if (file) {
                _context.next = 4;
                break;
              }
              alert('Please select a file to upload');
              return _context.abrupt("return");
            case 4:
              formData = new FormData();
              formData.append('file', file);
              formData.append('AUTHKEY', "hkhasd");
              _context.prev = 7;
              _context.next = 10;
              return fetch('https://swif.ttlawcourts.org/api/ttps/admin/bulk/upload-csv', {
                method: 'POST',
                body: formData
              });
            case 10:
              response = _context.sent;
              if (response.ok) {
                alert('File uploaded successfully');
              } else {
                alert('Error uploading file');
              }
              _context.next = 18;
              break;
            case 14:
              _context.prev = 14;
              _context.t0 = _context["catch"](7);
              console.error('Error:', _context.t0);
              alert('Error uploading file');
            case 18:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[7, 14]]);
      }));
      return function handleSubmit(_x) {
        return _ref.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React__default["default"].createElement(designSystem.Box, {
      className: "form-container",
      style: {
        padding: "40px",
        width: "100%",
        maxWidth: "600px",
        margin: "20px auto"
      }
    }, /*#__PURE__*/React__default["default"].createElement("form", {
      onSubmit: handleSubmit
    }, /*#__PURE__*/React__default["default"].createElement(designSystem.Label, {
      htmlFor: "file",
      style: {
        width: "100%",
        maxWidth: "600px",
        fontSize: "20px",
        padding: "10px 0"
      }
    }, "Upload CSV File"), /*#__PURE__*/React__default["default"].createElement(designSystem.DropZone, {
      onChange: handleDrop
    }, /*#__PURE__*/React__default["default"].createElement(designSystem.DropZoneItem, {
      src: file && URL.createObjectURL(file)
    })), /*#__PURE__*/React__default["default"].createElement(designSystem.Button, {
      variant: "primary",
      type: "submit",
      style: {
        cursor: "pointer"
      }
    }, "Upload")));
  };

  AdminBro.UserComponents = {};
  AdminBro.UserComponents.Component1 = MyDashboard;
  AdminBro.UserComponents.Component2 = UploadUsers;

})(React, AdminBroDesignSystem);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi92aWV3cy9teS1kYXNoYm9hcmQtY29tcG9uZW50LmpzeCIsIi4uL2FkbWluQ3VzdG9tUGFnZXMvVXBsb2FkVXNlcnMuanN4IiwiLmVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCb3gsIEgxLCBUZXh0LCBCdXR0b24gfSBmcm9tICdAYWRtaW4tYnJvL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBNeURhc2hib2FyZCA9IChwcm9wcykgPT4ge1xuICByZXR1cm4gKFxuICAgIDxCb3ggY2xhc3NOYW1lPSdkYXNoYm9hcmQtd2VsY29tZSc+XG4gICAgICA8SDE+V2VsY29tZSB0byB0aGUgVFRQUyBBZG1pbiBQYW5lbDwvSDE+XG4gICAgICB7LyogPFRleHQ+VXNlIHRoZSBsaW5rIGJlbG93IHRvIG1hbmFnZSB1c2Vyczo8L1RleHQ+ICovfVxuICAgICAgey8qIDxCdXR0b24gaHJlZj1cIi9hZG1pbi9yZXNvdXJjZXMvdXNlcnNcIj5NYW5hZ2UgVXNlcnM8L0J1dHRvbj4gKi99XG4gICAgICA8YSBjbGFzc05hbWU9XCJkYXNoYm9hcmQtYnRuXCIgaHJlZj1cIi9hZG1pbi9yZXNvdXJjZXMvdXNlcnNcIj5NYW5hZ2UgVXNlcnM8L2E+XG4gICAgPC9Cb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBNeURhc2hib2FyZDtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIExhYmVsLCBEcm9wWm9uZSwgRHJvcFpvbmVJdGVtLCBEcm9wWm9uZVByb3BzLCBCYXNlUHJvcGVydHlQcm9wcyB9IGZyb20gJ0BhZG1pbi1icm8vZGVzaWduLXN5c3RlbSdcblxuXG5cbmNvbnN0IEFQSV9VUkwgPSBwcm9jZXNzLmVudi5SRUFDVF9BUFBfQVBJX1VSTFxuXG5jb25zdCBVcGxvYWRVc2VycyA9ICgpID0+IHtcbiAgY29uc3QgW2ZpbGUsIHNldEZpbGVdID0gdXNlU3RhdGUobnVsbClcblxuICBjb25zdCBoYW5kbGVEcm9wID0gKGZpbGVzKSA9PiB7XG4gICAgc2V0RmlsZShmaWxlc1swXSlcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IGFzeW5jIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICBhbGVydCgnUGxlYXNlIHNlbGVjdCBhIGZpbGUgdG8gdXBsb2FkJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKVxuICAgIGZvcm1EYXRhLmFwcGVuZCgnQVVUSEtFWScsIFwiaGtoYXNkXCIpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9zd2lmLnR0bGF3Y291cnRzLm9yZy9hcGkvdHRwcy9hZG1pbi9idWxrL3VwbG9hZC1jc3YnLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIH0pXG5cbiAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICBhbGVydCgnRmlsZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHknKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ0Vycm9yIHVwbG9hZGluZyBmaWxlJylcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpXG4gICAgICBhbGVydCgnRXJyb3IgdXBsb2FkaW5nIGZpbGUnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBjbGFzc05hbWU9XCJmb3JtLWNvbnRhaW5lclwiIHN0eWxlPXt7cGFkZGluZzpcIjQwcHhcIiwgd2lkdGg6XCIxMDAlXCIsIG1heFdpZHRoOlwiNjAwcHhcIiwgbWFyZ2luOlwiMjBweCBhdXRvXCJ9fT5cbiAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVTdWJtaXR9PlxuICAgICAgICA8TGFiZWwgaHRtbEZvcj1cImZpbGVcIiBzdHlsZT17eyB3aWR0aDpcIjEwMCVcIiwgbWF4V2lkdGg6XCI2MDBweFwiLCBmb250U2l6ZTpcIjIwcHhcIiwgcGFkZGluZzpcIjEwcHggMFwifX0+VXBsb2FkIENTViBGaWxlPC9MYWJlbD5cbiAgICAgICAgPERyb3Bab25lIG9uQ2hhbmdlPXtoYW5kbGVEcm9wfT5cbiAgICAgICAgICA8RHJvcFpvbmVJdGVtIHNyYz17ZmlsZSAmJiBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpfSAvPlxuICAgICAgICA8L0Ryb3Bab25lPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdHlwZT1cInN1Ym1pdFwiIHN0eWxlPXt7Y3Vyc29yOlwicG9pbnRlclwifX0+XG4gICAgICAgICAgVXBsb2FkXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9mb3JtPlxuICAgIDwvQm94PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFVwbG9hZFVzZXJzXG4iLCJBZG1pbkJyby5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgQ29tcG9uZW50MSBmcm9tICcuLi92aWV3cy9teS1kYXNoYm9hcmQtY29tcG9uZW50J1xuQWRtaW5Ccm8uVXNlckNvbXBvbmVudHMuQ29tcG9uZW50MSA9IENvbXBvbmVudDFcbmltcG9ydCBDb21wb25lbnQyIGZyb20gJy4uL2FkbWluQ3VzdG9tUGFnZXMvVXBsb2FkVXNlcnMnXG5BZG1pbkJyby5Vc2VyQ29tcG9uZW50cy5Db21wb25lbnQyID0gQ29tcG9uZW50MiJdLCJuYW1lcyI6WyJNeURhc2hib2FyZCIsInByb3BzIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiQm94IiwiY2xhc3NOYW1lIiwiSDEiLCJocmVmIiwiQWRtaW5Ccm8iLCJlbnYiLCJSRUFDVF9BUFBfQVBJX1VSTCIsIlVwbG9hZFVzZXJzIiwiX3VzZVN0YXRlIiwidXNlU3RhdGUiLCJfdXNlU3RhdGUyIiwiX3NsaWNlZFRvQXJyYXkiLCJmaWxlIiwic2V0RmlsZSIsImhhbmRsZURyb3AiLCJmaWxlcyIsImhhbmRsZVN1Ym1pdCIsIl9yZWYiLCJfYXN5bmNUb0dlbmVyYXRvciIsIl9yZWdlbmVyYXRvclJ1bnRpbWUiLCJtYXJrIiwiX2NhbGxlZSIsImUiLCJmb3JtRGF0YSIsInJlc3BvbnNlIiwid3JhcCIsIl9jYWxsZWUkIiwiX2NvbnRleHQiLCJwcmV2IiwibmV4dCIsInByZXZlbnREZWZhdWx0IiwiYWxlcnQiLCJhYnJ1cHQiLCJGb3JtRGF0YSIsImFwcGVuZCIsImZldGNoIiwibWV0aG9kIiwiYm9keSIsInNlbnQiLCJvayIsInQwIiwiY29uc29sZSIsImVycm9yIiwic3RvcCIsIl94IiwiYXBwbHkiLCJhcmd1bWVudHMiLCJzdHlsZSIsInBhZGRpbmciLCJ3aWR0aCIsIm1heFdpZHRoIiwibWFyZ2luIiwib25TdWJtaXQiLCJMYWJlbCIsImh0bWxGb3IiLCJmb250U2l6ZSIsIkRyb3Bab25lIiwib25DaGFuZ2UiLCJEcm9wWm9uZUl0ZW0iLCJzcmMiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJCdXR0b24iLCJ2YXJpYW50IiwidHlwZSIsImN1cnNvciIsIlVzZXJDb21wb25lbnRzIiwiQ29tcG9uZW50MSIsIkNvbXBvbmVudDIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFHQSxJQUFNQSxXQUFXLEdBQUcsU0FBZEEsV0FBV0EsQ0FBSUMsS0FBSyxFQUFLO0VBQzdCLEVBQUEsb0JBQ0VDLHlCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDQyxJQUFBQSxTQUFTLEVBQUMsbUJBQUE7S0FDYkgsZUFBQUEseUJBQUEsQ0FBQUMsYUFBQSxDQUFDRyxlQUFFLEVBQUMsSUFBQSxFQUFBLGlDQUFtQyxDQUFDLGVBR3hDSix5QkFBQSxDQUFBQyxhQUFBLENBQUEsR0FBQSxFQUFB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
