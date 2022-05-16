Hooks.once("init", async function(){
    game.settings.registerMenu("BymChnConnector", "sapi5Table", {
        name: "TTSC.SAPI5Settings",
        label: "TTSC.SAPI5Settingslabel",
        hint: "TTSC.SAPI5Settingshint",
        icon: "fas fa-book",
        type: Sapi5ListSettings,
        restricted: false
    })

    game.settings.register("BymChnConnector", "BymChnDefVolume", {
        name: "TTSC.BymChnDefaultVolume",
        hint: "TTSC.BymChnDefaultVolumehint",
        scope: "client",
        config: true,
        default: 100,
        type: Number,
        range: {
            min: 0,
            max: 300,
            step: 1
        }
    })

    game.settings.register("BymChnConnector", "coefontactivate", {
        name: "TTSC.CoeFontFunctionActivate",
        hint: "TTSC.CoeFontFunctionActivatehint",
        scope: "client",
        config: true,
        type:Boolean,
        default: false,
        onChange: value => {
            foundry.utils.debounce(window.location.reload(), 100)
        }
    });

    game.settings.register("BymChnConnector", "active",{
        name:"BymChn active",
        scope: "client",
        config: false,
        type:Boolean,
        default:true
    });

    let coe_activate = await game.settings.get("BymChnConnector", "coefontactivate");
    if(coe_activate){
        game.settings.registerMenu("BymChnConnector", "coefontTable", {
            name: "TTSC.CoeFontVoiceListSettings",
            label: "TTSC.CoeFontVoiceListSettingslabel",
            hint: "TTSC.CoeFontVoiceListSettingshint",
            icon: 'fas fa-book',
            type: CoeFontSettings,
            restricted: false
        });

        game.settings.register("BymChnConnector", "coefontmastervolume", {
            name: "TTSC.CoeFontMasterVolumeSetting",
            hint: "TTSC.CoeFontMasterVolumeSettinghint",
            scope: "client",
            config: true,
            default: 1,
            type: Number,
            range:{
                min:0.2,
                max:2,
                step:0.1
            }
        })

        game.settings.register("BymChnConnector", "coefontapiurl", {
            name: "TTSC.CoeFontAPIConnectorURL",
            hint: "TTSC.CoeFontAPIConnectorURLhint",
            scope: "client",
            config: true,
            default: "",
            type: String
        })
    }

    /**
     *  i = 10 , k = 11 or (i = "pass", k = "pasta")
     *  {{#uniqueif i "===" k}}
     *  > false
     */
     Handlebars.registerHelper('uniqueif', function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
});

Hooks.on('getSceneControlButtons', (buttons) => {
    let group = buttons.find(b => b.name == 'sounds')
    group.tools.push(
        {
            toggle: true,
            icon: "fas fa-comment-dots",
            name: "activateTTS",
            active: game.settings.get("BymChnConnector", "active"),
            title: game.i18n.localize("TTSC.ButtonTTSOnOff"),
            onClick: async (a) => {
                await game.settings.set("BymChnConnector", "active", a)
            }
        }
    )
    group.tools.push(
        {
            button: true,
            icon: "fas fa-cog",
            name: "speakersettings",
            title: game.i18n.localize("TTSC.ButtonTTSSpeakerSettings"),
            onClick: async () => {
                voiceSelector();
            }
        }
    )
});

Hooks.once("ready", async function(){
    let a = await game.user.getFlag("BymChnConnector", "select-voice");
    if(!a){
        await defvoice()
    }

    game.settings.register("BymChnConnector", "voice-list",{
        name:"BymChn voice-list",
        scope: "client",
        config: false,
        type:Object,
        default:[
            {name:game.i18n.localize("TTSC.VoiceDefault"), type:0, num:0, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceWoman1"), type:0, num:1, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceWoman2"), type:0, num:2, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceMan1"), type:0, num:3, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceMan2"), type:0, num:4, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceNeutral"), type:0, num:5, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceRobot"), type:0, num:6, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceMachine1"), type:0, num:7, coef:"error"},
            {name:game.i18n.localize("TTSC.VoiceMachine2"), type:0, num:8, coef:"error"}
        ]
    });

    game.settings.register("BymChnConnector", "sapi5-list",{
        name:"BymChn sapi5-list",
        scope: "client",
        config: false,
        type:Object,
        default:[
            {name:game.i18n.localize("TTSC.VoiceSAPI5Default"), type:1, num:10001, coef:"error"}
        ],
        onChange: async(list) => {
            let selectVoice = await game.user.getFlag("BymChnConnector", "select-voice")
            let defvol = game.settings.get("BymChnConnector", "BymChnDefVolume")
            for(let i = (selectVoice.length - 1); i >= 0; i--){
                if(selectVoice[i].vtype == 1){
                    let find = false
                    for(let k = 0; k < list.length; k++){
                        if(list[k].num == selectVoice[i].voice) find = true
                    }
                    if(!find){
                        selectVoice[i].coef = "error"
                        selectVoice[i].vtype = 0
                        selectVoice[i].volume = defvol
                    }
                }
            }
        }
    });

    game.settings.register("BymChnConnector", "coef-list",{
        name:"coefont-voice-list",
        scope: "client",
        config: false,
        type:Object,
        default:[
            {name: game.i18n.localize("TTSC.VoiceArial"), type:2, num:game.i18n.localize("TTSC.VoiceArial"), coef:'{"df":"46a81787-af54-4a91-8c5b-3b597066294e","ki":"432f4a8f-f95e-4536-ae36-70417af539c3","dio":"76c0536c-4ace-428b-a148-0a2ded355e34","ai":"9c32c6b9-f169-435e-8f62-3b1fa89f1ce0","rk":"15eae1c8-d421-43ee-816f-7ba00b0499ef"}'},
            {name: game.i18n.localize("TTSC.VoiceMirial"), type:2, num:game.i18n.localize("TTSC.VoiceMirial"), coef:'{"df":"c28adf78-d67d-4588-a9a5-970a76ca6b07","ki":"9e0c2783-804c-4f77-81ab-1fbc70d15ffc","dio":"34cda1d6-c68f-409a-901c-9dee43c7c608","ai":"ff70d3d0-a11b-4d88-ab79-a480ba7bfb32","rk":"8faa559d-ebba-4ec7-969e-3071e396ffd3"}'},
            {name: game.i18n.localize("TTSC.VoiceAlbani"), type:2, num:game.i18n.localize("TTSC.VoiceAlbani"), coef:'{"df":"e0898f09-11ce-4644-9552-c418228e79b9","ki":"07ce43a1-e353-494f-91f3-3c3ebd56c748","dio":"d90c6da8-21e0-4c88-8b4d-2963cd2ed213","ai":"195b1d58-982d-4d5e-af63-0055c6f5e45a","rk":"e0898f09-11ce-4644-9552-c418228e79b9"}'}
        ],
        onChange: async (list) => {
            let selectVoice = await game.user.getFlag("BymChnConnector", "select-voice")
            let defvol = game.settings.get("BymChnConnector", "BymChnDefVolume")
            for(let i = (selectVoice.length - 1); i >= 0; i--){
                if(selectVoice[i].vtype == 2){
                    let index = -1
                    for(let k=0;k<list.length;k++){
                        if(list[k].name == selectVoice[i].voice)
                        index = k;
                    }
                    if(index >= 0){
                        selectVoice[i].coef = list[index].coef
                    }else{
                        selectVoice[i].coef = "error"
                        selectVoice[i].vtype = 0
                        selectVoice[i].volume = defvol
                    }
                }
            }
        }
    });

    let voiceL = await game.user.getFlag("BymChnConnector", "select-voice");
    if( game.modules.get('theatre')?.active){
        if(voiceL[0].name != game.i18n.localize("TTSC.VoiceNarrator") && voiceL[0].type != 2){
            voiceL.unshift({type:2, name:game.i18n.localize("TTSC.VoiceNarrator"), id:"theater", voice:0});
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    }else{
        if(voiceL?.[0].name == game.i18n.localize("TTSC.VoiceNarrator") && voiceL?.[0].type == 2) {
            voiceL.shift();
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    }

    game.socket.on('module.BymChnConnector', async (packet) => {
        const data = packet.data;
        const type = packet.type;
        const receiveUserId = packet.receiveUserId;
        const sendUserId = packet.sendUserId;

        if(type == "request"){
            let voice = 0;
            let active = await game.settings.get("BymChnConnector", "active");
            let volume = null;
            let vtype = 0;
            let coef = "error";
            let list = await game.user.getFlag("BymChnConnector", "select-voice");
            let theatre = false;
            if( game.modules.get('theatre')?.active) if (Theatre.instance.speakingAs == Theatre.NARRATOR) theatre = true
            if(theatre){
                let index = list.findIndex(k => k.type == 2 && k.id == 'theater');
                if(index >= 0){
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                    coef = list[index].coef;
                }
            }else if(data.speaker.actor){
                let index = list.findIndex(i => i.type == 1 && i.id == data.speaker.actor);
                if(index >= 0){
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                    coef = list[index].coef;
                }else{
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if(bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume
                    vtype = 0;
                    coef = "eroor";
                }
            }else{
                let index = list.findIndex(j => j.type == 0 && j.id == sendUserId);
                if(index >= 0){
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                    coef = list[index].coef;
                }else{
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if(bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume;
                    vtype = 0;
                    coef = "eroor";
                }
            }
            if(active){
                let bouyomiChanClient = new BouyomiChanClient();
                if(( volume > 1 || volume < 0) && (vtype == 0 || vtype == 1)) volume = -1;
                if(vtype == 2 && ( volume > 1 || volume < 0)) volume = 0.5;
                if(vtype == 0 || vtype == 1) {
                    volume = volume * 300;
                    volume = Math.round(volume)
                    await bouyomiChanClient.talk(data.message, voice, volume);
                }
                if(vtype == 2) {
                    if(coef != "error"){
                        let emotion = data.emotion;
                        if(coef[emotion] == "") emotion = "df"
                        if(coef[emotion] != ""){
                            var audioElement;

                            let masterVolume = await game.settings.get("BymChnConnector", "coefontmastervolume")
                            if(masterVolume > 2) masterVolume = 2
                            if(masterVolume < 0.2) masterVolume = 0.2
                            let url = await coeFont(text = data.message, coef = coef[emotion]);

                            audioElement = new Audio();
                            audioElement.src = url;
                            audioElement.volume = volume;
                            audioElement.play();
                        }else{
                            console.error(game.i18n.localize("TTSC.ErrorCoeFontUuidMiss"))
                        }
                    }
                }
            }
        }
    });
});

class Sapi5ListData{
    static sapi5List(){
        return game.settings.get("BymChnConnector", "sapi5-list");
    }

    static sapi5DefaultList(){
        return game.settings.set("BymChnConnector", "sapi5-list", [
            {name:game.i18n.localize("TTSC.VoiceSAPI5Default"), type:1, num:10001, coef:"error"}
        ])
    }

    static deleteSapi5list(name, index, num){
        let sapi5List = game.settings.get("BymChnConnector", "sapi5-list");
        if(sapi5List[index].name == name && sapi5List[index].num == num){
            let del = sapi5List.splice(index, 1);
        }
        return game.settings.set("BymChnConnector", "sapi5-list", sapi5List)
    }

    static createSapi5List(){
        let sapi5List = game.settings.get("BymChnConnector", "sapi5-list");
        sapi5List.push({name:"", type:1, num:"", coef:"error"})
        return game.settings.set("BymChnConnector", "sapi5-list", sapi5List)
    }
}

class Sapi5ListSettings extends FormApplication {
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
          title: game.i18n.localize("TTSC.WindowSAPI5Settingstitle"),
          id: 'sapi5-settings',
          template: 'modules/BymChnConnector/templates/sapi5-settings.html',
          width: 550,
          height: 'auto',
          resizable:true,
          closeOnSubmit: false
        })
    }

    async getData() {
		let data = super.getData();
		data.sapi5List = Sapi5ListData.sapi5List();
        return data
    }

    activateListeners (html) {
        super.activateListeners(html)

        html.find("a.add-voice").on("click", async (event) => {
            event.preventDefault();
            Sapi5ListData.createSapi5List();
            this.render()
        })
        html.find("a.voice-delete").on("click", async (event) => {
            event.preventDefault();
            const targetName = $(event.currentTarget).parent().parent().data("name");
            const targetIndex = $(event.currentTarget).parent().parent().data("id");
            const targetNum = $(event.currentTarget).parent().parent().data("num");
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowSAPI5Settingstitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowCheckDeletecontent")}</p>`,
                buttons:{
                    delete:{
                        label:game.i18n.localize("TTSC.WindowDelete"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () =>{
                            Sapi5ListData.deleteSapi5list(targetName, targetIndex, targetNum);
                            this.render();
                        }
                    },
                    cancel:{
                        label:game.i18n.localize("TTSC.WindowCancel"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => {}
                    }
                },
                default: 'cancel',
                close: () => {}
            });
            dlg.render(true);
        })
        html.find('button[name="reset"]').on("click", async (event) => {
            event.preventDefault();
            Sapi5ListData.sapi5DefaultList();
            this.close();
        })
    }

    async _updateObject (event, formData) {
        let sapi5List = Sapi5ListData.sapi5List();
        const data = foundry.utils.flattenObject(formData);
        let nameNone = false
        let numNone = false
        for(let i = 0 ; i < sapi5List.length; i++){
            let name = data[`${i}${sapi5List[i].name}`];
            let num = data[`${i}${sapi5List[i].name}num`];
            if(!!name){
                sapi5List[i].name = name;
            }else{
                nameNone = true;
            }
            if(!!num){
                sapi5List[i].num = num;
            }else{
                numNone = true;
            }
        }
        if(nameNone || numNone){
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowNoNameNoIdtitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowNoNameNoIdcontent")}</p>`,
                buttons:{
                    delete:{
                        label:game.i18n.localize("TTSC.WindowYes"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () =>{
                            for(let j = (sapi5List.length - 1); j >= 0; j--){
                                if(!sapi5List[j].name || !sapi5List[j].num){
                                    sapi5List.splice(j, 1)
                                }
                            }
                            await game.settings.set("BymChnConnector", "sapi5-list", sapi5List);
                            this.close();
                        }
                    },
                    cancel:{
                        label:game.i18n.localize("TTSC.WindowNo"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => {}
                    }
                },
                default: 'cancel',
                close: () => {}
            });
            dlg.render(true);
        }else{
            game.settings.set("BymChnConnector", "sapi5-list", sapi5List);
            this.close();
        }
    }
}

class CoeListData {
    static coeList(){
        let coeList = game.settings.get("BymChnConnector", "coef-list");
        for(let i = 0; i < coeList.length; i++){
            try{
                coeList[i].coef = JSON.parse(coeList[i].coef)
            } 
            catch{}
        }
        return coeList
    }

    static defaultCoeList(){
        return game.settings.set("BymChnConnector", "coef-list", [
            {name: game.i18n.localize("TTSC.VoiceArial"), type:2, num:game.i18n.localize("TTSC.VoiceArial"), coef:'{"df":"46a81787-af54-4a91-8c5b-3b597066294e","ki":"432f4a8f-f95e-4536-ae36-70417af539c3","dio":"76c0536c-4ace-428b-a148-0a2ded355e34","ai":"9c32c6b9-f169-435e-8f62-3b1fa89f1ce0","rk":"15eae1c8-d421-43ee-816f-7ba00b0499ef"}'},
            {name: game.i18n.localize("TTSC.VoiceMirial"), type:2, num:game.i18n.localize("TTSC.VoiceMirial"), coef:'{"df":"c28adf78-d67d-4588-a9a5-970a76ca6b07","ki":"9e0c2783-804c-4f77-81ab-1fbc70d15ffc","dio":"34cda1d6-c68f-409a-901c-9dee43c7c608","ai":"ff70d3d0-a11b-4d88-ab79-a480ba7bfb32","rk":"8faa559d-ebba-4ec7-969e-3071e396ffd3"}'},
            {name: game.i18n.localize("TTSC.VoiceAlbani"), type:2, num:game.i18n.localize("TTSC.VoiceAlbani"), coef:'{"df":"e0898f09-11ce-4644-9552-c418228e79b9","ki":"07ce43a1-e353-494f-91f3-3c3ebd56c748","dio":"d90c6da8-21e0-4c88-8b4d-2963cd2ed213","ai":"195b1d58-982d-4d5e-af63-0055c6f5e45a","rk":"e0898f09-11ce-4644-9552-c418228e79b9"}'}
        ])   
    }

    static deleteCoeList(name, index){
        let coeList = game.settings.get("BymChnConnector", "coef-list");
        if(coeList[index].name == name){
            let del = coeList.splice(index, 1)
        }
        return game.settings.set("BymChnConnector", "coef-list", coeList)
    }

    static createCoeList(){
        let coeList = game.settings.get("BymChnConnector", "coef-list");
        coeList.push({name: "", type:2, num:"", coef:'{"df":"","ki":"","dio":"","ai":"","rk":""}'})
        return game.settings.set("BymChnConnector", "coef-list", coeList)
    }
}

class CoeFontSettings extends FormApplication {
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
          title: game.i18n.localize("TTSC.WindowCoeFontSettingstitle"),
          id: 'coefont-settings',
          template: 'modules/BymChnConnector/templates/coefont-settings.html',
          width: 550,
          height: 'auto',
          resizable:true,
          closeOnSubmit: false
        })
    }

	async getData() {
		let data = super.getData();
		data.coeList = CoeListData.coeList();
        return data
    }

    activateListeners (html) {
        super.activateListeners(html)
        html.find('a.accordion-switch').on('click', event => {
            event.preventDefault();
            let view = $(event.currentTarget).parent().parent().next("div.sub-voice-settings").css("display");
            let height = $(event.currentTarget).parents("#coefont-settings").height();
            if(view == "none"){
                $(event.currentTarget).parents("#coefont-settings").height(height).animate({height: height + 104}, 100, function(){
                    $(event.currentTarget).parent().parent().next("div.sub-voice-settings").slideToggle(200);
                    $(event.currentTarget).children().removeClass("fa-angle-up");
                    $(event.currentTarget).children().addClass("fa-angle-down");
                });
            }else{
                $(event.currentTarget).parents("#coefont-settings").animate({height: height - 104}, 100, function(){
                    $(event.currentTarget).parent().parent().next("div.sub-voice-settings").slideToggle(200);
                    $(event.currentTarget).children().removeClass("fa-angle-down");
                    $(event.currentTarget).children().addClass("fa-angle-up");
                });
            }
        })
        html.find("a.add-voice").on("click", async (event) => {
            event.preventDefault();
            CoeListData.createCoeList();
            this.render()
        })
        html.find("a.voice-delete").on("click", async (event) => {
            event.preventDefault();
            const targetName = $(event.currentTarget).parent().parent().data("name");
            const targetIndex = $(event.currentTarget).parent().parent().data("id");
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowCheckDeletetitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowCheckDeletecontent")}</p>`,
                buttons:{
                    delete:{
                        label:game.i18n.localize("TTSC.WindowDelete"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () =>{
                            CoeListData.deleteCoeList(targetName, targetIndex);
                            this.render();
                        }
                    },
                    cancel:{
                        label:game.i18n.localize("TTSC.WindowCancel"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => {}
                    }
                },
                default: 'cancel',
                close: () => {}
            });
            dlg.render(true);
        })
        html.find('button[name="reset"]').on("click", async (event) => {
            event.preventDefault();
            CoeListData.defaultCoeList();
            this.close();
        })
    }

    async _updateObject (event, formData) {
        let coeList = CoeListData.coeList();
        const data = foundry.utils.flattenObject(formData);
        let df, ki, dio, ai, rk;
        let nameNone = false

        for(let i = 0 ; i < coeList.length; i++){
            df = ki = dio = ai = rk = "";
            if(data[`${i}${coeList[i].name}`]){
                coeList[i].name = data[`${i}${coeList[i].name}`]
                coeList[i].num = data[`${i}${coeList[i].name}`]
            }else{
                nameNone = true;
            }
            if(data[`${i}${coeList[i].name}df`]){
                df = data[`${i}${coeList[i].name}df`]
            }
            if(data[`${i}${coeList[i].name}ki`]){
                ki = data[`${i}${coeList[i].name}ki`]
            }
            if(data[`${i}${coeList[i].name}dio`]){
                dio = data[`${i}${coeList[i].name}dio`]
            }
            if(data[`${i}${coeList[i].name}ai`]){
                ai = data[`${i}${coeList[i].name}ai`]
            }
            if(data[`${i}${coeList[i].name}rk`]){
                rk = data[`${i}${coeList[i].name}df`]
            }
            coeList[i].coef = `{"df":"${df}", "ki":"${ki}", "dio":"${dio}", "ai":"${ai}", "rk":"${rk}"}`
        }
        if(nameNone){
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindoWNoNametitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowNoNamecontent")}</p>`,
                buttons:{
                    delete:{
                        label:game.i18n.localize("TTSC.WindowYes"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () =>{
                            for(let j = (coeList.length - 1); j >= 0; j--){
                                if(!coeList[j].name){
                                    coeList.splice(j, 1)
                                }
                            }
                            await game.settings.set("BymChnConnector", "coef-list", coeList);
                            this.close();
                        }
                    },
                    cancel:{
                        label:game.i18n.localize("TTSC.WindowNo"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => {}
                    }
                },
                default: 'cancel',
                close: () => {}
            });
            dlg.render(true);
        }else{
            game.settings.set("BymChnConnector", "coef-list", coeList);
            this.close();
        }
    }
}

async function coeFont(text, coef, volume){
    const data = {text:text, coefont: coef, volume};

    const param  = {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify(data)
    };

    const server = await game.settings.get("BymChnConnector", "coefontapiurl");

    let dataurl

    await fetch(server, param)
    .then((res)=>{
        return( res.json() );
    })
    .then((json)=>{
        if(json.url) dataurl = json.url
    });
    if(dataurl){
        return dataurl
    }
}

async function defvoice(){
    const users = game.users.contents;
    let def = [];
    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
    if(bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;

    if( game.modules.get('theatre')?.active){
        def.push({type:2, name:game.i18n.localize("TTSC.VoiceNarrator"), id:"theater", voice:0, volume:bymchndefVolume, vtype: 0, coef: "error"});
    }
    for(let i = 0; i < users.length; i++){
        def.push({type:0, name:users[i].name, id:users[i].id, voice:0, volume:bymchndefVolume, vtype: 0, coef: "error"})
    }
    const actors = game.actors.contents;
    for(let j = 0; j < actors.length; j++){
        def.push({type:1, name:actors[j].name, id:actors[j].id, voice:0, volume:bymchndefVolume, vtype: 0, coef: "error"})
    }
    await game.user.setFlag("BymChnConnector", "select-voice", def);
}

async function voiceSelector(){
    const users = game.users.contents;
    let send;
    let def = [];
    let voiceList = await game.settings.get("BymChnConnector", "voice-list");
    let sapi5List = await game.settings.get("BymChnConnector", "sapi5-list");
    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
    if(bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;

    let coefList = []
    if(game.settings.get("BymChnConnector", "coefontactivate")) coefList = await game.settings.get("BymChnConnector", "coef-list");
    let sendList = [...voiceList, ...sapi5List, ...coefList];
    if( game.modules.get('theatre')?.active){
        def.push({type:2, name:game.i18n.localize("TTSC.VoiceNarrator"), id:"theater", voice:0, volume:bymchndefVolume, vtype: 0, coef: "error"});
    }
    for(let i = 0; i < users.length; i++){
        def.push({type:0, name:users[i].name, id:users[i].id, voice:0, volume:bymchndefVolume, vtype: 0, coef: "error"})
    }
    const actors = game.actors.contents;
    for(let j = 0; j < actors.length; j++){
        def.push({type:1, name:actors[j].name, id:actors[j].id, voice:0, volume:bymchndefVolume, vtype: 0, coef: "error"})
    }
    send = [...def];
    if(!game.user.data.flags["BymChnConnector"]){
        await game.user.setFlag("BymChnConnector", "select-voice", send);
    }else{
        for(let k = 0; k < game.user.data.flags["BymChnConnector"]["select-voice"].length; k++){
            let index = send.findIndex(a => (a.id == (game.user.data.flags["BymChnConnector"]["select-voice"][k].id) && (a.name == game.user.data.flags["BymChnConnector"]["select-voice"][k].name)) || (game.user.data.flags["BymChnConnector"]["select-voice"][k].name == "ナレーター"));
            if(index >= 0){
                send[index] = {...game.user.data.flags["BymChnConnector"]["select-voice"][k]}
            }
        }
        await game.user.setFlag("BymChnConnector", "select-voice", send);
    }

    const html = await renderTemplate('modules/BymChnConnector/templates/VoiceSelectDialog.html', {users:game.user.data.flags["BymChnConnector"]["select-voice"],voiceList: sendList});
    const data =  await new Promise(resolve => {
        const dlg = new Dialog({
            title: game.i18n.localize("TTSC.WindowSelectSpeakerVoicetitle"),
            content: html,
            buttons:{
                submit:{
                    label: game.i18n.localize("TTSC.WindowSave"),
                    icon: `<i class="far fa-save"></i>`,
                    callback: async (html) => {
                        formData = new FormData(html[0].querySelector('#select-voice'));
                        for(let l = 0; l < send.length; l++){
                            let re = formData.get(send[l].id);
                            if(Number(re.split("&&")[0])){
                                send[l].voice = Number(re.split("&&")[0]);
                            }else{
                                send[l].voice = re.split("&&")[0];
                            }                            
                            send[l].vtype = Number(re.split("&&")[1]);
                            if(send[l].vtype == 2) {
                                send[l].coef = JSON.parse(re.split("&&")[2]);
                            }else{
                                send[l].coef = re.split("&&")[2];
                            }
                            let vo = formData.get(send[l].id+"volume");
                                send[l].volume = Number(vo)

                        }
                        await game.user.setFlag("BymChnConnector", "select-voice", send);
                        return resolve(true)
                    }
                },
                cancel:{
                    label: game.i18n.localize("TTSC.WindowCancel"),
                    icon: `<i class="fas fa-ban"></i>`,
                    callback: async () => {
                        return resolve(true)
                    }
                }
            },
            default: '',
            close:() => { return resolve(false)}
        },{
            width: 660
        });
        dlg.render(true);
    });
}

Hooks.on("chatMessage", (chatLog, message, chatData) =>{
    let parse = ChatLog.parse(message);
    let notskip = false
    switch (parse[0]) {
        case "roll": case "gmroll": case "blindroll": case "selfroll": case "publicroll": case "macro":
            notskip = true;
        break;
        case "whisper": case "reply": case "gm": case "players": case "ic": case "emote": case "ooc":
            notskip = false;
        break;
    }

    if(!notskip){
        Hooks.once("preCreateChatMessage",async (document, data, options, userId) => {
            let text = "";
            let active = await game.settings.get("BymChnConnector", "active");
            let voice = 0;
            let volume = null;
            let vtype = 0;
            let coef = "error";
            let emotion ="df"
            let list = await game.user.getFlag("BymChnConnector", "select-voice");
            let theatre = false;
            if( game.modules.get('theatre')?.active) if (Theatre.instance.speakingAs == Theatre.NARRATOR) theatre = true
            if(theatre){
                let index = list.findIndex(k => k.type == 2 && k.id == 'theater');
                if(index >= 0){
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                    coef = list[index].coef;
                }
            }else if(data.speaker){
                let index = list.findIndex(i => i.type == 1 && i.id == data.speaker.actor);
                if(index >= 0){
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                    coef = list[index].coef;
                }else{
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if(bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume
                    vtype = 0;
                    coef = "eroor";
                }
            }else{
                let index = list.findIndex(j => j.type == 0 && j.id == userId);
                if(index >= 0){
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                    coef = list[index].coef;
                }else{
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if(bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume;
                    vtype = 0;
                    coef = "eroor";
                }
            }

            var textdata = htmlTokenizer("<div>" + data.content + "</div>");
            for(let k = 0;k < textdata.length; k++){
                if(!textdata[k].match(/^\<(".*?"|'.*?'|[^'"])*?\>/)){
                    if(!textdata[k].match(/、$|,$|。$|\.$/)){
                        text += textdata[k]
                        text += "。"
                    }else{
                        text += textdata[k]
                    }
                }else if(textdata[k].match(/(<br>|<br \/>)/gi)){
                    text += '\n'
                }
            }

            if(vtype == 2 && coef != "error"){
                emotion = data.content.match(/^ki(?=\) )|do(?=\) )|ai(?=\) )|rk(?=\) )/);
                if(!!emotion?.[0]) text = text.slice(4)
                emotion = emotion?.[0];
                if(emotion == "do") emotion = "dio";
                if(!emotion) emotion = "df";
            }
            let packet = {data:{message:text, speaker:document.data.speaker, emotion: emotion},type:"request", sendUserId: game.user.id}
            if(text != "") game.socket.emit('module.BymChnConnector', packet);

            if(active){
                if(( volume > 1 || volume < 0) && (vtype == 0 || vtype == 1)) volume = -1;
                if(vtype == 2 && ( volume > 1 || volume < 0)) volume = 0.5;
                let bouyomiChanClient = new BouyomiChanClient();
                if(vtype == 0 || vtype == 1) {
                    volume = volume * 300;
                    volume = Math.round(volume)
                    await bouyomiChanClient.talk(text, voice, volume);
                }
                if(vtype == 2) {
                    if(coef != "error"){
                        if(coef[emotion] == "") {
                            emotion = "df"
                            console.error(game.i18n.localize("TTSC.ErrorEmotionNone"))
                        }
                        if(coef[emotion] != ""){
                            var audioElement;

                            let masterVolume = await game.settings.get("BymChnConnector", "coefontmastervolume")
                            if(masterVolume > 2) masterVolume = 2
                            if(masterVolume < 0.2) masterVolume = 0.2

                            let url = await coeFont(text = text, coef = coef[emotion], volume = masterVolume);

                            audioElement = new Audio();
                            audioElement.src = url;
                            audioElement.volume = volume;
                            audioElement.play();
                        }else{
                            console.error(game.i18n.localize("TTSC.ErrorCoeFontUuidMiss"))
                        }
                    }
                }
            }
        });
    }
});

/**
 * @author      toshi (https://github.com/k08045kk)
 * @license     MIT License | https://opensource.org/licenses/MIT
 * @version     2
 * @since       1 - 20211215 - 初版
 * @since       2 - 20220328 - fix 「'」「"」をタグ名・属性名に使用できる
 * @since       2 - 20220328 - fix 全角スペースをタグ名・属性名に使用できる
 * @since       2 - 20220328 - fix 属性の途中に「"'」を含むことがある
 * @see         https://www.bugbugnow.net/2021/12/tokenize-parse-html.html
 * @param {string} html - 生テキストのHTML
 * @param {Object} [option={}] - オプション
 * @param {boolean} option.trim - タグ間の空白を削除する
 * @return {string[]} - 分解した文字列
 */
 function htmlTokenizer(html, option={}) {
    const stack = [];
  
    let lastIndex = 0;
    const findTag = /<[!/A-Za-z][^\t\n\f\r />]*([\t\n\f\r /]+[^\t\n\f\r /][^\t\n\f\r /=]*([\t\n\f\r ]*=([\t\n\f\r ]*("[^"]*"|'[^']*'|[^\t\n\f\r >]*)))?)*[\t\n\f\r /]*>/g;
    for (let m; m=findTag.exec(html); ) {
      if (lastIndex < m.index) {
        let text = html.substring(lastIndex, m.index);
        if (option.trim) { text = text.trim(); }
        if (text.length > 0) { stack.push(text); }
      }
      lastIndex = findTag.lastIndex;
  
      let tag = m[0];
      if (option.trim) { tag = tag.trim(); }
      stack.push(tag);
    }
    return stack;
}