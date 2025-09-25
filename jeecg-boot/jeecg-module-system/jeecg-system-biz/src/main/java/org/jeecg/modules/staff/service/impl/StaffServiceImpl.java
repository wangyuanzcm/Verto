package org.jeecg.modules.staff.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.jeecg.modules.staff.entity.Staff;
import org.jeecg.modules.staff.mapper.StaffMapper;
import org.jeecg.modules.staff.service.IStaffService;
import org.springframework.stereotype.Service;

/**
 * 人员管理Service实现类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Service
public class StaffServiceImpl extends ServiceImpl<StaffMapper, Staff> implements IStaffService {

}