package com.verto.modules.project.controller;

import com.verto.common.api.Result;
import com.verto.modules.project.dto.GitRepoCreateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Git仓库管理", description = "Git仓库创建与权限校验接口")
@RestController
@RequestMapping("/project/git")
@Slf4j
public class GitController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Operation(summary = "创建Git仓库（当前支持GitHub）")
    @PostMapping("/repo/create")
    public Result<Map<String, Object>> createRepo(@RequestBody GitRepoCreateRequest req) {
        try {
            if (req.getGitUrl() == null || req.getGitUrl().trim().isEmpty()) {
                return Result.error("gitUrl不能为空");
            }
            URI uri = URI.create(req.getGitUrl());
            String host = uri.getHost();
            if (host == null) {
                // 可能是无协议的地址，做简单兜底
                String url = req.getGitUrl().replace("https://", "").replace("http://", "");
                int idx = url.indexOf('/');
                host = idx > 0 ? url.substring(0, idx) : url;
            }

            if (host.contains("github.com")) {
                return createGithubRepo(req);
            }

            return Result.error("暂不支持该Git提供商: " + host);
        } catch (Exception e) {
            log.error("创建Git仓库异常", e);
            return Result.error("创建Git仓库异常: " + e.getMessage());
        }
    }

    @Operation(summary = "校验Git权限（当前支持GitHub）")
    @GetMapping("/permission/check")
    public Result<Map<String, Object>> checkPermission(@RequestParam("gitUrl") String gitUrl,
                                                       @RequestParam(value = "token", required = false) String token) {
        try {
            URI uri = URI.create(gitUrl);
            String host = uri.getHost();
            if (host == null) {
                String url = gitUrl.replace("https://", "").replace("http://", "");
                int idx = url.indexOf('/');
                host = idx > 0 ? url.substring(0, idx) : url;
            }
            if (!host.contains("github.com")) {
                return Result.error("暂不支持该Git提供商: " + host);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");
            if (token != null && !token.trim().isEmpty()) {
                headers.set("Authorization", "Bearer " + token.trim());
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange("https://api.github.com/user", HttpMethod.GET, entity, Map.class);
            Map<String, Object> data = new HashMap<>();
            data.put("login", resp.getBody() != null ? resp.getBody().get("login") : null);
            data.put("ok", resp.getStatusCode().is2xxSuccessful());
            return Result.ok(data);
        } catch (HttpClientErrorException e) {
            return Result.error("权限校验失败: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("校验Git权限异常", e);
            return Result.error("校验Git权限异常: " + e.getMessage());
        }
    }

    @Operation(summary = "搜索当前用户可访问的Git仓库（当前支持GitHub）")
    @GetMapping("/repos")
    public Result<Map<String, Object>> listRepos(@RequestParam(value = "query", required = false) String query,
                                                @RequestParam(value = "token", required = false) String token) {
        try {
            // 若未提供 token，则返回空列表（避免 401 导致的后端错误信息不友好）
            if (token == null || token.trim().isEmpty()) {
                Map<String, Object> empty = new HashMap<>();
                empty.put("repos", new Object[0]);
                return Result.ok("未提供token，返回空列表", empty);
            }
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");
            if (token != null && !token.trim().isEmpty()) {
                headers.set("Authorization", "Bearer " + token.trim());
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // 获取当前用户可访问的仓库列表（第一页）
            ResponseEntity<Object[]> resp = restTemplate.exchange("https://api.github.com/user/repos", HttpMethod.GET, entity, Object[].class);
            Object[] repos = resp.getBody();
            Map<String, Object> data = new HashMap<>();
            if (repos == null) {
                data.put("repos", new Object[0]);
                return Result.ok(data);
            }
            // 简单过滤（包含关键字）
            java.util.List<Map<String, Object>> list = new java.util.ArrayList<>();
            for (Object o : repos) {
                if (!(o instanceof Map)) continue;
                Map<?, ?> m = (Map<?, ?>) o;
                String name = m.get("name") != null ? m.get("name").toString() : "";
                String cloneUrl = m.get("clone_url") != null ? m.get("clone_url").toString() : "";
                if (query == null || query.trim().isEmpty() || name.toLowerCase().contains(query.toLowerCase())) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", name);
                    item.put("clone_url", cloneUrl);
                    list.add(item);
                }
            }
            data.put("repos", list);
            return Result.ok(data);
        } catch (HttpClientErrorException e) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("repos", new Object[0]);
            return Result.ok("获取仓库列表失败: " + e.getStatusCode(), empty);
        } catch (Exception e) {
            log.error("获取仓库列表异常", e);
            Map<String, Object> empty = new HashMap<>();
            empty.put("repos", new Object[0]);
            return Result.ok("获取仓库列表异常: " + e.getMessage(), empty);
        }
    }

    @Operation(summary = "获取当前用户权限范围内的Git前缀（当前支持GitHub）")
    @GetMapping("/prefixes")
    public Result<Map<String, Object>> getPrefixes(@RequestParam(value = "token", required = false) String token) {
        try {
            // 若未提供 token，则返回空列表（避免 401 导致的后端错误信息不友好）
            if (token == null || token.trim().isEmpty()) {
                Map<String, Object> empty = new HashMap<>();
                empty.put("prefixes", new java.util.ArrayList<>());
                return Result.ok("未提供token，返回空列表", empty);
            }
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");
            if (token != null && !token.trim().isEmpty()) {
                headers.set("Authorization", "Bearer " + token.trim());
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // 获取用户信息
            ResponseEntity<Map> userResp = restTemplate.exchange("https://api.github.com/user", HttpMethod.GET, entity, Map.class);
            String login = userResp.getBody() != null && userResp.getBody().get("login") != null ? userResp.getBody().get("login").toString() : null;

            java.util.List<String> prefixes = new java.util.ArrayList<>();
            if (login != null) {
                prefixes.add("https://github.com/" + login);
            }
            // 获取用户所属组织
            try {
                ResponseEntity<Object[]> orgResp = restTemplate.exchange("https://api.github.com/user/orgs", HttpMethod.GET, entity, Object[].class);
                Object[] orgs = orgResp.getBody();
                if (orgs != null) {
                    for (Object o : orgs) {
                        if (o instanceof Map) {
                            Object loginObj = ((Map<?, ?>) o).get("login");
                            if (loginObj != null) {
                                prefixes.add("https://github.com/" + loginObj.toString());
                            }
                        }
                    }
                }
            } catch (HttpClientErrorException e) {
                log.warn("获取组织信息失败: {}", e.getMessage());
            }

            Map<String, Object> data = new HashMap<>();
            data.put("prefixes", prefixes);
            return Result.ok(data);
        } catch (HttpClientErrorException e) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("prefixes", new java.util.ArrayList<>());
            return Result.ok("获取Git前缀失败: " + e.getStatusCode(), empty);
        } catch (Exception e) {
            log.error("获取Git前缀异常", e);
            Map<String, Object> empty = new HashMap<>();
            empty.put("prefixes", new java.util.ArrayList<>());
            return Result.ok("获取Git前缀异常: " + e.getMessage(), empty);
        }
    }

    private Result<Map<String, Object>> createGithubRepo(GitRepoCreateRequest req) {
        try {
            String cleaned = req.getGitUrl()
                    .replace("https://github.com/", "")
                    .replace("http://github.com/", "")
                    .replace(".git", "");
            String[] parts = cleaned.split("/");
            if (parts.length < 2) {
                return Result.error("gitUrl格式不正确，需包含所有者和仓库名，如 https://github.com/{owner}/{repo}");
            }
            String owner = parts[0];
            String repoName = parts[1];

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");
            if (req.getToken() != null && !req.getToken().trim().isEmpty()) {
                headers.set("Authorization", "Bearer " + req.getToken().trim());
            }
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("name", repoName);
            boolean isPrivate = !"public".equalsIgnoreCase(req.getVisibility());
            body.put("private", isPrivate);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // 优先尝试在组织下创建
            String orgUrl = "https://api.github.com/orgs/" + owner + "/repos";
            try {
                ResponseEntity<Map> resp = restTemplate.exchange(orgUrl, HttpMethod.POST, entity, Map.class);
                if (resp.getStatusCode().is2xxSuccessful()) {
                    Map<String, Object> result = new HashMap<>();
                    Object cloneUrl = resp.getBody() != null ? resp.getBody().get("clone_url") : null;
                    result.put("repoUrl", cloneUrl != null ? cloneUrl.toString() : req.getGitUrl());
                    return Result.ok(result);
                }
            } catch (HttpClientErrorException e) {
                // 如果组织创建失败，尝试在当前用户下创建
                log.warn("组织创建失败，尝试用户下创建: {}", e.getMessage());
            }

            String userUrl = "https://api.github.com/user/repos";
            ResponseEntity<Map> resp = restTemplate.exchange(userUrl, HttpMethod.POST, entity, Map.class);
            if (resp.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> result = new HashMap<>();
                Object cloneUrl = resp.getBody() != null ? resp.getBody().get("clone_url") : null;
                result.put("repoUrl", cloneUrl != null ? cloneUrl.toString() : req.getGitUrl());
                return Result.ok(result);
            }

            return Result.error("创建GitHub仓库失败: " + resp.getStatusCode());
        } catch (HttpClientErrorException e) {
            return Result.error("创建GitHub仓库失败: " + e.getStatusCode() + " " + e.getMessage());
        } catch (Exception e) {
            log.error("创建GitHub仓库异常", e);
            return Result.error("创建GitHub仓库异常: " + e.getMessage());
        }
    }
}