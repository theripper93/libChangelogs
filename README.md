# CHANGELOGS & CONFLICTS
## Before opening an issue read [THIS](https://github.com/theripper93/Levels/blob/v9/ISSUES.md)
## Show changelogs of modules in a non intrusive way.

![Latest Release Download Count](https://img.shields.io/github/downloads/theripper93/libChangelogs/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2FlibChangelogs&colorB=03ff1c&style=for-the-badge)](https://forge-vtt.com/bazaar#package=libChangelogs) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftheripper93%2FlibChangelogs%2Fmain%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge) [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/theripper93) [![alt-text](https://img.shields.io/badge/-Discord-%235662f6?style=for-the-badge)](https://discord.gg/F53gBjR97G)

# Why?

Module developers have no way of issuing changelogs or important warnings in a clean and streamlined way. This module adds a non intrusive way for users to get important informations. What is more, a lot of times users need to rely on discord to know if modules conflict with each other. Changelogs & Conflicts will also warn users of potential conflicts and display the suggested curse of action provided by the developer (for example, you might just need to disable a setting in one of the modules for things to work).

# How does it work?

You can chose the level of importance you want to see

![image](https://user-images.githubusercontent.com/1346839/127586817-23289481-6cb4-4fcd-a50f-d9fcdaa14fd5.png)

With four options

![image](https://user-images.githubusercontent.com/1346839/127586846-b7b603a2-8561-47a4-990a-9507a0a76daf.png)

Once you close the window you will not get notified again for the current version of the module

![image](https://user-images.githubusercontent.com/1346839/127656038-5172c5a0-d480-4522-b151-4ee28a451fa6.png)

If you accidentaly closed a popup and want to check all your changelogs just click the show all changelogs button in Changelogs settings

![image](https://user-images.githubusercontent.com/1346839/127587526-a54346b2-aa79-43aa-b1dc-bcba1fe22252.png)

You will be reminded of conflicts here as well

![image](https://user-images.githubusercontent.com/1346839/146197946-820533a1-d1cc-42f8-9494-d4e50d46f866.png)



## All
Any changelog and warning will be shown

## Major
Only updates with new features (and above) will be shown

## Breaking
Only updates with breaking changes (and above) will be shown

## Critical
Only for emergencies, this is for module developers to issue critical messages

## Color Codes

* Purple: Critical
* Red: Breaking
* Yellow: Major
* Blue: Minor

# Community Conflicts

If you are aware of a conflict you can send a Pull Request and add that conflict registration to `communityConflicts.js` following the instructions provided below!

# How to include changelogs in your module:
Including a changelog is very simple, just call the `libChangelogs.register()` in the `libChangelogsReady` hook. Since changelogs is registered on a custom hook you don't need to check if the module is active before you register your changelog nor add it as a dependency

```js
/**
 * @param {string} moduleId The package identifier, i.e. the 'id' field in your module/system/world's manifest.json
 * @param {string} markdown The text in markdown language to be inserted into the changelog
 * @param {string} warnLevel The level of warning to be displayed.
 * 
 *   The possible types are:
 * 
 * - critical: 
 *         Only use for emergencies, something went wrong or the update requires immidiate action from the user. This warning level CANNOT be disable by the user
 * - breaking:
 *         A breaking change that requires action from the user but will not cause issues if left unattended (eg. a new feature that requires some manual configuration changes).
 * - major:
 *         One or more Major features have been added to the module, let the user know what they do or link to other resources.
 * - minor:
 *         Minor bugfixes or changes that won't impact the user experience with your module (this is the default option).
 * **/

    libChangelogs.register(moduleId, markdown, warnLevel="minor")
```

# Example

```js
Hooks.once('libChangelogsReady', function() {
    libChangelogs.register("yourmoduleid","THIS UPDATE BREAKS EVERYTHING","critical")
})
```

![image](https://user-images.githubusercontent.com/1346839/127656111-fdfc19ce-b98e-4bfd-ae3b-ad7e85430b41.png)


# How to include conflicts in your module:
Including a conflict is very simple, just call the `libChangelogs.registerConflict()` in the `libChangelogsReady` hook. Since changelogs is registered on a custom hook you don't need to check if the module is active before you register your conflict nor add it as a dependency. You can register multiple conflicts with separate `libChangelogs.registerConflict()` calls.

```js
/**
 * @param {string} moduleId The package identifier, i.e. the 'id' field in your module/system/world's manifest.json
 * @param {string} conflictingModule The package identifier, i.e. the 'id' field of the conflicting module.
 * @param {string} markdown The text in markdown language to be displayed for the conflict.
 * @param {string} warnLevel The level of warning to be displayed.
 * 
 *   The possible types are:
 * 
 * - critical: 
 *         Using both modules together will make foundry unusable.
 * - breaking:
 *         User will experience issues that can make foundry unusable under specific circumstances if the conflicting module is enabled.
 * - major:
 *         Features will not work as expected if the conflicting module is enabled.
 * - minor:
 *         User will experience minor issues, such as UI bugs or minor features not working - the user might need to disable some features from your or the conflicting module for things to work correctly.
 * **/

    libChangelogs.registerConflict(moduleId, conflictingModule, markdown, warnLevel)
   
```

# Example

```js
Hooks.once('libChangelogsReady', function() {
    libChangelogs.registerConflict("yourmoduleid", "conflictingmoduleid","Enabling both modules will cause foundry to not function","critical")
})
```


## Libraries

This module uses https://github.com/showdownjs/showdown for markdown parsing
