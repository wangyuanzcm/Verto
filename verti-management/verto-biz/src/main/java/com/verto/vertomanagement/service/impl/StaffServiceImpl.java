package com.verto.vertomanagement.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.entity.Staff;
import com.verto.vertomanagement.mapper.StaffMapper;
import com.verto.vertomanagement.service.IStaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Description: 人员服务实现在 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Slf4j
@Service
@Transactional
public class StaffServiceImpl extends ServiceImpl<StaffMapper, Staff> implements IStaffService {

    @Autowired
    private StaffMapper staffMapper;

    @Override
    public Staff findByEmployeeNo(String employeeNo) {
        return staffMapper.findByEmployeeNo(employeeNo);
    }

    @Override
    public Staff findByEmail(String email) {
        return staffMapper.findByEmail(email);
    }

    @Override
    public Staff findByPhone(String phone) {
        return staffMapper.findByPhone(phone);
    }

    @Override
    public List<Staff> findByDepartment(String department) {
        return staffMapper.findByDepartment(department);
    }

    @Override
    public List<Staff> findByStatus(Integer status) {
        return staffMapper.findByStatus(status);
    }

    @Override
    public List<Staff> findUpcomingHires() {
        return staffMapper.findUpcomingHires();
    }

    @Override
    public List<Object> countByDepartment() {
        return staffMapper.countByDepartment();
    }

    @Override
    public boolean existsByEmployeeNo(String employeeNo) {
        return StrUtil.isNotBlank(employeeNo) && findByEmployeeNo(employeeNo) != null;
    }

    @Override
    public boolean existsByEmail(String email) {
        return StrUtil.isNotBlank(email) && findByEmail(email) != null;
    }

    @Override
    public boolean existsByPhone(String phone) {
        return StrUtil.isNotBlank(phone) && findByPhone(phone) != null;
    }

    @Override
    public boolean save(Staff entity) {
        // 保存前的业务逻辑处理
        if (entity != null) {
            // 检查工号是否重复
            if (StrUtil.isNotBlank(entity.getEmployeeNo()) && existsByEmployeeNo(entity.getEmployeeNo())) {
                throw new RuntimeException("工号已存在");
            }
            
            // 检查邮箱是否重复
            if (StrUtil.isNotBlank(entity.getEmail()) && existsByEmail(entity.getEmail())) {
                throw new RuntimeException("邮箱已存在");
            }
            
            // 检查手机号是否重复
            if (StrUtil.isNotBlank(entity.getPhone()) && existsByPhone(entity.getPhone())) {
                throw new RuntimeException("手机号已存在");
            }
            
            // 设置默认状态
            if (entity.getStatus() == null) {
                entity.setStatus(1); // 默认在职
            }
        }
        
        return super.save(entity);
    }

    @Override
    public boolean updateById(Staff entity) {
        if (entity != null && StrUtil.isNotBlank(entity.getId())) {
            Staff existStaff = getById(entity.getId());
            if (existStaff == null) {
                throw new RuntimeException("人员不存在");
            }
            
            // 检查工号是否重复（排除自己）
            if (StrUtil.isNotBlank(entity.getEmployeeNo()) && 
                !entity.getEmployeeNo().equals(existStaff.getEmployeeNo()) && 
                existsByEmployeeNo(entity.getEmployeeNo())) {
                throw new RuntimeException("工号已存在");
            }
            
            // 检查邮箱是否重复（排除自己）
            if (StrUtil.isNotBlank(entity.getEmail()) && 
                !entity.getEmail().equals(existStaff.getEmail()) && 
                existsByEmail(entity.getEmail())) {
                throw new RuntimeException("邮箱已存在");
            }
            
            // 检查手机号是否重复（排除自己）
            if (StrUtil.isNotBlank(entity.getPhone()) && 
                !entity.getPhone().equals(existStaff.getPhone()) && 
                existsByPhone(entity.getPhone())) {
                throw new RuntimeException("手机号已存在");
            }
        }
        
        return super.updateById(entity);
    }
}
