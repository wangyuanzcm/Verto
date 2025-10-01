package com.verto.vertomanagement.security;

import com.verto.vertomanagement.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Description: JWT认证过滤器，用于验证JWT令牌并设置安全上下文
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * JWT过滤器核心逻辑
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // 从请求头中获取JWT令牌
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
                // 解析JWT获取用户信息
                Claims claims = jwtUtil.getClaimsFromToken(jwt);
                String username = claims.getSubject();
                String userId = claims.get("userId", String.class);
                
                // 获取用户权限
                @SuppressWarnings("unchecked")
                List<String> authorities = claims.get("authorities", List.class);
                List<SimpleGrantedAuthority> grantedAuthorities = authorities.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                
                // 创建认证对象
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(username, null, grantedAuthorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 设置到安全上下文在              
                  SecurityContextHolder.getContext().setAuthentication(authentication);
                
                // 将用户ID添加到请求属性中，方便后续使在              
                  request.setAttribute("currentUserId", userId);
                request.setAttribute("currentUsername", username);
            }
        } catch (Exception ex) {
            logger.error("无法设置用户认证信息", ex);
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求头中提取JWT令牌
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        // 优先读取标准 Authorization: Bearer <token>
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // 与 Jeecg-Boot 交互方式保持一致：回退读取 X-Access-Token 头部
        String token = request.getHeader("X-Access-Token");
        if (!StringUtils.hasText(token)) {
            // 兼容某些场景使用下划线命名（日志中可能出现 X_ACCESS_TOKEN）
            token = request.getHeader("X_ACCESS_TOKEN");
        }

        // 如仍未获取到，可选地从查询参数读取（用于开发调试），生产环境可移除此段
        if (!StringUtils.hasText(token)) {
            token = request.getParameter("token");
        }

        return StringUtils.hasText(token) ? token : null;
    }
}
