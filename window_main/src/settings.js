const fullSaveSetting = () =>{
    const InputPath = document.getElementById("input-full-save-path");
    const InputEnable = document.getElementById("input-full-save-switch").checked;

    postRequest("/usersettings", new UserSettingsContainer(InputPath.value, InputEnable).convertToLiteral(), (data) => {
        getUserSettings();
        Notice.append(data.status_str)
    });
}

const getUserSettings = () => {
    postRequest("/getusersettings", "", (data) => {
        const InputPath = document.getElementById("input-full-save-path");
        const InputEnable = document.getElementById("input-full-save-switch");
        InputPath.value = data.savepath;
        InputEnable.checked = data.save_enabled;
    });
}