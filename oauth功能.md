明白了，你问的是 **OAuth 标准流程**，即用户点击绑定 GitHub 后返回 `code`，Java 服务端如何处理它才能获取 token 并在后续接口调用中拥有 GitHub 权限。下面我给你整理一个完整流程：

---

## 1️⃣ OAuth 绑定流程概览

```
浏览器/前端
   |
   | 点击“绑定 GitHub”，跳转授权 URL
   v
GitHub 授权页
   |
   | 用户同意权限，GitHub 返回 code
   v
Java 服务端回调接口 (redirect_uri)
   |
   | 用 code + client_id + client_secret 交换 access_token
   v
服务端获得 access_token
   |
   | 存储 token 并关联系统用户
   v
后续调用 GitHub API 用 token 做操作
```

---

## 2️⃣ GitHub 授权 URL 示例

```text
https://github.com/login/oauth/authorize
?client_id=YOUR_CLIENT_ID
&redirect_uri=http://yourserver.com/oauth/github/callback
&scope=repo,workflow,admin:repo_hook,user:email,read:user
```

* `scope`：定义你需要的权限
* 用户点击后 GitHub 会跳转回你的 `redirect_uri`，并带上 `code`

---

## 3️⃣ Java 服务端回调处理

### 示例 Spring Boot Controller

```java
@RestController
@RequestMapping("/oauth/github")
public class GithubOauthController {

    @Value("${github.client.id}")
    private String clientId;

    @Value("${github.client.secret}")
    private String clientSecret;

    @GetMapping("/callback")
    public ResponseEntity<?> githubCallback(@RequestParam String code) {

        // 1. 用 code 交换 access_token
        String accessToken = exchangeCodeForToken(code);

        // 2. 获取用户信息（可选，但推荐）
        GithubUser user = getUserInfo(accessToken);

        // 3. 存储 token 及 scopes 到数据库，关联系统用户
        oauthService.saveToken(user.getId(), accessToken, getScopes(accessToken));

        return ResponseEntity.ok("绑定成功");
    }

    private String exchangeCodeForToken(String code) {
        String url = "https://github.com/login/oauth/access_token";

        Map<String, String> body = Map.of(
            "client_id", clientId,
            "client_secret", clientSecret,
            "code", code
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = new RestTemplate().postForEntity(url, entity, Map.class);

        return (String) response.getBody().get("access_token");
    }

    private GithubUser getUserInfo(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<?> entity = new HttpEntity<>(headers);
        ResponseEntity<GithubUser> resp = new RestTemplate().exchange(
                "https://api.github.com/user", HttpMethod.GET, entity, GithubUser.class
        );
        return resp.getBody();
    }

    private List<String> getScopes(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<String> resp = new RestTemplate().exchange(
                "https://api.github.com/user", HttpMethod.GET, entity, String.class
        );

        String scopesHeader = resp.getHeaders().getFirst("X-OAuth-Scopes");
        return scopesHeader != null ? Arrays.asList(scopesHeader.split(",")) : Collections.emptyList();
    }
}
```

---

## 4️⃣ 数据库设计建议

| 字段           | 说明               |
| ------------ | ---------------- |
| user_id      | 系统用户 ID          |
| access_token | GitHub 返回的 token |
| scopes       | 已授权权限列表          |
| created_at   | 存储时间             |
| updated_at   | 更新时间             |

* 后续调用 GitHub API 时，从数据库取 token
* 可验证 token 是否包含需要的 scope

---

## 5️⃣ 后续调用 GitHub API

```java
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth(accessTokenFromDB);
HttpEntity<?> entity = new HttpEntity<>(headers);

ResponseEntity<String> resp = new RestTemplate().exchange(
        "https://api.github.com/user/repos",
        HttpMethod.GET,
        entity,
        String.class
);
```

* 根据 token scopes 决定能访问的仓库/操作类型
* 如果缺少权限，可提示用户重新授权

---

## 6️⃣ 安全与最佳实践

1. **Token 加密存储**：避免数据库泄露风险
2. **定期校验 token**：防止用户撤销权限后调用失败
3. **Scope 检查**：调用前检查 token 是否包含所需权限
4. **支持解绑**：用户可以随时取消 GitHub 绑定
5. **Electron + 浏览器统一接口**：统一回调处理，token 存储在后端

---

💡 **总结**：

* 用户授权后返回 `code` → Java 服务端用 `code` 换 `access_token`
* 后端保存 token 和 scopes → 后续 API 调用用 token
* Token 授权范围由 `scope` 决定，可调用仓库、workflow、Webhook 等接口
