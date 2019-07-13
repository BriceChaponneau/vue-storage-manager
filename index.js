/* eslint-disable no-case-declarations */
/**
 *
 *  ____
 * /\  _`\   /'\_/`\
 * \ \,\L\_\/\      \
 *  \/_\__ \\ \ \__\ \
 *    /\ \L\ \ \ \_/\ \
 *    \ `\____\ \_\\ \_\
 *     \/_____/\/_/ \/_/
 *
 * name : sm -> Storage Manager
 * description : Plugin to manage localStorage, sessionStorage and cookies with Vue.js
 * author : Brice CHAPONNEAU
 * version : 1.0.0
 *
 */

const types = {
  SESSION: "session",
  LOCAL: "local",
  COOKIE: "cookie"
};

class sm {
  /**
   * @constructor
   * @param {*} Vue
   * @param {*} opts
   */
  constructor(Vue) {
    this.storeVM = new Vue({
      data() {
        return {
          timeouts: [],
          watchers: []
        };
      }
    });

    window.addEventListener(
      "storage",
      e => this._onStorageEvent(e, this),
      false
    );
  }

  _onStorageEvent(e, self) {
    const type = e.storageArea === sessionStorage ? types.SESSION : types.LOCAL;

    // supprime le timeout si l'item n'existe plus
    const item = self.managerGet(type, e.key);
    if (item === null) self._timeoutDel(type, e.key);

    // callback
    const fn = self.storeVM.$data.watchers.find(c => c.name === e.key);
    if (!fn) return;
    fn.callback({
      type,
      name: e.key,
      oldValue: e.oldValue,
      newValue: e.newValue,
      remove: item ? false : true,
      event: "storage event"
    });
  }

  _timeoutAdd(type, name, timeout) {
    this.storeVM.$data.timeouts.push({
      type,
      name,
      timeout: setTimeout(() => {
        this._timeoutDel(type, name);
        this._watcherDel(name);
        this.managerDel(type, name);
      }, timeout)
    });
  }

  _timeoutDel(type, name, execCallback = true) {
    this.storeVM.$data.timeouts = this.storeVM.$data.timeouts.filter(
      t => t.name !== name
    );

    // callback
    if (!execCallback) return;
    const fn = this.storeVM.$data.watchers.find(c => c.name === name);
    if (!fn) return;
    const val = this.managerGet(type, name);
    fn.callback({
      type,
      name,
      oldValue: val,
      newValue: null,
      remove: true,
      event: "timeout"
    });
  }

  _watcherAdd(type, name, callback) {
    this.storeVM.$data.watchers.push({
      type,
      name,
      callback
    });
  }
  _watcherDel(name) {
    this.storeVM.$data.watchers = this.storeVM.$data.watchers.filter(
      t => t.name !== name
    );
  }

  _getCookieExpiry(val) {
    let res = null;
    if (typeof val === "number") {
      res = new Date(
        new Date().getTime() + parseInt(val, 10) * 1000 * 60 * 60 * 24
      ).toGMTString();
    } else {
      if (typeof val === "object") {
        if (val instanceof Date) {
          res = val.toGMTString();
        } else if (val.hasOwnProperty("expiry")) {
          res = val;
        }
      }
    }
    return res ? `;expires=${res}` : "";
  }

  managerSet(type, name, value, timeout = 0, watcher = null) {
    if (name === undefined) throw new Error("Plugin sm : name is undefined");
    if (value === undefined) throw new Error("Plugin sm : value is undefined");

    switch (type) {
      case types.SESSION:
        sessionStorage.setItem(name, value);
        break;
      case types.LOCAL:
        localStorage.setItem(name, value);
        break;

      default:
        let cookie = `${escape(name)}=${escape(value)}`;
        cookie += this._getCookieExpiry(timeout);
        if (watcher) {
          if (watcher.path) cookie += `;path=${watcher.path}`;
          if (watcher.domain) cookie += `;domain=${watcher.domain}`;
        }
        document.cookie = cookie;
        break;
    }

    if (type === types.COOKIE) return;
    if (timeout) this._timeoutAdd(type, name, timeout);
    if (watcher) this._watcherAdd(type, name, watcher);
  }

  managerGet(type, name) {
    switch (type) {
      case types.SESSION:
        return sessionStorage.getItem(name);

      case types.LOCAL:
        return localStorage.getItem(name);

      default:
        var cookies = document.cookie.match(
          "(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)"
        );
        return cookies ? cookies.pop() : "";
    }
  }

  managerDel(type, name, execCallback = false) {
    if (type !== types.COOKIE) {
      this._timeoutDel(type, name, execCallback);
      this._watcherDel(name);
    }

    switch (type) {
      case types.SESSION:
        sessionStorage.removeItem(name);
        break;

      case types.LOCAL:
        localStorage.removeItem(name);
        break;

      default:
        this.managerSet(types.COOKIE, name, "", -1);
        break;
    }
  }

  managerClear(type) {
    switch (type) {
      case types.SESSION:
        this.storeVM.$data.timeouts = this.storeVM.$data.timeouts.filter(
          e => e.type !== types.SESSION
        );
        this.storeVM.$data.watchers = this.storeVM.$data.watchers.filter(
          e => e.type !== types.SESSION
        );
        sessionStorage.clear();
        break;

      case types.LOCAL:
        this.storeVM.$data.timeouts = this.storeVM.$data.timeouts.filter(
          e => e.type !== types.LOCAL
        );
        this.storeVM.$data.watchers = this.storeVM.$data.watchers.filter(
          e => e.type !== types.LOCAL
        );
        localStorage.clear();
        break;

      default:
        document.cookie.split(";").forEach(c => {
          const index = c.indexOf("=");
          if (index >= 0) {
            const cookie = c.substring(0, index);
            this.managerSet(types.COOKIE, cookie, "", -1);
          }
        });
        break;
    }
  }
}

export default {
  /**
   * Install sm plugin
   * @param {Vue} Vue - Vue instance
   * @param {Object} options - Options for the plugin
   */
  install: (Vue, options = {}) => {
    const instance = new sm(Vue, options);

    const session = {
      set: (name, value, timeout, watcher) =>
        instance.managerSet(types.SESSION, name, value, timeout, watcher),
      get: name => instance.managerGet(types.SESSION, name),
      del: (name, execCallback) =>
        instance.managerDel(types.SESSION, name, execCallback),
      clear: () => instance.managerClear(types.SESSION)
    };

    const local = {
      set: (name, value, timeout, watcher) =>
        instance.managerSet(types.LOCAL, name, value, timeout, watcher),
      get: name => instance.managerGet(types.LOCAL, name),
      del: (name, execCallback) =>
        instance.managerDel(types.LOCAL, name, execCallback),
      clear: () => instance.managerClear(types.LOCAL)
    };

    const cookie = {
      set: (name, value, expires, path, domain) =>
        instance.managerSet(types.COOKIE, name, value, expires, {
          path,
          domain
        }),
      get: name => instance.managerGet(types.COOKIE, name),
      del: name => instance.managerDel(types.COOKIE, name, false),
      clear: () => instance.managerClear(types.COOKIE)
    };

    Vue.prototype.$sm = { session, local, cookie };
  }
};
