package com.verto.vertomanagement.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.dto.LoginDto;
import com.verto.vertomanagement.dto.RegisterDto;
import com.verto.vertomanagement.entity.User;
import com.verto.vertomanagement.mapper.UserMapper;
import com.verto.vertomanagement.service.IUserService;
import com.verto.vertomanagement.vo.LoginVo;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 临时基础实现，用于保障基础框架能够启动。
 * 注意：该实现仅提供空/默认返回，后续请替换为正式的 UserServiceImpl。
 */
@Service
@Primary
@Transactional(rollbackFor = Exception.class)
public class BasicUserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    @Override
    public LoginVo login(LoginDto loginDto) {
        // 临时返回空，避免启动失败；后续请替换为真实实现
        return null;
    }

    @Override
    public boolean register(RegisterDto registerDto) {
        // 临时返回 false；后续请替换为真实实现
        return false;
    }

    @Override
    public User findByUsername(String username) {
        return null;
    }

    @Override
    public User findByEmail(String email) {
        return null;
    }

    @Override
    public User findByPhone(String phone) {
        return null;
    }

    @Override
    public boolean existsByUsername(String username) {
        return false;
    }

    @Override
    public boolean existsByEmail(String email) {
        return false;
    }

    @Override
    public boolean existsByPhone(String phone) {
        return false;
    }
}