# backup-db.ps1 - Sao lưu MySQL database cua SportNexus
# Chay thu cong:  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\backup-db.ps1
# Script doc thong tin ket noi tu server\.env nen KHONG chua mat khau, co the commit an toan.

$ErrorActionPreference = 'Stop'

# ==== CAU HINH ====
$BackupDir = 'D:\backup\db\SportNexus'   # Thu muc luu file backup
$KeepDays  = 30               # Xoa file backup cu hon bao nhieu ngay

$LogFile = Join-Path $BackupDir 'backup.log'

function Write-Log {
    param([string]$Message)
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" | Add-Content -Path $LogFile
}

try {
    # ==== DOC DATABASE_URL TU server\.env ====
    $ProjectRoot = Split-Path -Parent $PSScriptRoot
    $EnvFile = Join-Path $ProjectRoot 'server\.env'
    if (-not (Test-Path $EnvFile)) { throw "Khong tim thay $EnvFile" }

    $urlLine = Get-Content $EnvFile | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
    if (-not $urlLine) { throw 'Khong thay DATABASE_URL trong server\.env' }
    $url = ($urlLine -split '=', 2)[1].Trim().Trim('"').Trim("'")

    if ($url -notmatch '^mysql://([^:]+):([^@]*)@([^:/]+):?(\d+)?/([A-Za-z0-9_\-]+)') {
        throw 'DATABASE_URL khong dung dinh dang mysql://user:pass@host:port/dbname'
    }
    $DbUser = [uri]::UnescapeDataString($Matches[1])
    $DbPass = [uri]::UnescapeDataString($Matches[2])
    $DbHost = $Matches[3]
    $DbPort = if ($Matches[4]) { $Matches[4] } else { '3306' }
    $DbName = $Matches[5]

    # ==== TIM MYSQLDUMP.EXE (uu tien ban moi nhat) ====
    $DumpExe = $null
    foreach ($root in @('C:\laragon\bin\mysql', 'D:\laragon\bin\mysql')) {
        if (-not (Test-Path $root)) { continue }
        foreach ($d in (Get-ChildItem $root -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending)) {
            $p = Join-Path $d.FullName 'bin\mysqldump.exe'
            if (Test-Path $p) { $DumpExe = $p; break }
        }
        if ($DumpExe) { break }
    }
    if (-not $DumpExe) {
        foreach ($p in @(
            'C:\xampp\mysql\bin\mysqldump.exe',
            'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe',
            'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe'
        )) {
            if (Test-Path $p) { $DumpExe = $p; break }
        }
    }
    if (-not $DumpExe) { throw 'Khong tim thay mysqldump.exe tren may' }

    # ==== GHI FILE TAM CHUA MAT KHAU (tranh dua mat khau ra dong lenh) ====
    $Cnf = Join-Path $env:TEMP ("mysql_backup_" + [guid]::NewGuid().ToString('N') + ".cnf")
    @"
[client]
user=$DbUser
password="$DbPass"
host=$DbHost
port=$DbPort
"@ | Set-Content -Path $Cnf -Encoding ASCII

    # ==== DUMP ====
    $Stamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    $OutFile = Join-Path $BackupDir "${DbName}_$Stamp.sql"

    & $DumpExe --defaults-extra-file="$Cnf" --databases $DbName --single-transaction --routines --triggers --events --result-file="$OutFile"
    $exitCode = $LASTEXITCODE
    Remove-Item $Cnf -Force -ErrorAction SilentlyContinue

    if ($exitCode -ne 0) { throw "mysqldump that bai (exit code $exitCode)" }

    $file = Get-Item $OutFile
    if ($file.Length -lt 1KB) { throw "File backup qua nho ($($file.Length) bytes), kha nang that bai" }

    # ==== XOA FILE CU HON $KeepDays NGAY ====
    $cutoff = (Get-Date).AddDays(-$KeepDays)
    $oldFiles = @(Get-ChildItem $BackupDir -Filter '*.sql' | Where-Object { $_.LastWriteTime -lt $cutoff })
    $oldFiles | Remove-Item -Force

    $msg = "OK -> $($file.Name) ($([math]::Round($file.Length / 1MB, 2)) MB), xoa $($oldFiles.Count) file cu"
    Write-Log $msg
    Write-Host $msg
}
catch {
    Write-Log "LOI: $($_.Exception.Message)"
    Write-Host "LOI: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
