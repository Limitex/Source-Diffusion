@echo off
setlocal

set APP_PATH=%~1
set APP_DATA_PATH=%~2

set RUNTIME_URI=https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170

set MVR_HKLM86=HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*
set MVR_HKLM64=HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*
set MVR_HKCU=HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*

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
)

"%APP_DATA_PATH%\python\python.exe" --version > nul 2>&1
if errorlevel 1 exit 1

: TODO : Check modlues

endlocal
exit 0