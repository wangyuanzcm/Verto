@echo off
:: 环境检查脚本
chcp 65001 > nul
echo ========================================
echo           环境检查报告
echo ========================================
echo.

echo [1/4] 检查必要工具安装状态...
echo.

:: 检查Docker
echo 检查 Docker:
docker --version 2>nul && (
    echo   ✓ Docker 已安装
) || (
    echo   ✗ Docker 未安装或未在PATH中
)

:: 检查Docker Compose
echo 检查 Docker Compose:
docker-compose --version 2>nul && (
    echo   ✓ Docker Compose 已安装
) || (
    echo   ✗ Docker Compose 未安装或未在PATH中
)

:: 检查Maven
echo 检查 Maven:
mvn --version 2>nul && (
    echo   ✓ Maven 已安装
) || (
    echo   ✗ Maven 未安装或未在PATH中
)

:: 检查pnpm
echo 检查 pnpm:
pnpm --version 2>nul && (
    echo   ✓ pnpm 已安装
) || (
    echo   ✗ pnpm 未安装或未在PATH中
)

echo.
echo [2/4] 检查项目结构...
echo.

if exist "jeecg-boot" (
    echo   ✓ jeecg-boot 后端项目目录存在
) else (
    echo   ✗ jeecg-boot 后端项目目录不存在
)

if exist "jeecgboot-vue3" (
    echo   ✓ jeecgboot-vue3 前端项目目录存在
) else (
    echo   ✗ jeecgboot-vue3 前端项目目录不存在
)

if exist "docker-compose.yml" (
    echo   ✓ docker-compose.yml 配置文件存在
) else (
    echo   ✗ docker-compose.yml 配置文件不存在
)

echo.
echo [3/4] 检查hosts文件配置...
echo.

findstr /c:"127.0.0.1   jeecg-boot-system" "C:\Windows\System32\drivers\etc\hosts" >nul 2>&1 && (
    echo   ✓ jeecg-boot-system hosts条目已存在
) || (
    echo   ✗ jeecg-boot-system hosts条目不存在
)

findstr /c:"127.0.0.1   jeecg-boot-mysql" "C:\Windows\System32\drivers\etc\hosts" >nul 2>&1 && (
    echo   ✓ jeecg-boot-mysql hosts条目已存在
) || (
    echo   ✗ jeecg-boot-mysql hosts条目不存在
)

echo.
echo [4/4] 检查Docker服务状态...
echo.

docker info >nul 2>&1 && (
    echo   ✓ Docker 服务正在运行
) || (
    echo   ✗ Docker 服务未运行或无法连接
)

echo.
echo ========================================
echo           检查完成
echo ========================================
echo.
echo 如果所有项目都显示 ✓，则可以运行 start-docker-compose.bat 启动项目
echo 如果有项目显示 ✗，请先解决相应问题
echo.
pause