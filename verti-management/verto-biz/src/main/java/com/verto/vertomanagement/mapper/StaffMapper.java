package com.verto.vertomanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.verto.vertomanagement.entity.Staff;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 人员Mapper接口
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Mapper
public interface StaffMapper extends BaseMapper<Staff> {

    /**
     * 根据员工编号查询人员
     * 
     * @param employeeNo 员工编号
     * @return 人员信息
     */
    @Select("SELECT * FROM staff WHERE employee_no = #{employeeNo} AND deleted = 0")
    Staff findByEmployeeNo(@Param("employeeNo") String employeeNo);

    /**
     * 根据邮箱查询人员
     * 
     * @param email 邮箱
     * @return 人员信息
     */
    @Select("SELECT * FROM staff WHERE email = #{email} AND deleted = 0")
    Staff findByEmail(@Param("email") String email);

    /**
     * 根据手机号查询人员
     * 
     * @param phone 手机号
     * @return 人员信息
     */
    @Select("SELECT * FROM staff WHERE phone = #{phone} AND deleted = 0")
    Staff findByPhone(@Param("phone") String phone);

    /**
     * 根据部门查询人员列表
     * 
     * @param department 部门
     * @return 人员列表
     */
    @Select("SELECT * FROM staff WHERE department = #{department} AND deleted = 0 ORDER BY hire_date DESC")
    List<Staff> findByDepartment(@Param("department") String department);

    /**
     * 根据状态查询人员列表
     * 
     * @param status 状态
     * @return 人员列表
     */
    @Select("SELECT * FROM staff WHERE status = #{status} AND deleted = 0 ORDER BY hire_date DESC")
    List<Staff> findByStatus(@Param("status") Integer status);

    /**
     * 查询即将入职的人员列表
     * 
     * @return 人员列表
     */
    @Select("SELECT * FROM staff WHERE hire_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) " +
            "AND deleted = 0 ORDER BY hire_date")
    List<Staff> findUpcomingHires();

    /**
     * 按部门统计人员数量
     * 
     * @return 统计结果
     */
    @Select("SELECT department, COUNT(*) as count FROM staff WHERE deleted = 0 AND status = 1 " +
            "GROUP BY department ORDER BY count DESC")
    List<Object> countByDepartment();
}
