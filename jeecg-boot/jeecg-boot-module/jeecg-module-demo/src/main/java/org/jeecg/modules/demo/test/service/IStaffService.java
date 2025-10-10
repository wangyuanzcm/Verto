package org.jeecg.modules.demo.test.service;

import org.jeecg.common.system.base.service.JeecgService;
import org.jeecg.modules.demo.test.entity.Staff;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.util.List;
import java.util.Map;

/**
 * @Description: 人员管理服务接口
 * @Author: jeecg-boot
 * @Date: 2024-01-28
 * @Version: V1.0
 */
public interface IStaffService extends JeecgService<Staff> {

    /**
     * 分页查询人员列表
     * @param pageSize 页大小
     * @param pageNo 页码
     * @return 分页结果
     */
    IPage<Staff> queryListWithPermission(int pageSize, int pageNo);

    /**
     * 根据用户权限获取导出字段
     * @return 导出字段
     */
    String getExportFields();

    /**
     * 检查工号是否重复
     * @param employeeNo 工号
     * @param id 当前记录ID（编辑时排除自己）
     * @return true-不重复，false-重复
     */
    boolean checkEmployeeNo(String employeeNo, String id);

    /**
     * 检查邮箱是否重复
     * @param email 邮箱
     * @param id 当前记录ID（编辑时排除自己）
     * @return true-不重复，false-重复
     */
    boolean checkEmail(String email, String id);

    /**
     * 获取技能统计
     * @return 技能统计数据
     */
    List<Map<String, Object>> getSkillsStats();

    /**
     * 获取部门统计
     * @return 部门统计数据
     */
    List<Map<String, Object>> getDepartmentStats();
}