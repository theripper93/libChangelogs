class Changelogs extends FormApplication{

    constructor(){
        super();
        this.allChangelogs = {
            "critical" : {},
            "breaking" : {},
            "major" : {},
            "minor" : {},
        }
        this.allConflicts = {
            "critical" : {},
            "breaking" : {},
            "major" : {},
            "minor" : {},
        }
        this.changelogs = {
            "critical" : {},
            "breaking" : {},
            "major" : {},
            "minor" : {},
        }
        this.conflicts = {
            "critical" : {},
            "breaking" : {},
            "major" : {},
            "minor" : {},
        }
        this.readChangelogs = game.settings.get("lib-changelogs", "changelogs");
        this.markdownCoverter = new showdown.Converter()
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/lib-changelogs/templates/changelogs.html";
        options.id = "lib-changelogs";
        options.width = 400
        options.height = 400;
        options.title = "Changelogs"
        options.resizable = true
        return options;
    }

    getData() {
        const data = super.getData();
        data.changelogs = this.changelogs;
        data.conflicts = this.conflicts;
        data.titles = {
            changelogs:  game.i18n.localize("lib-changelogs.dialog.changelog"),
            conflicts: game.i18n.localize("lib-changelogs.dialog.conflict"),
        }
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.on("click", ".chl-module-header",(event) => {
            let $currTarget = $(event.currentTarget);
            $currTarget.find("#toggle-btn").toggleClass("fa-caret-right fa-caret-down");
            $currTarget.closest(".chl-module-critical").find(".chl-module-content").toggleClass("hidden");
            $currTarget.closest(".chl-module-breaking").find(".chl-module-content").toggleClass("hidden");
            $currTarget.closest(".chl-module-major").find(".chl-module-content").toggleClass("hidden");
            $currTarget.closest(".chl-module-minor").find(".chl-module-content").toggleClass("hidden");
        })
    }

    _activateCoreListeners(html) {
    }

/**
 * @param {string} moduleId The package identifier, i.e. the 'id' field in your module/system/world's manifest.json
 * @param {string} markdown The text in markdown language to be inserted into the changelog
 * @param {string} warnLevel The level of warning to be displayed.
 * 
 *   The possible types are:
 * 
 * - critical: 
 *         Only use for emergencies, something went wrong or the update requires immidiate action from the user.
 * - breaking:
 *         A breaking change that requires action from the user but will not cause issues if left unattended (eg. a new feature that requires some manual configuration changes).
 * - major:
 *         One or more Major features have been added to the module, let the user know what they do or link to other resources.
 * - minor:
 *         Minor bugfixes or changes that won't impact the user experience with your module (this is the default option).
 * **/

    register(moduleId, markdown, warnLevel="minor") {
        if(!game.modules.get(moduleId)?.active) return;

        if(!this.allChangelogs[warnLevel]) return;
        this.allChangelogs[warnLevel][moduleId] = {
            moduleName : game.modules.get(moduleId).data.title + " - " + game.modules.get(moduleId).data.version,
            version : game.modules.get(moduleId).data.version,
            html : this.markdownCoverter.makeHtml(markdown),
        }
    }

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

    registerConflict(moduleId, conflictingModule, markdown, warnLevel, ){
        if(!game.modules.get(moduleId)?.active || !game.modules.get(conflictingModule)?.active) return;
        if(!this.allConflicts[warnLevel]) return;
        this.allConflicts[warnLevel][moduleId] = {
            moduleName : game.modules.get(moduleId).data.title + " - " + game.modules.get(moduleId).data.version + " / " + game.modules.get(conflictingModule).data.title + " - " + game.modules.get(conflictingModule).data.version,
            version : game.modules.get(moduleId).data.version,
            html : this.markdownCoverter.makeHtml(markdown),
            conflict : true,
            conflictingModule : conflictingModule
        }
    }

    filterAndSave(){
        let warnLevel = game.settings.get("lib-changelogs", "warnLevel")
        let settingsToSave = this.readChangelogs;
        for(let [key,value] of Object.entries(this.allChangelogs)){
            for(let [moduleId, moduleData] of Object.entries(value)){
                if(this.readChangelogs[moduleId]!=moduleData.version){
                    if(this.warnLevel(key,warnLevel))this.changelogs[key][moduleId] = moduleData;
                    settingsToSave[moduleId] = moduleData.version;
                }
            }
        }
        for(let [key,value] of Object.entries(this.allConflicts)){
            for(let [moduleId, moduleData] of Object.entries(value)){
                if(this.readChangelogs[moduleId]!=moduleData.version){
                    if(this.warnLevel(key,warnLevel) && game.modules.get(moduleData.conflictingModule)?.active)this.conflicts[key][moduleId] = moduleData;
                    settingsToSave[moduleId] = moduleData.version;
                }
            }
        }
        game.settings.set("lib-changelogs", "changelogs", settingsToSave);
    }

    warnLevel(level,max){
        if(max=="all") return true;
        if(level=="critical") return true;
        if(max=="major" && level != "minor") return true;
        if(max=="breaking" && level != "minor" && level != "minor") return true;
        return false;
    }

    get isNotEmpty(){
        for(let [key,value] of Object.entries(this.changelogs)){
            if(Object.entries(value).length>0) return true;
        }
        for(let [key,value] of Object.entries(this.conflicts)){
            if(Object.entries(value).length>0) return true;
        }
        return false;
    }

    render(...args) {
        if(args[2]=="all"){
            this.changelogs = this.allChangelogs;
            this.conflicts = this.allConflicts;
        }
        if(!this.isNotEmpty) return args[3] ? ui.notifications.info(game.i18n.localize("CHANGELOGS.empty")) : undefined;
        super.render(...args);
    }

    static injectSidebar(shtml){
    const html = shtml ?? ui.sidebar.tabs.settings.element
    html.find("#lib-changelogs-button").remove();
    const conflictNumber = Object.values(libChangelogs.allConflicts).reduce((acc,cur) => acc + Object.values(cur).length,0)
    const buttonText = conflictNumber > 0 ? `${game.i18n.localize("lib-changelogs.settings.showConflicts")} ${conflictNumber}` : game.i18n.localize("lib-changelogs.dialog.conflictcn");
    const button = `<button id="lib-changelogs-button" ${conflictNumber > 0 ? 'style="background:#ff7e7e"' : ""} >
    <i class="${conflictNumber > 0 ? "fas fa-exclamation-triangle" : "fas fa-clipboard-check"}"></i> ${buttonText}
</button>`
    html.find(`#settings-documentation`).first().prepend(button)
    html.on("click", "#lib-changelogs-button",(event) => {
        event.preventDefault();
        libChangelogs.render(true,{},"all", true);
    })
    }

}

let libChangelogs

Hooks.once('init', function() {
    

    game.settings.register("lib-changelogs", "changelogs", {
        name: "",
        hint: "",
        scope: "world",
        config: false,
        type: Object,
        default: {},
      });

      game.settings.register("lib-changelogs", "warnLevel", {
        name: game.i18n.localize("lib-changelogs.settings.warnLevel.name"),
        hint: game.i18n.localize("lib-changelogs.settings.warnLevel.hint"),
        scope: "world",
        config: true,
        type: String,
        choices: {
            "all": game.i18n.localize("lib-changelogs.settings.warnLevel.all"),
            "major": game.i18n.localize("lib-changelogs.settings.warnLevel.major"),
            "breaking": game.i18n.localize("lib-changelogs.settings.warnLevel.breaking"),
            "critical": game.i18n.localize("lib-changelogs.settings.warnLevel.critical"),
        },
        default: "all",
      });

      game.settings.register("lib-changelogs", "communityConflicts", {
        name: game.i18n.localize("lib-changelogs.settings.communityConflicts.name"),
        hint: game.i18n.localize("lib-changelogs.settings.communityConflicts.hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
      });

      game.settings.register("lib-changelogs", "alwaysShow", {
        name: game.i18n.localize("lib-changelogs.settings.alwaysShow.name"),
        hint: game.i18n.localize("lib-changelogs.settings.alwaysShow.hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
      });

      libChangelogs = new Changelogs();

});

Hooks.once('ready', function() {
    if(!game.user.isGM) return
    Hooks.callAll('libChangelogsReady');
    libChangelogs.filterAndSave();
    libChangelogs.render(true,{},
        game.settings.get("lib-changelogs", "alwaysShow") ? "all" : ""
        );
    Changelogs.injectSidebar();

});


Hooks.on("renderSettingsConfig", function(form,html) {

    let changelogsBtn = `<div class="form-group submenu">
    <label></label>
    <button type="button" id="lib-changelogs-menu">
        <i class="fas fa-cog"></i>
        <label>${game.i18n.localize("lib-changelogs.settings.showAll")}</label>
    </button>
    
</div>`
    html.find('select[name="lib-changelogs.warnLevel"]').closest(".form-group").before(changelogsBtn);

    html.on("click", "#lib-changelogs-menu",(event) => {
        event.preventDefault();
        libChangelogs.render(true,{},"all",true);
    })
} )

Hooks.on("renderSidebarTab",(settings) => {
    if(!game.user.isGM || !settings.id.includes("settings")) return
    Changelogs.injectSidebar(settings.element);
  });