package org.jeecg.modules.config.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.jeecg.modules.config.entity.ProjectConfig;
import org.jeecg.modules.config.mapper.ProjectConfigMapper;
import org.jeecg.modules.config.service.IProjectConfigService;
import org.springframework.stereotype.Service;

/**
 * 项目配置服务实现类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Service
public class ProjectConfigServiceImpl extends ServiceImpl<ProjectConfigMapper, ProjectConfig> implements IProjectConfigService {

}