# DSH Desktop - GitHub Push & Build Script
# 使用方法: ./push-to-fork.ps1 <你的GitHub用户名>

param(
    [Parameter(Mandatory=$true)]
    [string]$GithubUsername
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot/..

Write-Output "╔══════════════════════════════════════════════════════╗"
Write-Output "║        DSH Desktop - 推送代码到 GitHub                ║"
Write-Output "╚══════════════════════════════════════════════════════╝"
Write-Output ""

# 1. 添加 fork remote
$forkUrl = "https://github.com/$GithubUsername/deepseek-harness.git"
Write-Output "1. 添加 fork remote: $forkUrl"
git remote add fork $forkUrl 2>$null
Write-Output "   ✓ 完成"
Write-Output ""

# 2. Push 到 fork
Write-Output "2. Push 到 fork..."
git push fork master
Write-Output "   ✓ 完成"
Write-Output ""

# 3. 打开 GitHub 页面
Write-Output "3. 打开 GitHub Actions 页面，手动触发构建:"
Write-Output "   https://github.com/$GithubUsername/deepseek-harness/actions"
Write-Output ""
Write-Output "   选择 'Build DSH Desktop' → 'Run workflow'"
Write-Output ""
Write-Output "4. 构建完成后，下载 artifact: DSH-Windows-x64"
Write-Output ""
Write-Output "完成!"
