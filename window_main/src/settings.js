const fullSaveSetting = () =>{
    const InputPath = document.getElementById("input-full-save-path");
    const InputEnable = document.getElementById("input-full-save-switch").checked;

    postRequest("/usersettings", new UserSettingsContainer(InputPath.value).convertToLiteral(), (data) => {
        console.log(data)
    });
}