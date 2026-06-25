const ivm = require("isolated-vm");

const MEMORY_LIMIT_MB = 128;
const TIMEOUT_MS = 2000;

function buildBootstrap(mode, code, context) {
  const contextJson = JSON.stringify(context || {});
  const userCode = JSON.stringify(code || "");
  return `
    const __context = ${contextJson};
    const __result = { mutations: { env: {}, headers: {} }, tests: [], logs: [], error: null };
    const __env = Object.assign({}, __context.environment || {});

    const console = {
      log: function () {
        const parts = [];
        for (let i = 0; i < arguments.length; i++) {
          const value = arguments[i];
          parts.push(typeof value === "object" ? JSON.stringify(value) : String(value));
        }
        __result.logs.push(parts.join(" "));
      }
    };

    function __expect(actual) {
      return {
        to: {
          equal: function (expected) {
            if (actual !== expected) {
              throw new Error("expected " + JSON.stringify(actual) + " to equal " + JSON.stringify(expected));
            }
          },
          eql: function (expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
              throw new Error("expected " + JSON.stringify(actual) + " to deeply equal " + JSON.stringify(expected));
            }
          },
          be: {
            ok: function () {
              if (!actual) {
                throw new Error("expected value to be ok");
              }
            }
          }
        }
      };
    }

    const __response = __context.response || {};
    const pm = {
      environment: {
        get: function (key) { return __env[key]; },
        set: function (key, value) { __env[key] = value; __result.mutations.env[key] = value; }
      },
      variables: {
        get: function (key) { return __env[key]; }
      },
      request: {
        addHeader: function (key, value) { __result.mutations.headers[key] = value; }
      },
      response: {
        code: __response.code,
        responseTime: __response.responseTime,
        text: function () { return __response.body || ""; },
        json: function () { return JSON.parse(__response.body || "null"); }
      },
      test: function (name, fn) {
        try {
          fn();
          __result.tests.push({ name: name, passed: true, error: null });
        } catch (err) {
          __result.tests.push({ name: name, passed: false, error: String(err && err.message ? err.message : err) });
        }
      },
      expect: __expect
    };

    try {
      (function () { eval(${userCode}); })();
    } catch (err) {
      __result.error = String(err && err.message ? err.message : err);
    }

    JSON.stringify(__result);
  `;
}

async function runScript(mode, code, context) {
  const isolate = new ivm.Isolate({ memoryLimit: MEMORY_LIMIT_MB });
  try {
    const vmContext = await isolate.createContext();
    const bootstrap = buildBootstrap(mode, code, context);
    const script = await isolate.compileScript(bootstrap);
    const raw = await script.run(vmContext, { timeout: TIMEOUT_MS });
    return JSON.parse(raw);
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return { mutations: { env: {}, headers: {} }, tests: [], logs: [], error: message };
  } finally {
    isolate.dispose();
  }
}

module.exports = { runScript };
