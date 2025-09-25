package org.jeecg.modules.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.jeecg.modules.project.entity.Project;
import org.jeecg.modules.project.mapper.ProjectMapper;
import org.jeecg.modules.project.service.IProjectService;
import org.springframework.stereotype.Service;

/**
 * 项目管理服务实现类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements IProjectService {

}