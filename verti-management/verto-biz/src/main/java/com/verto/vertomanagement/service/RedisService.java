package com.verto.vertomanagement.service;

import com.alibaba.fastjson.JSONArray;
import com.verto.vertomanagement.domain.RedisInfo;
import com.verto.vertomanagement.exception.RedisConnectException;

import java.util.List;
import java.util.Map;

/**
 * @Description: Redis信息监控服务接口
 * 提供Redis服务器监控相关的业务逻辑接口定义
 * @author: Verto Team
 */
public interface RedisService {

    /**
     * 获取Redis的详细信在     * 包括服务器信息、内存信息、客户端信息、持久化信息在     
     * @return List<RedisInfo> Redis信息列表
     * @throws RedisConnectException Redis连接异常
     */
    List<RedisInfo> getRedisInfo() throws RedisConnectException;

    /**
     * 获取Redis key数量统计
     * 统计不同数据库中的key数量
     * @return Map<String, Object> key数量统计信息
     * @throws RedisConnectException Redis连接异常
     */
    Map<String, Object> getKeysSize() throws RedisConnectException;

    /**
     * 获取Redis内存使用信息
     * 包括已使用内存、峰值内存、内存碎片率在     * @return Map<String, Object> 内存使用信息
     * @throws RedisConnectException Redis连接异常
     */
    Map<String, Object> getMemoryInfo() throws RedisConnectException;

    /**
     * 获取报表需要的Redis信息
     * 根据类型返回不同的报表数在     * @param type 报表类型 (1:key数量, 2:内存信息, 3:全部信息)
     * @return Map<String, JSONArray> 报表数据
     * @throws RedisConnectException Redis连接异常
     */
    Map<String, JSONArray> getMapForReport(String type) throws RedisConnectException;

    /**
     * 获取Redis历史性能指标
     * 返回过去一段时间的性能监控数据
     * @return Map<String, List<Map<String, Object>>> 历史性能指标数据
     */
    Map<String, List<Map<String, Object>>> getMetricsHistory();
}
