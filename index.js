/* eslint-disable no-case-declarations */
/* eslint-disable no-console */
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
    // création d'une nouvelle instance pour gérer des données réactives
    this.storeVM = new Vue({
      data() {
        return {
          timeouts: [],
          watchers: []
        };
      }
    });

    // Ajout un handler
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
    fn.callback(type, e.key, e.oldValue, e.newValue, item ? false : true);
  }

  _timeoutAdd(name, timeout, type) {
    this.storeVM.$data.timeouts.push({
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
    fn.callback(val, null, true);
  }

  _watcherAdd(name, callback) {
    this.storeVM.$data.watchers.push({
      name,
      callback
    });
  }
  _watcherDel(name) {
    this.storeVM.$data.watchers = this.storeVM.$data.watchers.filter(
      t => t.name !== name
    );
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
        const path = watcher && watcher.path ? watcher.path : "/";
        const domain = watcher && watcher.domain ? watcher.domain : "/";

        if (timeout) {
          // C'est une instance de Date
          if (timeout instanceof Date) {
            // Ce n'est pas une date valide, on met celle du jour
            if (isNaN(timeout.getTime())) timeout = new Date();
          } else
            timeout = new Date(
              new Date().getTime() + parseInt(timeout, 10) * 1000 * 60 * 60 * 24
            );

          cookie += `,expires=${timeout.toGMTString()}`;
        }

        if (path) cookie += `,path=${path}`;
        if (domain) cookie += `,domain=${domain}`;

        cookie += ";";
        document.cookie = cookie;
        break;
    }

    if (type === types.COOKIE) return;
    if (timeout) this._timeoutAdd(name, timeout, type);
    if (watcher) this._watcherAdd(name, watcher);
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
    this.storeVM.$data.timeouts = [];
    this.storeVM.$data.watchers = [];

    switch (type) {
      case types.SESSION:
        sessionStorage.clear();
        break;

      case types.LOCAL:
        localStorage.clear();
        break;

      default:
        break;
    }
  }
}

export default {
  /**
   * Install lng plugin
   * @param {Vue} Vue - Vue instance
   * @param {Object} options - Options for the plugin
   */
  install: (Vue, options = {}) => {
    const instance = new sm(Vue, options);
    // session
    Vue.prototype.$smSSet = (name, value, timeout, watcher) => instance.managerSet(types.SESSION, name, value, timeout, watcher);
    Vue.prototype.$smSGet = name => instance.managerGet(types.SESSION, name);
    Vue.prototype.$smSDel = (name, execCallback) => instance.managerDel(types.SESSION, name, execCallback);
    Vue.prototype.$smSClear = () => instance.managerClear(types.SESSION);

    // local
    Vue.prototype.$smLSet = (name, value, timeout, watcher) =>
      instance.managerSet(types.LOCAL, name, value, timeout, watcher);
    Vue.prototype.$smLGet = name => instance.managerGet(types.LOCAL, name);
    Vue.prototype.$smLDel = (name, execCallback) => instance.managerDel(types.LOCAL, name, execCallback);
    Vue.prototype.$smLClear = () => instance.managerClear(types.LOCAL);

    // cookie
    Vue.prototype.$smCSet = (name, value, expires, path, domain) =>
      instance.managerSet(types.COOKIE, name, value, expires, { path, domain });
    Vue.prototype.$smCGget = name => instance.managerGet(types.COOKIE, name);
    Vue.prototype.$smCDel = name => instance.managerDel(types.COOKIE, name, false);
    Vue.prototype.$smCClear = () => instance.managerClear(types.COOKIE);
  }
};
