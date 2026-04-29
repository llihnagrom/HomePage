$ErrorActionPreference = "Stop"

$Protocol = "homepage-launch"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Launcher = Join-Path $ProjectDir "homepage_launcher.py"
$Pythonw = "C:\Users\morganh\AppData\Local\Programs\Python\Python313\pythonw.exe"

if (-not (Test-Path -LiteralPath $Pythonw)) {
  $Pythonw = "C:\Users\morganh\AppData\Local\Programs\Python\Python313\python.exe"
}

if (-not (Test-Path -LiteralPath $Pythonw)) {
  throw "Python was not found at the expected path."
}

if (-not (Test-Path -LiteralPath $Launcher)) {
  throw "Launcher script was not found: $Launcher"
}

$ProtocolKey = "HKCU:\Software\Classes\$Protocol"
$CommandKey = Join-Path $ProtocolKey "shell\open\command"
$Command = '"' + $Pythonw + '" "' + $Launcher + '" "%1"'

New-Item -Path $ProtocolKey -Force | Out-Null
Set-Item -Path $ProtocolKey -Value "URL:HomePage Launcher"
New-ItemProperty -Path $ProtocolKey -Name "URL Protocol" -Value "" -PropertyType String -Force | Out-Null
New-Item -Path $CommandKey -Force | Out-Null
Set-Item -Path $CommandKey -Value $Command

Write-Host "Registered $Protocol for this Windows user."
Write-Host $Command
