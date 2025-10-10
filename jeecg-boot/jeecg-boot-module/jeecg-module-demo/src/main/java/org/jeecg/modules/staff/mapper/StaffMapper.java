package org.jeecg.modules.staff.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.jeecg.modules.staff.entity.Staff;

/**
 * @Description: 人员管理Mapper接口
 * @Author: jeecg-boot
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Mapper
public interface StaffMapper extends BaseMapper<Staff> {

}