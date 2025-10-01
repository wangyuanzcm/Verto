package com.verto.vertomanagement.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.dto.LoginDto;
import com.verto.vertomanagement.dto.RegisterDto;
import com.verto.vertomanagement.entity.User;
import com.verto.vertomanagement.mapper.UserMapper;
import com.verto.vertomanagement.service.IUserService;
import com.verto.vertomanagement.util.CaptchaUtil;
import com.verto.vertomanagement.util.JwtUtil;
import com.verto.vertomanagement.vo.LoginVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @Description: 用户服务实现在 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Slf4j
@Service
@Transactional
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CaptchaUtil captchaUtil;

    @Override
    public LoginVo login(LoginDto loginDto) {
        // 验证验证在
        if (StrUtil.isNotBlank(loginDto.getCaptchaKey()) &&
                !captchaUtil.verifyCaptcha(loginDto.getCaptchaKey(), loginDto.getCaptcha())) {
            throw new RuntimeException("验证码错在");
        }

        // 查询用户
        User user = findByUsername(loginDto.getUsername());
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 验证密码
        if (!BCrypt.checkpw(loginDto.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 检查用户状在
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new RuntimeException("账户已被冻结");
        }

        // 生成JWT令牌
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        // 查询用户角色和权在
        List<String> roles = userMapper.findRolesByUserId(user.getId());
        List<String> permissions = userMapper.findPermissionsByUserId(user.getId());

        // 构建返回结果
        LoginVo loginVo = new LoginVo();
        loginVo.setToken(token);

        LoginVo.UserInfo userInfo = new LoginVo.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setRealname(user.getRealname());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhone());
        userInfo.setSex(user.getSex());
        userInfo.setStatus(user.getStatus());
        userInfo.setWorkNo(user.getWorkNo());
        userInfo.setPost(user.getPost());
        userInfo.setRoles(roles);
        userInfo.setPermissions(permissions);

        loginVo.setUserInfo(userInfo);

        log.info("用户登录成功: {}", user.getUsername());
        return loginVo;
    }

    @Override
    public boolean register(RegisterDto registerDto) {
        // 验证密码确认
        if (!registerDto.getPassword().equals(registerDto.getConfirmPassword())) {
            throw new RuntimeException("两次输入的密码不一在");
        }

        // 验证验证在
        if (StrUtil.isNotBlank(registerDto.getCaptchaKey()) &&
                !captchaUtil.verifyCaptcha(registerDto.getCaptchaKey(), registerDto.getCaptcha())) {
            throw new RuntimeException("验证码错在");
        }

        // 检查用户名是否存在
        if (existsByUsername(registerDto.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否存在
        if (StrUtil.isNotBlank(registerDto.getEmail()) && existsByEmail(registerDto.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        // 检查手机号是否存在
        if (StrUtil.isNotBlank(registerDto.getPhone()) && existsByPhone(registerDto.getPhone())) {
            throw new RuntimeException("手机号已被注在");
        }

        // 创建用户
        User user = new User();
        user.setUsername(registerDto.getUsername());
        user.setPassword(BCrypt.hashpw(registerDto.getPassword(), BCrypt.gensalt()));
        user.setRealname(registerDto.getRealname());
        user.setEmail(registerDto.getEmail());
        user.setPhone(registerDto.getPhone());
        user.setStatus(1); // 正常状在
        user.setDeleted(0); // 未删在
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

        boolean result = save(user);
        if (result) {
            log.info("用户注册成功: {}", user.getUsername());
        }
        return result;
    }

    @Override
    public User findByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public User findByPhone(String phone) {
        return userMapper.findByPhone(phone);
    }

    @Override
    public boolean existsByUsername(String username) {
        return findByUsername(username) != null;
    }

    @Override
    public boolean existsByEmail(String email) {
        return StrUtil.isNotBlank(email) && findByEmail(email) != null;
    }

    @Override
    public boolean existsByPhone(String phone) {
        return StrUtil.isNotBlank(phone) && findByPhone(phone) != null;
    }
}
