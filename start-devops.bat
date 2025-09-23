@echo off
REM DevOps 环境启动脚本 (Windows)
REM 用于启动Jenkins和GitLab服务

echo ========================================
echo    Verto DevOps 环境启动脚本
echo ========================================
echo.

REM 检查Docker是否运行
echo 检查Docker服务状态...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker未运行或未安装，请先启动Docker Desktop
    pause
    exit /b 1
)
echo [成功] Docker服务正常运行

REM 检查Docker Compose是否可用
echo 检查Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker Compose不可用
    pause
    exit /b 1
)
echo [成功] Docker Compose可用

REM 创建必要的目录
echo 创建数据目录...
if not exist "jenkins_home" mkdir jenkins_home
if not exist "gitlab\config" mkdir gitlab\config
if not exist "gitlab\logs" mkdir gitlab\logs
if not exist "gitlab\data" mkdir gitlab\data

REM 设置权限（Windows下可能不需要，但保留以防万一）
echo 设置目录权限...
icacls jenkins_home /grant Everyone:F /T >nul 2>&1
icacls gitlab /grant Everyone:F /T >nul 2>&1

echo.
echo 启动DevOps服务...
echo 这可能需要几分钟时间，请耐心等待...
echo.

REM 启动服务
docker compose -f docker-compose-devops.yml --env-file .env.devops up -d

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    DevOps 服务启动成功！
    echo ========================================
    echo.
    echo GitLab:
    echo   - Web界面: http://localhost:8800
    echo   - SSH端口: 8802
    echo   - 默认用户: root
    echo   - 默认密码: gitlab123456
    echo.
    echo Jenkins:
    echo   - Web界面: http://localhost:8803
    echo   - 默认用户: admin
    echo   - 默认密码: admin123
    echo.
    echo 注意事项:
    echo   - GitLab首次启动需要5-10分钟初始化
    echo   - Jenkins首次启动需要2-3分钟安装插件
    echo   - 请等待服务完全启动后再访问Web界面
    echo.
    echo 查看服务状态: docker compose -f docker-compose-devops.yml ps
    echo 查看服务日志: docker compose -f docker-compose-devops.yml logs -f [服务名]
    echo 停止服务: stop-devops.bat
    echo.
) else (
    echo [错误] 服务启动失败，请检查错误信息
    pause
    exit /b 1
)

pause