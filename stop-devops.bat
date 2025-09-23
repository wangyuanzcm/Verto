@echo off
REM DevOps 环境停止脚本 (Windows)
REM 用于停止Jenkins和GitLab服务

echo ========================================
echo    Verto DevOps 环境停止脚本
echo ========================================
echo.

echo 停止DevOps服务...
docker compose -f docker-compose-devops.yml down

if %errorlevel% equ 0 (
    echo.
    echo [成功] DevOps服务已停止
    echo.
    echo 如需完全清理（包括数据卷），请运行:
    echo docker compose -f docker-compose-devops.yml down -v
    echo.
    echo 注意: 使用 -v 参数会删除所有数据，请谨慎操作！
    echo.
) else (
    echo [错误] 停止服务时出现错误
)

pause