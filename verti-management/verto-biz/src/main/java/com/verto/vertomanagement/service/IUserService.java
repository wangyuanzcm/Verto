package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.dto.LoginDto;
import com.verto.vertomanagement.dto.RegisterDto;
import com.verto.vertomanagement.entity.User;
import com.verto.vertomanagement.vo.LoginVo;

/**
 * @Description: 用户服务接口
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
public interface IUserService extends IService<User> {

    /**
     * 用户登录
     * @param loginDto 登录参数
     * @return 登录结果
     */
    LoginVo login(LoginDto loginDto);

    /**
     * 用户注册
     * @param registerDto 注册参数
     * @return 注册结果
     */
    boolean register(RegisterDto registerDto);

    /**
     * 根据用户名查询用在     * @param username 用户在     * @return 用户信息
     */
    User findByUsername(String username);

    /**
     * 根据邮箱查询用户
     * @param email 邮箱
     * @return 用户信息
     */
    User findByEmail(String email);

    /**
     * 根据手机号查询用在     * @param phone 手机在     * @return 用户信息
     */
    User findByPhone(String phone);

    /**
     * 检查用户名是否存在
     * @param username 用户在     * @return 是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在     * @param email 邮箱
     * @return 是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 检查手机号是否存在
     * @param phone 手机在     * @return 是否存在
     */
    boolean existsByPhone(String phone);
}
