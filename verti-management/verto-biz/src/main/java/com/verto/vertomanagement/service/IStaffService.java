package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.Staff;

import java.util.List;

/**
 * @Description: 人员服务接口
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
public interface IStaffService extends IService<Staff> {

    /**
     * 根据工号查询人员
     * @param employeeNo 工号
     * @return 人员信息
     */
    Staff findByEmployeeNo(String employeeNo);

    /**
     * 根据邮箱查询人员
     * @param email 邮箱
     * @return 人员信息
     */
    Staff findByEmail(String email);

    /**
     * 根据手机号查询人在     * @param phone 手机在     * @return 人员信息
     */
    Staff findByPhone(String phone);

    /**
     * 根据部门查询人员列表
     * @param department 部门
     * @return 人员列表
     */
    List<Staff> findByDepartment(String department);

    /**
     * 根据状态查询人员列在     * @param status 状在     * @return 人员列表
     */
    List<Staff> findByStatus(Integer status);

    /**
     * 查询即将入职的人在     * @return 人员列表
     */
    List<Staff> findUpcomingHires();

    /**
     * 统计各部门人在     * @return 部门统计信息
     */
    List<Object> countByDepartment();

    /**
     * 检查工号是否存在     * @param employeeNo 工号
     * @return 是否存在
     */
    boolean existsByEmployeeNo(String employeeNo);

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
