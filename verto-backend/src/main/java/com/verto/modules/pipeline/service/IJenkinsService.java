package com.verto.modules.pipeline.service;

import com.verto.modules.pipeline.dto.PipelineCreateRequest;

import java.util.Map;

/** Jenkins 相关服务 */
public interface IJenkinsService {
    /**
     * 创建或更新 Jenkins Pipeline Job
     * @param request 参数
     * @return 结果信息，包含 jobUrl、action 等字段；失败时包含 error
     */
    Map<String, Object> createOrUpdatePipelineJob(PipelineCreateRequest request);
}