$ErrorActionPreference = "Stop"

$Protocol = "homepage-launch"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LauncherExe = Join-Path $ProjectDir "homepage_launcher.exe"
$Launcher = Join-Path $ProjectDir "homepage_launcher.py"
$Pythonw = "C:\Users\morganh\AppData\Local\Programs\Python\Python313\pythonw.exe"

if (Test-Path -LiteralPath $LauncherExe) {
  $Command = '"' + $LauncherExe + '" "%1"'
} else {
  if (-not (Test-Path -LiteralPath $Pythonw)) {
    $Pythonw = "C:\Users\morganh\AppData\Local\Programs\Python\Python313\python.exe"
  }

  if (-not (Test-Path -LiteralPath $Pythonw)) {
    throw "homepage_launcher.exe was not found, and Python was not found for the source fallback."
  }

  if (-not (Test-Path -LiteralPath $Launcher)) {
    throw "Launcher script was not found: $Launcher"
  }

  $Command = '"' + $Pythonw + '" "' + $Launcher + '" "%1"'
}

$ProtocolKey = "HKCU:\Software\Classes\$Protocol"
$CommandKey = Join-Path $ProtocolKey "shell\open\command"

New-Item -Path $ProtocolKey -Force | Out-Null
Set-Item -Path $ProtocolKey -Value "URL:HomePage Launcher"
New-ItemProperty -Path $ProtocolKey -Name "URL Protocol" -Value "" -PropertyType String -Force | Out-Null
New-Item -Path $CommandKey -Force | Out-Null
Set-Item -Path $CommandKey -Value $Command

Write-Host "Registered $Protocol for this Windows user."
Write-Host $Command
