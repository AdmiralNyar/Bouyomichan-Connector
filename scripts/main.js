
var isNewVersion = isNewerVersion(game.version, "10");

//Version Comparison
const compare = (a, b) => {
    if (a == b) {
        return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");
    var len = Math.min(a_components.length, b_components.length);

    for (var i = 0; i < len; i++) {
        if (parseInt(a_components[i]) > parseInt(b_components[i])) {
            return 1;
        }

        if (parseInt(a_components[i]) < parseInt(b_components[i])) {
            return -1;
        }
    }

    if (a_components.length > b_components.length) {
        return 1;
    }

    if (a_components.length < b_components.length) {
        return -1;
    }

    return 0;
}

Hooks.once("init", async function () {
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

    game.settings.register("BymChnConnector", "active", {
        name: "BymChn active",
        scope: "client",
        config: false,
        type: Boolean,
        default: true
    });

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

    isNewVersion = isNewerVersion(game.version, "10");
});

Hooks.on('getSceneControlButtons', (buttons) => {
    const isGM = game.user.isGM;
    if (isGM) {
        let group = buttons.find(b => b.name == 'sounds');
        const slider = isNewVersion ? "fa-duotone fa-sliders" : "fas fa-sliders-h";
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
                icon: slider,
                name: "speakersettings",
                title: game.i18n.localize("TTSC.ButtonTTSSpeakerSettings"),
                onClick: async () => {
                    voiceSelector();
                }
            }
        )
    }
});

Hooks.on('renderSceneControls', (app, html, data) => {
    const isGM = game.user.isGM;
    if (!isGM) {
        const lastMenu = html.find('ol.main-controls').children('*:last');
        const active = game.settings.get("BymChnConnector", "active") ? "active" : "";
        const slider = isNewVersion ? "fa-duotone fa-sliders" : "fas fa-sliders-h";
        lastMenu.after(
            `<li class="scene-control plonly speakersettings" title="${game.i18n.localize("TTSC.ButtonTTSSpeakerSettings")}" role="button"><i class="${slider}"></i></li>`
        )

        lastMenu.after(
            `<li class="scene-control plonly activateTTS toggle ${active}" title="${game.i18n.localize("TTSC.ButtonTTSOnOff")}" role="button"><i class="fas fa-comment-dots"></i></li>`
        )

        html.find('.scene-control.activateTTS.plonly')
            .click(async e => {
                if ($(e.currentTarget).hasClass("active")) {
                    $(e.currentTarget).removeClass("active");
                    await game.settings.set("BymChnConnector", "active", false);
                } else {
                    $(e.currentTarget).addClass("active");
                    await game.settings.set("BymChnConnector", "active", true);
                }
            })
        html.find('.scene-control.speakersettings.plonly')
            .click(async () => voiceSelector())
    }
});

Hooks.once("ready", async function () {
    let a = await game.user.getFlag("BymChnConnector", "select-voice");
    if (!a) {
        await defvoice()
    }

    //Version control at startup
    const b = game.user.getFlag("BymChnConnector", "announcements");
    if (!!b) {
        let lastversion = duplicate(b.version);
        const nowversion = (await game.modules.get("BymChnConnector")).version;
        if (compare(nowversion, lastversion) == 1) {
            // Automatic display of update announcements to be implemented (TBD)
            b.version = nowversion;
            game.user.setFlag("BymChnConnector", "announcements", b);
        }
    } else {
        game.user.setFlag("BymChnConnector", "announcements", { version: (await game.modules.get("BymChnConnector")).version });
    }

    game.settings.register("BymChnConnector", "voice-list", {
        name: "BymChn voice-list",
        scope: "client",
        config: false,
        type: Object,
        default: [
            { name: game.i18n.localize("TTSC.VoiceNone"), type: -1, num: "Voiceless" },
            { name: game.i18n.localize("TTSC.VoiceDefault"), type: 0, num: 0 },
            { name: game.i18n.localize("TTSC.VoiceWoman1"), type: 0, num: 1 },
            { name: game.i18n.localize("TTSC.VoiceWoman2"), type: 0, num: 2 },
            { name: game.i18n.localize("TTSC.VoiceMan1"), type: 0, num: 3 },
            { name: game.i18n.localize("TTSC.VoiceMan2"), type: 0, num: 4 },
            { name: game.i18n.localize("TTSC.VoiceNeutral"), type: 0, num: 5 },
            { name: game.i18n.localize("TTSC.VoiceRobot"), type: 0, num: 6 },
            { name: game.i18n.localize("TTSC.VoiceMachine1"), type: 0, num: 7 },
            { name: game.i18n.localize("TTSC.VoiceMachine2"), type: 0, num: 8 }
        ]
    });

    game.settings.register("BymChnConnector", "sapi5-list", {
        name: "BymChn sapi5-list",
        scope: "client",
        config: false,
        type: Object,
        default: [
            { name: game.i18n.localize("TTSC.VoiceSAPI5Default"), type: 1, num: 10001 }
        ],
        onChange: async (list) => {
            let selectVoice = await game.user.getFlag("BymChnConnector", "select-voice")
            let defvol = game.settings.get("BymChnConnector", "BymChnDefVolume")
            for (let i = (selectVoice.length - 1); i >= 0; i--) {
                if (selectVoice[i].vtype == 1) {
                    let find = false
                    for (let k = 0; k < list.length; k++) {
                        if (list[k].num == selectVoice[i].voice) find = true
                    }
                    if (!find) {
                        selectVoice[i].vtype = 0
                        selectVoice[i].volume = defvol
                    }
                }
            }
        }
    });

    let voiceL = await game.user.getFlag("BymChnConnector", "select-voice");

    //Update process of existing data due to renaming of translation files
    let announcements = await game.user.getFlag("BymChnConnector", "announcements");
    if (!announcements.nT) {
        announcements.nT = true;
        let num = voiceL.findIndex(i => i.type == 2);
        voiceL[num].name = game.i18n.localize("TTSC.VoiceNarrator");
        await game.user.setFlag("BymChnConnector", "announcements", announcements);
    }

    let theatre_set = voiceL.flatMap((i, j) => (i.name == game.i18n.localize("TTSC.VoiceNarrator") && i.type == 2) ? j : []);
    if (game.modules.get('theatre')?.active) {
        if (theatre_set.length == 0) {
            voiceL.unshift({ type: 2, name: game.i18n.localize("TTSC.VoiceNarrator"), id: "theater", voice: 0, vtype: 0 });
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    } else {
        if (theatre_set.length > 0) {
            theatre_set = theatre_set.reverse();
            for (let k = 0; k < theatre_set.length; k++) {
                voiceL.splice(theatre_set[k], 1);
            }
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    }

    let narrator_set = voiceL.flatMap((i, j) => ([game.i18n.localize("TTSC.VoiceNarrateNT"), game.i18n.localize("TTSC.VoiceDescNT")].includes(i.name) && i.type == 4) ? j : []);
    if (game.modules.get('narrator-tools')?.active) {
        if (narrator_set.length == 0) {
            voiceL.unshift(
                { type: 4, name: game.i18n.localize("TTSC.VoiceNarrateNT"), id: "narrate", voice: 0, vtype: 0 },
                { type: 4, name: game.i18n.localize("TTSC.VoiceDescNT"), id: "desc", voice: 0, vtype: 0 }
            );
            await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
        }
    } else {
        if (narrator_set.length > 0) {
            narrator_set = narrator_set.reverse();
            for (let k = 0; k < narrator_set.length; k++) {
                voiceL.splice(narrator_set[k], 1)
            }
        }
        await game.user.setFlag("BymChnConnector", "select-voice", voiceL);
    }

    game.socket.on('module.BymChnConnector', async (packet) => {
        const data = packet.data;
        const type = packet.type;
        const receiveUserId = packet.receiveUserId;
        const narT = packet.narratorT;
        const sendUserId = packet.sendUserId;
        if (type == "request") {
            let voice = 0;
            let active = await game.settings.get("BymChnConnector", "active");
            let volume = null;
            let vtype = 0;
            let list = await game.user.getFlag("BymChnConnector", "select-voice");
            let theatre = false;
            if (game.modules.get('theatre')?.active) if (Theatre.instance.speakingAs == Theatre.NARRATOR) theatre = true;
            let narrateNT = false;
            if (game.modules.get('narrator-tools')?.active) if (narT == "narration") narrateNT = true;
            let descNT = false;
            if (game.modules.get('narrator-tools')?.active) if (narT == "description") descNT = true;
            if (theatre) {
                let index = list.findIndex(k => k.type == 2 && k.id == 'theater');
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                }
            } else if (narrateNT) {
                let index = list.findIndex(k => k.type == 4 && k.id == 'narrate');
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                }
            } else if (descNT) {
                let index = list.findIndex(k => k.type == 4 && k.id == 'desc');
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                }
            } else if (data.speaker.actor) {
                let index = list.findIndex(i => i.type == 1 && i.id == data.speaker.actor);
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                } else {
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume
                    vtype = 0;
                }
            } else {
                let index = list.findIndex(j => j.type == 0 && j.id == sendUserId);
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                } else {
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume;
                    vtype = 0;
                }
            }
            if (active) {
                if ((volume > 1 || volume < 0) && (vtype == 0 || vtype == 1)) volume = -1;
                if (vtype == 0 || vtype == 1) {
                    let bouyomiChanClient = new BouyomiChanClient();
                    volume = volume * 300;
                    volume = Math.round(volume)
                    await bouyomiChanClient.talk(data.message, voice, volume);
                }
            }
        }
    });
});

class Sapi5ListData {
    static sapi5List() {
        return game.settings.get("BymChnConnector", "sapi5-list");
    }

    static sapi5DefaultList() {
        return game.settings.set("BymChnConnector", "sapi5-list", [
            { name: game.i18n.localize("TTSC.VoiceSAPI5Default"), type: 1, num: 10001 }
        ])
    }

    static deleteSapi5list(name, index, num) {
        let sapi5List = game.settings.get("BymChnConnector", "sapi5-list");
        if (sapi5List[index].name == name && sapi5List[index].num == num) {
            let del = sapi5List.splice(index, 1);
        }
        return game.settings.set("BymChnConnector", "sapi5-list", sapi5List)
    }

    static createSapi5List() {
        let sapi5List = game.settings.get("BymChnConnector", "sapi5-list");
        sapi5List.push({ name: "", type: 1, num: "" })
        return game.settings.set("BymChnConnector", "sapi5-list", sapi5List)
    }
}

class Sapi5ListSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize("TTSC.WindowSAPI5Settingstitle"),
            id: 'sapi5-settings',
            template: 'modules/BymChnConnector/templates/sapi5-settings.html',
            width: 550,
            height: 'auto',
            resizable: true,
            closeOnSubmit: false
        })
    }

    async getData() {
        let data = super.getData();
        data.sapi5List = Sapi5ListData.sapi5List();
        data.userid = game.user.id;
        return data
    }

    activateListeners(html) {
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
                buttons: {
                    delete: {
                        label: game.i18n.localize("TTSC.WindowDelete"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () => {
                            Sapi5ListData.deleteSapi5list(targetName, targetIndex, targetNum);
                            this.render();
                        }
                    },
                    cancel: {
                        label: game.i18n.localize("TTSC.WindowCancel"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => { }
                    }
                },
                default: 'cancel',
                close: () => { }
            });
            dlg.render(true);
        })
        html.find('button[name="reset"]').on("click", async (event) => {
            event.preventDefault();
            Sapi5ListData.sapi5DefaultList();
            this.close();
        })
    }

    async _updateObject(event, formData) {
        let sapi5List = Sapi5ListData.sapi5List();
        const data = foundry.utils.flattenObject(formData);
        let nameNone = false
        let numNone = false
        for (let i = 0; i < sapi5List.length; i++) {
            let name = data[`${i}${game.user.id}`];
            let num = data[`${i}${game.user.id}num`];
            if (!!name) {
                sapi5List[i].name = name;
            } else {
                nameNone = true;
            }
            if (!!num) {
                sapi5List[i].num = num;
            } else {
                numNone = true;
            }
        }
        if (nameNone || numNone) {
            const dlg = new Dialog({
                title: game.i18n.localize("TTSC.WindowNoNameNoIdtitle"),
                content: `<p>${game.i18n.localize("TTSC.WindowNoNameNoIdcontent")}</p>`,
                buttons: {
                    delete: {
                        label: game.i18n.localize("TTSC.WindowYes"),
                        icon: '<i class="fas fa-trash-alt"></i>',
                        callback: async () => {
                            for (let j = (sapi5List.length - 1); j >= 0; j--) {
                                if (!sapi5List[j].name || !sapi5List[j].num) {
                                    sapi5List.splice(j, 1)
                                }
                            }
                            await game.settings.set("BymChnConnector", "sapi5-list", sapi5List);
                            this.close();
                        }
                    },
                    cancel: {
                        label: game.i18n.localize("TTSC.WindowNo"),
                        icon: '<i class="fas fa-ban"></i>',
                        callback: () => { }
                    }
                },
                default: 'cancel',
                close: () => { }
            });
            dlg.render(true);
        } else {
            game.settings.set("BymChnConnector", "sapi5-list", sapi5List);
            this.close();
        }
    }
}

async function defvoice() {
    const users = game.users.contents;
    let def = [];
    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;

    if (game.modules.get('theatre')?.active) {
        def.push({ type: 2, name: game.i18n.localize("TTSC.VoiceNarrator"), id: "theater", voice: 0, volume: bymchndefVolume, vtype: 0 });
    }
    if (game.modules.get('narrator-tools')?.active) {
        def.push(
            { type: 4, name: game.i18n.localize("TTSC.VoiceNarrateNT"), id: "narrate", voice: 0, volume: bymchndefVolume, vtype: 0 },
            { type: 4, name: game.i18n.localize("TTSC.VoiceDescNT"), id: "desc", voice: 0, volume: bymchndefVolume, vtype: 0 }
        );
    }
    for (let i = 0; i < users.length; i++) {
        def.push({ type: 0, name: users[i].name, id: users[i].id, voice: 0, volume: bymchndefVolume, vtype: 0 })
    }
    const actors = game.actors.contents;
    for (let j = 0; j < actors.length; j++) {
        def.push({ type: 1, name: actors[j].name, id: actors[j].id, voice: 0, volume: bymchndefVolume, vtype: 0 })
    }
    await game.user.setFlag("BymChnConnector", "select-voice", def);
}

async function voiceSelector() {
    const users = game.users.contents;
    let send;
    let def = [];
    let voiceList = await game.settings.get("BymChnConnector", "voice-list");
    let sapi5List = await game.settings.get("BymChnConnector", "sapi5-list");
    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;

    let sendList = [...voiceList, ...sapi5List];
    if (game.modules.get('theatre')?.active) {
        def.push({ type: 2, name: game.i18n.localize("TTSC.VoiceNarrator"), id: "theater", voice: 0, volume: bymchndefVolume, vtype: 0 });
    }
    if (game.modules.get('narrator-tools')?.active) {
        def.push(
            { type: 4, name: game.i18n.localize("TTSC.VoiceNarrateNT"), id: "narrate", voice: 0, volume: bymchndefVolume, vtype: 0 },
            { type: 4, name: game.i18n.localize("TTSC.VoiceDescNT"), id: "desc", voice: 0, volume: bymchndefVolume, vtype: 0 }
        );
    }
    for (let i = 0; i < users.length; i++) {
        def.push({ type: 0, name: users[i].name, id: users[i].id, voice: 0, volume: bymchndefVolume, vtype: 0 })
    }
    const actors = game.actors.contents;
    for (let j = 0; j < actors.length; j++) {
        def.push({ type: 1, name: actors[j].name, id: actors[j].id, voice: 0, volume: bymchndefVolume, vtype: 0 })
    }
    send = [...def];

    let flags;

    if (isNewVersion) { flags = game.user.flags } else { flags = game.user.data.flags }

    if (!flags["BymChnConnector"]) {
        await game.user.setFlag("BymChnConnector", "select-voice", send);
    } else {
        for (let k = 0; k < flags["BymChnConnector"]["select-voice"].length; k++) {
            let index = send.findIndex(a => (a.id == (flags["BymChnConnector"]["select-voice"][k].id) && (a.name == flags["BymChnConnector"]["select-voice"][k].name)) || ([2, 4].includes(flags["BymChnConnector"]["select-voice"][k].type) && a.id == flags["BymChnConnector"]["select-voice"][k].id));
            if (index >= 0) {
                send[index] = { ...flags["BymChnConnector"]["select-voice"][k] }
            }
        }
        await game.user.setFlag("BymChnConnector", "select-voice", send);
    }

    const html = await renderTemplate('modules/BymChnConnector/templates/VoiceSelectDialog.html', { users: flags["BymChnConnector"]["select-voice"], voiceList: sendList });
    const data = await new Promise(resolve => {
        const dlg = new Dialog({
            title: game.i18n.localize("TTSC.WindowSelectSpeakerVoicetitle"),
            content: html,
            buttons: {
                submit: {
                    label: game.i18n.localize("TTSC.WindowSave"),
                    icon: `<i class="far fa-save"></i>`,
                    callback: async (html) => {
                        formData = new FormData(html[0].querySelector('#select-voice'));
                        for (let l = 0; l < send.length; l++) {
                            let re = formData.get(send[l].id);
                            if (Number(re.split("&&")[0])) {
                                send[l].voice = Number(re.split("&&")[0]);
                            } else {
                                send[l].voice = re.split("&&")[0];
                            }
                            send[l].vtype = Number(re.split("&&")[1]);
                            let vo = formData.get(send[l].id + "volume");
                            send[l].volume = Number(vo)

                        }
                        await game.user.setFlag("BymChnConnector", "select-voice", send);
                        return resolve(true)
                    }
                },
                cancel: {
                    label: game.i18n.localize("TTSC.WindowCancel"),
                    icon: `<i class="fas fa-ban"></i>`,
                    callback: async () => {
                        return resolve(true)
                    }
                }
            },
            default: '',
            close: () => { return resolve(false) }
        }, {
            width: 660
        });
        dlg.render(true);
    });
}

//Support for Narrator-Tool's the Journal reading function
Hooks.on("createChatMessage", async (document, options, userId) => {
    if (game.modules.get('narrator-tools')?.active) {
        let active = await game.settings.get("BymChnConnector", "active");
        let voice = 0;
        let volume = null;
        let vtype = 0;
        if (document.flags['narrator-tools'] && active) {
            if (["description", "narration"].includes(document.flags['narrator-tools'].type)) {
                let list = await game.user.getFlag("BymChnConnector", "select-voice");
                if (document.flags['narrator-tools'].type == "description") {
                    let index = list.findIndex(k => k.type == 4 && k.id == 'desc');
                    if (index >= 0) {
                        voice = list[index].voice;
                        volume = list[index].volume;
                        vtype = list[index].vtype;
                    }
                } else if (document.flags['narrator-tools'].type == "narration") {
                    let index = list.findIndex(k => k.type == 4 && k.id == 'narrate');
                    if (index >= 0) {
                        voice = list[index].voice;
                        volume = list[index].volume;
                        vtype = list[index].vtype;
                    }
                }
                if ((volume > 1 || volume < 0) && (vtype == 0 || vtype == 1)) volume = -1;
                if (vtype == 0 || vtype == 1) {
                    let bouyomiChanClient = new BouyomiChanClient();
                    volume = volume * 300;
                    volume = Math.round(volume);
                    let text = "";
                    var textdata = htmlTokenizer("<div>" + document.content + "</div>");
                    for (let k = 0; k < textdata.length; k++) {
                        if (!textdata[k].match(/^\<(".*?"|'.*?'|[^'"])*?\>/)) {
                            if (!textdata[k].match(/、$|,$|。$|\.$/)) {
                                text += textdata[k]
                                text += "。"
                            } else {
                                text += textdata[k]
                            }
                        } else if (textdata[k].match(/(<br>|<br \/>)/gi)) {
                            text += '\n'
                        }
                    }
                    await bouyomiChanClient.talk(text, voice, volume);
                }
            }
        }
    }
})

Hooks.on("chatMessage", (chatLog, message, chatData) => {
    const doc = document;
    let parse = ChatLog.parse(message);
    //False to avoid unknown module conflicts as much as possible
    let skip = false;

    //Determination of Narrator-tools commands
    if (game.modules.get('narrator-tools')?.active) {
        skip = ["/desc", "/describe", "/description", "/narrate", "/narration"].includes(parse[1][0]);
    }

    switch (parse[0]) {
        case "roll": case "gmroll": case "blindroll": case "selfroll": case "publicroll": case "macro":
            skip = false;
            break;
        case "whisper": case "reply": case "gm": case "players": case "ic": case "emote": case "ooc": case "none":
            skip = true;
            break;
    }

    if (skip) {
        Hooks.once("preCreateChatMessage", async (document, data, options, userId) => {
            let text = "";
            let active = await game.settings.get("BymChnConnector", "active");
            let voice = 0;
            let volume = null;
            let vtype = 0;
            let list = await game.user.getFlag("BymChnConnector", "select-voice");
            let theatre = false;
            if (game.modules.get('theatre')?.active) if (Theatre.instance.speakingAs == Theatre.NARRATOR) theatre = true
            let narrateNT = false;
            if (game.modules.get('narrator-tools')?.active) if (document.flags["narrator-tools"]?.type == "narration") narrateNT = true;
            let descNT = false;
            if (game.modules.get('narrator-tools')?.active) if (document.flags["narrator-tools"]?.type == "description") descNT = true;
            let actorId = null;
            let userid;
            if (isNewVersion) userid = document.user.id; else userid = document.data.user;
            if (game.modules.get('theatre')?.active) actorId = (Theatre.instance.usersTyping[userid].theatreId)?.replace("theatre-", "");

            if (game.modules.get('speak-as')?.active) {
                let namelist = doc.getElementById('namelist');
                let checked = doc.getElementById("speakerSwitch").checked;
                if (!!namelist && !!checked) {
                    if (namelist.value != "userName") {
                        data.speaker.actor = namelist.value;
                        if (!actorId) actorId = namelist.value;
                    }
                }
            }
            if (actorId != "Narrator" && !!actorId) {
                let index = list.findIndex(i => i.type == 1 && i.id == actorId);
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                } else {
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume
                    vtype = 0;
                }
            } else if (theatre) {
                let index = list.findIndex(k => k.type == 2 && k.id == 'theater');
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                }
            } else if (narrateNT) {
                let index = list.findIndex(k => k.type == 4 && k.id == 'narrate');
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                }
            } else if (descNT) {
                let index = list.findIndex(k => k.type == 4 && k.id == 'desc');
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                }
            } else if (data.speaker) {
                let index = list.findIndex(i => i.type == 1 && i.id == data.speaker.actor);
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                } else {
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume
                    vtype = 0;
                }
            } else {
                let index = list.findIndex(j => j.type == 0 && j.id == userId);
                if (index >= 0) {
                    voice = list[index].voice;
                    volume = list[index].volume;
                    vtype = list[index].vtype;
                } else {
                    let bymchndefVolume = await game.settings.get("BymChnConnector", "BymChnDefVolume");
                    bymchndefVolume = Math.round((bymchndefVolume * 1000) / 300) / 1000;
                    if (bymchndefVolume != 0 && !bymchndefVolume) bymchndefVolume = -1;
                    voice = 0;
                    volume = bymchndefVolume;
                    vtype = 0;
                }
            }

            var textdata = htmlTokenizer("<div>" + data.content + "</div>");
            for (let k = 0; k < textdata.length; k++) {
                if (!textdata[k].match(/^\<(".*?"|'.*?'|[^'"])*?\>/)) {
                    if (!textdata[k].match(/、$|,$|。$|\.$/)) {
                        text += textdata[k]
                        text += "。"
                    } else {
                        text += textdata[k]
                    }
                } else if (textdata[k].match(/(<br>|<br \/>)/gi)) {
                    text += '\n'
                }
            }

            let speaker;
            if (isNewVersion) speaker = { ...document.speaker }; else speaker = { ...document.data.speaker }
            if (actorId != "Narrator" && !!actorId) speaker.actor = actorId
            let nT = narrateNT ? "narration" : descNT ? "description" : null;
            let packet = { data: { message: text, speaker: speaker }, type: "request", sendUserId: game.user.id, narratorT: nT }
            if (text != "") game.socket.emit('module.BymChnConnector', packet);

            if (active) {
                if ((volume > 1 || volume < 0) && (vtype == 0 || vtype == 1)) volume = -1;
                if (vtype == 0 || vtype == 1) {
                    let bouyomiChanClient = new BouyomiChanClient();
                    volume = volume * 300;
                    volume = Math.round(volume)
                    await bouyomiChanClient.talk(text, voice, volume);
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
function htmlTokenizer(html, option = {}) {
    const stack = [];

    let lastIndex = 0;
    const findTag = /<[!/A-Za-z][^\t\n\f\r />]*([\t\n\f\r /]+[^\t\n\f\r /][^\t\n\f\r /=]*([\t\n\f\r ]*=([\t\n\f\r ]*("[^"]*"|'[^']*'|[^\t\n\f\r >]*)))?)*[\t\n\f\r /]*>/g;
    for (let m; m = findTag.exec(html);) {
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
