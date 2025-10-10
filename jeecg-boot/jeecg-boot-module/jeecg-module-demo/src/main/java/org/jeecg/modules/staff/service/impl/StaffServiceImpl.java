package org.jeecg.modules.staff.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.shiro.SecurityUtils;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.system.vo.LoginUser;
import org.jeecg.common.util.oConvertUtils;
import org.jeecg.modules.staff.entity.Staff;
import org.jeecg.modules.staff.mapper.StaffMapper;
import org.jeecg.modules.staff.service.IStaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.*;

/**
 * @Description: 人员管理服务实现类
 * @Author: jeecg-boot
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Service
public class StaffServiceImpl extends ServiceImpl<StaffMapper, Staff> implements IStaffService {

    @Autowired
    private StaffMapper staffMapper;

    /**
     * 分页查询人员列表
     * @param pageSize 页大小
     * @param pageNo 页码
     * @return 分页结果
     */
    @Override
    public IPage<Staff> queryListWithPermission(int pageSize, int pageNo) {
        LoginUser sysUser = (LoginUser) SecurityUtils.getSubject().getPrincipal();
        Page<Staff> page = new Page<>(pageNo, pageSize);
        QueryWrapper<Staff> queryWrapper = QueryGenerator.initQueryWrapper(new Staff(), null);
        return this.page(page, queryWrapper);
    }

    /**
     * 根据用户权限获取导出字段
     * @return 导出字段
     */
    @Override
    public String getExportFields() {
        LoginUser sysUser = (LoginUser) SecurityUtils.getSubject().getPrincipal();
        StringBuilder exportFields = new StringBuilder();
        Field[] fields = Staff.class.getDeclaredFields();
        for (Field field : fields) {
            if (!"serialVersionUID".equals(field.getName())) {
                if (exportFields.length() > 0) {
                    exportFields.append(",");
                }
                exportFields.append(field.getName());
            }
        }
        return exportFields.toString();
    }

    /**
     * 检查工号是否重复
     * @param employeeNo 工号
     * @param id 当前记录ID（编辑时排除自己）
     * @return true-不重复，false-重复
     */
    @Override
    public boolean checkEmployeeNo(String employeeNo, String id) {
        QueryWrapper<Staff> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("employee_no", employeeNo);
        if (oConvertUtils.isNotEmpty(id)) {
            queryWrapper.ne("id", id);
        }
        return this.count(queryWrapper) == 0;
    }

    /**
     * 检查邮箱是否重复
     * @param email 邮箱
     * @param id 当前记录ID（编辑时排除自己）
     * @return true-不重复，false-重复
     */
    @Override
    public boolean checkEmail(String email, String id) {
        QueryWrapper<Staff> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        if (oConvertUtils.isNotEmpty(id)) {
            queryWrapper.ne("id", id);
        }
        return this.count(queryWrapper) == 0;
    }

    /**
     * 获取技能统计
     * @return 技能统计数据
     */
    @Override
    public List<Map<String, Object>> getSkillsStats() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // 模拟技能统计数据
        Map<String, Object> javaStats = new HashMap<>();
        javaStats.put("skill", "Java");
        javaStats.put("count", 15);
        result.add(javaStats);
        
        Map<String, Object> pythonStats = new HashMap<>();
        pythonStats.put("skill", "Python");
        pythonStats.put("count", 12);
        result.add(pythonStats);
        
        Map<String, Object> jsStats = new HashMap<>();
        jsStats.put("skill", "JavaScript");
        jsStats.put("count", 18);
        result.add(jsStats);
        
        Map<String, Object> vueStats = new HashMap<>();
        vueStats.put("skill", "Vue.js");
        vueStats.put("count", 10);
        result.add(vueStats);
        
        return result;
    }

    /**
     * 获取部门统计
     * @return 部门统计数据
     */
    @Override
    public List<Map<String, Object>> getDepartmentStats() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // 模拟部门统计数据
        Map<String, Object> techStats = new HashMap<>();
        techStats.put("department", "技术部");
        techStats.put("count", 25);
        result.add(techStats);
        
        Map<String, Object> salesStats = new HashMap<>();
        salesStats.put("department", "销售部");
        salesStats.put("count", 15);
        result.add(salesStats);
        
        Map<String, Object> hrStats = new HashMap<>();
        hrStats.put("department", "人事部");
        hrStats.put("count", 8);
        result.add(hrStats);
        
        Map<String, Object> financeStats = new HashMap<>();
        financeStats.put("department", "财务部");
        financeStats.put("count", 6);
        result.add(financeStats);
        
        return result;
    }
}