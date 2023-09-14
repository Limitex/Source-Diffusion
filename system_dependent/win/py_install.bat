@echo off
setlocal

set APP_PATH=%~1
set APP_DATA_PATH=%~2

set RUNTIME_URI=https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170
set PYTHON_URI=https://www.python.org/ftp/python/3.10.8/python-3.10.8-embed-amd64.zip
set PYTHIN_PIP_URI=https://bootstrap.pypa.io/get-pip.py

set MVR_HKLM86=HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*
set MVR_HKLM64=HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*
set MVR_HKCU=HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*

echo Checking Microsoft Visual C++ Runtime...
set /a count = 0
for /f "usebackq delims=" %%A in (`powershell -Command "Get-ItemProperty '%MVR_HKLM86%', '%MVR_HKLM64%', '%MVR_HKCU%' | Select-Object DisplayName | Where-Object { $_.DisplayName -like 'Microsoft Visual C++*' }"`) do (
    echo %%A | findstr "Debug Minimum Additional Redistributable" > nul
    if not errorlevel 1 set /a count += 1
)
if %count% equ 0 (
    echo Microsoft Visual C++ Runtime is not found.
    echo Please install Microsoft Visual C++ Runtime as it is required to run this program.
    start %RUNTIME_URI%
    exit 1
) else (
    echo Microsoft Visual C++ Runtime is found.
)

echo Initializing...
if exist "%APP_DATA_PATH%\python" rd /s /q "%APP_DATA_PATH%\python"
if exist "%APP_DATA_PATH%\tmp" rd /s /q "%APP_DATA_PATH%\tmp"
mkdir "%APP_DATA_PATH%\tmp"

echo Installing Python...
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%PYTHON_URI%','%APP_DATA_PATH%\tmp\python.zip')"
powershell Expand-Archive -Path "%APP_DATA_PATH%\tmp\python.zip" -DestinationPath "%APP_DATA_PATH%\python" > nul

echo Preparing for pip tool...
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%PYTHIN_PIP_URI%','%APP_DATA_PATH%\tmp\get-pip.py')"
"%APP_DATA_PATH%\python\python.exe" "%APP_DATA_PATH%\tmp\get-pip.py" --no-warn-script-location
powershell -Command "[System.IO.File]::WriteAllLines(('%APP_DATA_PATH%\tmp\replaced'), @((gc '%APP_DATA_PATH%\python\python310._pth').Replace('#import site', 'import site')), (New-Object 'System.Text.UTF8Encoding' -ArgumentList @($false)))" > nul
copy /y "%APP_DATA_PATH%\tmp\replaced" "%APP_DATA_PATH%\python\python310._pth" > nul

echo Checking and installing modules...
"%APP_DATA_PATH%\python\Scripts\pip.exe" install -r "%APP_PATH%\py_src\requirements.txt" --no-warn-script-location --no-cache

rd /s /q "%APP_DATA_PATH%\tmp"

echo Installation complete!
endlocal
exit 0