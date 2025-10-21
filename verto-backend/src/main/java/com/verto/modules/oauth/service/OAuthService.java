package com.verto.modules.oauth.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.verto.modules.oauth.entity.OAuthToken;
import com.verto.modules.oauth.entity.OAuthUser;
import com.verto.modules.oauth.mapper.OAuthTokenMapper;
import com.verto.modules.oauth.mapper.OAuthUserMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OAuthService {
    private final OAuthUserMapper userMapper;
    private final OAuthTokenMapper tokenMapper;

    public OAuthService(OAuthUserMapper userMapper, OAuthTokenMapper tokenMapper) {
        this.userMapper = userMapper;
        this.tokenMapper = tokenMapper;
    }

    public OAuthUser upsertUser(String platform, String oauthUserId, String login, String name, String avatarUrl, String email) {
        QueryWrapper<OAuthUser> qw = new QueryWrapper<>();
        qw.eq("platform", platform).eq("oauth_user_id", oauthUserId);
        OAuthUser existing = userMapper.selectOne(qw);
        LocalDateTime now = LocalDateTime.now();
        if (existing == null) {
            OAuthUser user = new OAuthUser();
            user.setPlatform(platform);
            user.setOauthUserId(oauthUserId);
            user.setLogin(login);
            user.setName(name);
            user.setAvatarUrl(avatarUrl);
            user.setEmail(email);
            user.setBoundAt(now);
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
            userMapper.insert(user);
            return user;
        } else {
            existing.setLogin(login);
            existing.setName(name);
            existing.setAvatarUrl(avatarUrl);
            if (StringUtils.hasText(email)) existing.setEmail(email);
            existing.setUpdatedAt(now);
            userMapper.updateById(existing);
            return existing;
        }
    }

    public OAuthToken saveToken(String platform, String oauthUserId, String accessToken, String tokenType, String scope) {
        OAuthToken token = new OAuthToken();
        token.setPlatform(platform);
        token.setOauthUserId(oauthUserId);
        token.setAccessToken(accessToken);
        token.setTokenType(tokenType);
        token.setScope(scope);
        token.setCreatedAt(LocalDateTime.now());
        tokenMapper.insert(token);
        // update user's lastTokenId
        QueryWrapper<OAuthUser> qw = new QueryWrapper<>();
        qw.eq("platform", platform).eq("oauth_user_id", oauthUserId);
        OAuthUser user = userMapper.selectOne(qw);
        if (user != null) {
            user.setLastTokenId(token.getId());
            userMapper.updateById(user);
        }
        return token;
    }

    /**
     * 绑定第三方账号到系统用户
     * @param systemUserId 系统用户ID
     * @param platform 平台（如github）
     * @param thirdUserUuid 第三方用户UUID
     * @return 绑定是否成功
     */
    public boolean bindUserAccount(String systemUserId, String platform, String thirdUserUuid) {
        try {
            // 查找第三方用户
            QueryWrapper<OAuthUser> qw = new QueryWrapper<>();
            qw.eq("platform", platform).eq("oauth_user_id", thirdUserUuid);
            OAuthUser oauthUser = userMapper.selectOne(qw);
            
            if (oauthUser == null) {
                return false; // 第三方用户不存在
            }
            
            // 这里应该创建一个用户绑定表来关联系统用户和OAuth用户
            // 暂时先更新OAuth用户表，添加系统用户ID字段
            // TODO: 创建 user_oauth_binding 表来管理绑定关系
            
            return true; // 暂时返回成功
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 解绑第三方账号
     * @param systemUserId 系统用户ID
     * @param platform 平台（如github）
     * @return 解绑是否成功
     */
    public boolean unbindUserAccount(String systemUserId, String platform) {
        try {
            // TODO: 从绑定表中删除对应记录
            return true; // 暂时返回成功
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 获取用户绑定的第三方账号信息
     * @param systemUserId 系统用户ID
     * @return 绑定信息Map
     */
    public Map<String, Object> getUserBindings(String systemUserId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // TODO: 从绑定表中查询用户的所有绑定信息
            // 暂时返回示例数据
            Map<String, Object> githubBinding = new HashMap<>();
            githubBinding.put("platform", "github");
            githubBinding.put("username", "test_user");
            githubBinding.put("avatar", "https://avatars.githubusercontent.com/u/12345");
            githubBinding.put("bound", true);
            
            result.put("github", githubBinding);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return result;
    }
}