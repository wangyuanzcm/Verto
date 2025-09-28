package org.jeecg.modules.demo.staff.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.jeecg.common.system.base.mapper.JeecgBaseMapper;
import org.jeecg.modules.demo.staff.entity.Staff;

/**
 * @Description: 人员管理Mapper接口
 * @Author: jeecg-boot
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Mapper
public interface StaffMapper extends JeecgBaseMapper<Staff> {

}