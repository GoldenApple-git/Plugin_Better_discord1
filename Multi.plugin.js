/**
 * @name Multi
 * @invite https://discord.gg/EWEzEfu
 */
/*@cc_on
@if (@_jscript)
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
    const config = { info: { name: "Multi", authors: [{ name: "Goldenapple", discord_id: "474842502055329802" }], version: "1.0.7", description: "Plein de choses" }, changelog: [{ title: "Nouveautés", items: ["Upgrade du menu settings"] }], main: "index.js" };

    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async(error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const { Logger, Patcher, DiscordModules, ReactComponents, DiscordSelectors } = Api;
            return class Multi extends Plugin {
                constructor() {
                    super();
                };

                setData(key, value) {
                    BdApi.setData(this.getName(), key, value);
                }
                getData(key) {
                    return BdApi.getData(this.getName(), key);
                }

                onStart() {
                    try {
                        this.Active = this.getData("Active");
                    } catch { this.Active = true };
                    try {
                        this.tokenstatue = this.getData("tokenstatue");
                    } catch { this.tokenstatue = false };
                    BdApi.showToast(config.info.name + " " + config.info.version + " s'est lancer.");
                    require("request").get("https://raw.githubusercontent.com/GoldenApple-git/Plugin_Better_discord1/master/version.txt", async(error, response, body) => {
                        if (body !== config.info.version) {
                            this.DUpdatePlugin()
                        }
                    });
                };

                onStop() {
                    BdApi.showToast(config.info.name + " " + config.info.version + " s'est arrêter.");
                };


                getSettingsPanel() {
                    let settings = document.createElement("div");
                    let activeinfo = GUI.newHBox();
                    let tokens = GUI.newHBox();
                    let ButtonBox = GUI.newHBox();
                    settings.style.padding = "10px";

                    // timeout
                    settings.appendChild(GUI.newLabel("Taille de l'app : " + window.innerWidth + " x " + window.innerHeight));
                    let ActiveStatut = GUI.newLabel("Statut du plugin : activer = " + this.Active);
                    settings.appendChild(activeinfo)
                    activeinfo.appendChild(ActiveStatut)
                    settings.appendChild(tokens)
                    let tokenhide = GUI.newLabel("Token : " + "####################################################")
                    let tokennothide = GUI.newLabel("Token : " + Token.authToken)
                    if (this.tokenstatue == true) {
                        tokens.appendChild((tokennothide))
                    } else {
                        tokens.appendChild(tokenhide);
                    }
                    settings.appendChild(ButtonBox)
                    let ActiveButton = GUI.newButton("Active / Désactive");
                    ButtonBox.appendChild(ActiveButton);
                    ActiveButton.onclick = () => {
                        this.Active = !this.Active;
                        BdApi.showToast("Active est maintenant à : " + this.Active);
                        activeinfo.removeChild(activeinfo.childNodes[0]);
                        ActiveStatut = GUI.newLabel("Statut du plugin : activer = " + this.Active);
                        activeinfo.appendChild((ActiveStatut))
                    }
                    let tokenshow = GUI.newButton("Affiche / efface le token");
                    tokenshow.onclick = () => {
                        this.tokenstatue = !this.tokenstatue;
                        BdApi.showToast("tokenstatue est maintenant à : " + this.tokenstatue);
                        tokens.removeChild(tokens.childNodes[tokens.childNodes.length - 1]);
                        if (this.tokenstatue == true) {
                            tokens.appendChild((tokennothide))
                        } else {
                            tokens.appendChild(tokenhide);
                        }
                    }
                    ButtonBox.appendChild(tokenshow);
                    settings.appendChild(GUI.setExpand(document.createElement("div"), 2));

                    let save = GUI.newButton("Save");
                    GUI.setSuggested(save, true);
                    save.onclick = () => {
                        this.setData("Active", this.Active);
                        this.setData("tokenstatue", this.tokenstatue);
                        BdApi.showToast("Paramétres sauvegardés !", { type: "success" });
                    }
                    ButtonBox.appendChild(save);
                    return settings;
                }

                DUpdatePlugin() {
                    BdApi.showConfirmationModal("Version différente !", `Le plugin n'est pas à jour !.`, {
                        confirmText: "Le mettre à jour :",
                        cancelText: "Annuler",
                        onConfirm: () => {
                            require("request").get("https://raw.githubusercontent.com/GoldenApple-git/Plugin_Better_discord1/master/Multi.plugin.js", async(error, response, body) => {
                                if (error) return require("electron").shell.openExternal("https://raw.githubusercontent.com/GoldenApple-git/Plugin_Better_discord1/master/Multi.plugin.js");
                                await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "Multi.plugin.js"), body, r));
                            });
                        }
                    });
                }
            };
        };
        const Token = {
            authToken: Object.values(webpackJsonp.push([
                [], {
                    ['']: (_, e, r) => { e.cache = r.c }
                },
                [
                    ['']
                ]
            ]).cache).find(m => m.exports && m.exports.default && m.exports.default.getToken !== void 0).exports.default.getToken(),

            strerror: (req) => {
                if (req.status < 400)
                    return undefined;

                if (req.status == 401)
                    return "Invalid AuthToken";

                let json = JSON.parse(req.response);
                for (const s of["errors", "Multi", "text", "_errors", 0, "message"])
                    if ((json == undefined) || ((json = json[s]) == undefined))
                        return "Interne. Faites un rapport à [Goldenapple]#3619";

                return json;
            },

            request: () => {
                let req = new XMLHttpRequest();
                req.open("PATCH", "/api/v8/users/@me/settings", true);
                req.setRequestHeader("authorization", Status.authToken);
                req.setRequestHeader("content-type", "application/json");
                req.onload = () => {
                    let err = Status.strerror(req);
                    if (err != undefined)
                        BdApi.showToast(`Animated Status: Error: ${err}`, { type: "error" });
                };
                return req;
            },
        };

        // Used to easily style elements like the 'native' discord ones
        const GUI = {
            newInput: (text = "") => {
                let input = document.createElement("input");
                input.className = "inputDefault-_djjkz input-cIJ7To";
                input.innerText = text;
                return input;
            },

            newLabel: (text) => {
                let label = document.createElement("p");
                label.className = "p-18_1nd";
                label.innerText = text;
                return label;
            },

            newTextarea: () => {
                let textarea = document.createElement("textarea");
                textarea.className = "input-cIJ7To scrollbarGhostHairline-1mSOM1";
                textarea.style.resize = "vertical";
                textarea.rows = 4;
                return textarea;
            },

            newButton: (text, filled = true) => {
                let button = document.createElement("button");
                button.className = "button-38aScr colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN";
                if (filled) button.classList.add("lookFilled-1Gx00P");
                else button.classList.add("lookOutlined-3sRXeN");
                button.innerText = text;
                return button;
            },



            newHBox: () => {
                let hbox = document.createElement("div");
                hbox.style.display = "flex";
                hbox.style.flexDirection = "row";
                return hbox;
            },

            setExpand: (element, value) => {
                element.style.flexGrow = value;
                return element;
            },

            setSuggested: (element, value = true) => {
                if (value) element.classList.add("colorGreen-29iAKY");
                else element.classList.remove("mystyle");
                return element;
            },

            setDestructive: (element, value = true) => {
                if (value) element.classList.add("colorRed-1TFJan");
                else element.classList.remove("colorRed-1TFJan");
                return element;
            }
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/