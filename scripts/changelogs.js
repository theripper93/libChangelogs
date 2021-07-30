class Changelogs extends FormApplication{

    constructor(){
        super();
        this.allChangelogs = {
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
        this.readChangelogs = game.settings.get("lib-changelogs", "changelogs");
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/lib-changelogs/templates/changelogs.html";
        options.id = "lib-changelogs";
        options.width = 400
        options.height = 400;
        options.title = "Changelogs"
        return options;
    }

    getData() {
        const data = super.getData();
        data.changelogs = this.changelogs;
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.on("click", "#toggle-btn",(event) => {
            let $currTarget = $(event.currentTarget);
            $currTarget.toggleClass("fa-caret-right fa-caret-down");
            $currTarget.closest(".chl-module-critical").find(".chl-module-content").toggleClass("hidden");
            $currTarget.closest(".chl-module-breaking").find(".chl-module-content").toggleClass("hidden");
            $currTarget.closest(".chl-module-major").find(".chl-module-content").toggleClass("hidden");
            $currTarget.closest(".chl-module-minor").find(".chl-module-content").toggleClass("hidden");
        })
    }

    _activateCoreListeners(html) {
    }

    register(moduleId, html, warnLevel="minor") {
        if(!game.modules.get(moduleId)?.active) return;

        if(!this.allChangelogs[warnLevel]) return;
        this.allChangelogs[warnLevel][moduleId] = {
            moduleName : game.modules.get(moduleId).data.title,
            version : game.modules.get(moduleId).data.version,
            html : html,
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
        return false;
    }

    render(...args) {
        if(args[2]=="all"){
            this.changelogs = this.allChangelogs;
        }
        if(!this.isNotEmpty) return;
        super.render(...args);
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

      game.settings.register("lib-changelogs", "alwaysShow", {
        name: game.i18n.localize("lib-changelogs.settings.alwaysShow.name"),
        hint: game.i18n.localize("lib-changelogs.settings.alwaysShow.hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
      });

      libChangelogs = new Changelogs();

    Hooks.callAll('libChangelogsReady');

});

Hooks.once('libChangelogsReady', function() {
    libChangelogs.register("levels","TEEST","critical")
    libChangelogs.register("betterroofs","TEEST","critical")
    libChangelogs.register("combatbooster","TEEST","minor")
    libChangelogs.register("blastzone","TEEST","major")
    libChangelogs.register("fxmaster","TEEST","breaking")
    libChangelogs.register("levels","TEEST","critical")
    libChangelogs.register("levels","TEEST","critical")
})

Hooks.once('ready', function() {
    libChangelogs.filterAndSave();
    libChangelogs.render(true,{},
        game.settings.get("lib-changelogs", "alwaysShow") ? "all" : ""
        );
});


Hooks.on("renderSettingsConfig", function(form,html) {
    let changelogsBtn = `<div class="form-group submenu">
    <label></label>
    <button type="button" id="lib-changelogs-menu">
        <i class="fas fa-cog"></i>
        <label>${game.i18n.localize("lib-changelogs.settings.showAll")}</label>
    </button>
    
</div>`
    html.find('input[name="lib-changelogs.warnLevel"]').closest(".form-group").before(changelogsBtn);

    html.on("click", "#lib-changelogs-menu",(event) => {
        event.preventDefault();
        libChangelogs.render(true,{},"all");
    })

} )

