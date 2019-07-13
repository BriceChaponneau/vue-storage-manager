# vue-storage-manager (Vue.js Storage Manager plugin)

[Documentation en Français](#fr)

#en

## Welcome to vue-storage-manager

vue-storage-manager is a plugin that makes it easy to manage localstorage, sessionstorage and cookies with Vue.js.

### How to use

#### Installation

After creating a Vue.js project
You have to install the package:

```
npm i vue-storage-manager
```

Then, in the ** mains.js ** file at the root of the project, you need to import the plugins:

```
import sm from "vue-storage-manager";
```

The plugin is now present in the project

#### Configuration

To add the plugin to the view instance:

```
Vue.use(sm);
```

#### Utilisation (méthodes)

Once installed, the plugin is available in all components.
To use it, just use:

\$sm.OBJECT.ACTION;

OBJECT :

- local for localstorage
- session for sessionstorage
- cookie for cookie

ACTION :

- set : create OBJECT
- get : get OBJECT
- del : remove OBJECT
- clear : remove all OBJECT in same type

**SESSION and LOCAL**

SET : \$sm.OBJET.set(name, value, timeout, watcher)

- name
- value
- timeout (optionnal) : expiry time in milliseconds before automatic deletion
- watcher (optionnal) : during the alteration of the OBJECT, a callback is made.

GET : \$sm.OBJET.get(name)

- name

DEL : \$sm.OBJET.del(name, callback)

- name
- callback (optionnal) : return function after deletion

CLEAR : \$sm.OBJET.clear()

Example :

```
...
methods: {
    storageSet() {
      this.$sm.local.set("toto", "123", 3000, this.storageUpdate);
    },
    storageGet() {
      console.log(this.$sm.local.get("toto"));
    },
    storageDel() {
      this.$sm.local.del("toto");
    },
    storageClear() {
      this.$sm.local.clear();
    },
    storageUpdate(val) {
      console.log("callback : ", val);
      /*
      retourne un objet :
      {
        type, // local or session
        name, // name
        oldValue, // old value
        newValue, // new value
        remove, // is the event coming from a removal of the OBJECT
        event: "timeout" // is the event coming from a "timeout" or a third-party modification of the storage
      }
      */
    }
  },
...
```

**COOKIE**

SET : \$sm.cookie.set(name, value, expires, path, domain)

- name
- value
- expires (optionnal) : expiration time (integer = number of days / date / object with expiry key)
- path (optionnal) : url
- domain (optionnal) : host where the cookie will be injected

GET : \$sm.cookie.set(name)

- name

DEL : \$sm.cookie.set(name)

- name

CLEAR : \$sm.cookie.clear()

Example :

```
...
methods: {
    storageSet() {
      this.$sm.cookie.set("toto", "123", 3, "/", ".myDomain.com");
    },
    storageGet() {
      console.log(this.$sm.cookie.get("toto"));
    },
    storageDel() {
      this.$sm.cookie.del("toto");
    },
    storageClear() {
      this.$sm.cookie.clear();
    }
  },
...
```

#### Last word

Thank you

---

[English documentation](#en)

#fr

## Bienvenue sur la page de vue-storage-manager

vue-storage-manager est un plugin facilitant la gestion du localstorage, du sessionstorage et des cookies avec Vue.js.

### Comment l'utiliser

#### Installation

Après avoir créé un projet Vue.js
Il faut installer le paquet :

```
npm i vue-storage-manager
```

Ensuite, dans le fichier **mains.js** à la racine du projet, il faut importer le plugins :

```
import sm from "vue-storage-manager";
```

Le plugin est désormais présent dans le projet

#### Configuration

Pour ajouter le plugin à l'instance de vue :

```
Vue.use(sm);
```

#### Utilisation (méthodes)

Une fois installé, le plugin est disponible dans tous les composants.
Pour l'utiliser, il suffit d'utiliser :

\$sm.OBJET.ACTION;

OBJET :

- local pour localstorage
- session pour sessionstorage
- cookie pour cookie

ACTION :

- set : pour créer l'OBJET
- get : pour récupérer l'OBJET
- del : pour supprimer l'OBJET
- clear : pour supprimer tous les OBJETs du même type

**SESSION et LOCAL**

SET : \$sm.OBJET.set(name, value, timeout, watcher)

- name : nom
- value : valeur
- timeout (optionnel) : temps d'expiration en milliseconds avant suppression automatique
- watcher (optionnel) : lors de l'altération de l'OBJET, un callback est effectué.

GET : \$sm.OBJET.get(name)

- name : nom

DEL : \$sm.OBJET.del(name, callback)

- name : nom
- callback (optionnel) : fonction de retour après suppression

CLEAR : \$sm.OBJET.clear()

Exemple :

```
...
methods: {
    storageSet() {
      this.$sm.local.set("toto", "123", 3000, this.storageUpdate);
    },
    storageGet() {
      console.log(this.$sm.local.get("toto"));
    },
    storageDel() {
      this.$sm.local.del("toto");
    },
    storageClear() {
      this.$sm.local.clear();
    },
    storageUpdate(val) {
      console.log("callback : ", val);
      /*
      retourne un objet :
      {
        type, // local ou session
        name, // nom
        oldValue, // ancienne valeur
        newValue, // nouvelle valeur
        remove, // est ce que l'evenement provient d'une suppression de l'OBJET
        event: "timeout" // est ce que l'evenement provient d'un "timeout" ou d'une modification tierce du storage
      }
      */
    }
  },
...
```

**COOKIE**

SET : \$sm.cookie.set(name, value, expires, path, domain)

- name : nom
- value : valeur
- expires (optionnel) : delais d'expiration (entier = nombre de jours / date / objet avec clé "expiry")
- path (optionnel) : url
- domain (optionnel) : hôte ou le cookie sera injecté

GET : \$sm.cookie.set(name)

- name : nom

DEL : \$sm.cookie.set(name)

- name : nom

CLEAR : \$sm.cookie.clear()

Exemple :

```
...
methods: {
    storageSet() {
      this.$sm.cookie.set("toto", "123", 3, "/", ".monDomain.com");
    },
    storageGet() {
      console.log(this.$sm.cookie.get("toto"));
    },
    storageDel() {
      this.$sm.cookie.del("toto");
    },
    storageClear() {
      this.$sm.cookie.clear();
    }
  },
...
```

#### Dernier mot

Merci
