$ErrorActionPreference = "Continue"
$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
git config core.quotepath off

$branches = git branch -r | Where-Object { $_ -notmatch 'HEAD' -and $_ -notmatch '/develop$' -and $_ -notmatch '/main$' } | ForEach-Object { $_.Trim() }

foreach ($branch in $branches) {
    Write-Output "=> Merging $branch ..."
    $mergeOutput = git merge --no-edit $branch 2>&1
    if ($LASTEXITCODE -ne 0 -or $mergeOutput -match "CONFLICT" -or $mergeOutput -match "Automatic merge failed") {
        Write-Output "CONFLICT detected in $branch. Stopping."
        exit 1
    } else {
        Write-Output "Merged $branch successfully."
    }
}
Write-Output "ALL BRANCHES MERGED SUCCESSFULLY."
