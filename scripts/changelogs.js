class Changelogs extends FormApplication{

    constructor(){
        super();
        this.allChangelogs = {
            "important" : {},
            "breaking" : {},
            "major" : {},
            "minor" : {},
        }
        this.changelogs = {
            "important" : {},
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
            $currTarget.closest(".chl-module-important").find(".chl-module-content").toggleClass("hidden");
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
        let settingsToSave = this.readChangelogs;
        for(let [key,value] of Object.entries(this.allChangelogs)){
            for(let [moduleId, moduleData] of Object.entries(value)){
                if(this.readChangelogs[moduleId]!=moduleData.version){
                    this.changelogs[key][moduleId] = moduleData;
                    settingsToSave[moduleId] = moduleData.version;
                }
            }
        }
        game.settings.set("lib-changelogs", "changelogs", settingsToSave);
    }

    render(...args) {
        if(args[2]=="all"){
            this.changelogs = this.allChangelogs;
        }
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

      libChangelogs = new Changelogs();

    Hooks.callAll('libChangelogsReady');

});

Hooks.once('libChangelogsReady', function() {
    libChangelogs.register("levels","TEEST","important")
    libChangelogs.register("betterroofs","TEEST","important")
    libChangelogs.register("combatbooster","TEEST","minor")
    libChangelogs.register("blastzone","TEEST","major")
    libChangelogs.register("fxmaster","TEEST","breaking")
    libChangelogs.register("levels","TEEST","important")
    libChangelogs.register("levels","TEEST","important")
})

Hooks.once('ready', function() {
    libChangelogs.filterAndSave();
    libChangelogs.render(true,{},"all");
});
