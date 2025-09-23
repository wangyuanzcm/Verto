@echo off
REM DevOps 环境状态检查脚本 (Windows)
REM 用于检查Jenkins和GitLab服务状态

echo ========================================
echo    Verto DevOps 环境状态检查
echo ========================================
echo.

echo 检查Docker服务状态...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker未运行
    goto :end
)
echo [成功] Docker服务正常

echo.
echo 检查DevOps容器状态...
docker compose -f docker-compose-devops.yml ps

echo.
echo 检查服务健康状态...
echo.

REM 检查GitLab
echo 检查GitLab (http://localhost:8080)...
curl -s -o nul -w "GitLab HTTP状态: %%{http_code}\n" http://localhost:8080 2>nul
if %errorlevel% neq 0 (
    echo GitLab: 无法连接
) else (
    echo GitLab: 可访问
)

REM 检查Jenkins
echo 检查Jenkins (http://localhost:8081)...
curl -s -o nul -w "Jenkins HTTP状态: %%{http_code}\n" http://localhost:8081 2>nul
if %errorlevel% neq 0 (
    echo Jenkins: 无法连接
) else (
    echo Jenkins: 可访问
)

echo.
echo 查看最近的日志 (最后20行):
echo ----------------------------------------
echo GitLab日志:
docker compose -f docker-compose-devops.yml logs --tail=10 gitlab 2>nul

echo.
echo Jenkins日志:
docker compose -f docker-compose-devops.yml logs --tail=10 jenkins 2>nul

:end
echo.
echo 如需查看完整日志，请运行:
echo docker compose -f docker-compose-devops.yml logs -f [服务名]
echo.
pause