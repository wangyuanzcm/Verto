package com.verto.vertomanagement.domain;

import java.util.HashMap;
import java.util.Map;

/**
 * @Description: Redis信息实体在 
 * * 用于封装Redis服务器的各种监控信息和状态数在 
 * * @author: Verto Team
 */
public class RedisInfo {

    /**
     * Redis信息字段描述映射在     * 将Redis INFO命令返回的字段映射为中文描述
     */
    private static Map<String, String> descriptionMap = new HashMap<>();

    static {
        // 服务器信在        
        descriptionMap.put("redis_version", "Redis 服务器版在");
        descriptionMap.put("redis_git_sha1", "Git SHA1");
        descriptionMap.put("redis_git_dirty", "Git dirty flag");
        descriptionMap.put("os", "Redis 服务器的宿主操作系统");
        descriptionMap.put("arch_bits", "架构在2 在64 位）");
        descriptionMap.put("multiplexing_api", "Redis 所使用的事件处理机在");
        descriptionMap.put("gcc_version", "编译 Redis 时所使用在GCC 版本");
        descriptionMap.put("process_id", "服务器进程的 PID");
        descriptionMap.put("run_id", "Redis 服务器的随机标识符（用于 Sentinel 和集群）");
        descriptionMap.put("tcp_port", "TCP/IP 监听端口");
        descriptionMap.put("uptime_in_seconds", "在Redis 服务器启动以来，经过的秒在");
        descriptionMap.put("uptime_in_days", "在Redis 服务器启动以来，经过的天在");
        descriptionMap.put("lru_clock", "以分钟为单位进行自增的时钟，用于 LRU 管理");
        
        // 客户端信在       
         descriptionMap.put("connected_clients", "已连接客户端的数量（不包括通过从属服务器连接的客户端）");
        descriptionMap.put("client_longest_output_list", "当前连接的客户端当中，最长的输出列表");
        descriptionMap.put("client_longest_input_buf", "当前连接的客户端当中，最大输入缓在");
        descriptionMap.put("blocked_clients", "正在等待阻塞命令（BLPOP、BRPOP、BRPOPLPUSH）的客户端的数量");
        
        // 内存信息
        descriptionMap.put("used_memory", "在Redis 分配器分配的内存总量，以字节（byte）为单位");
        descriptionMap.put("used_memory_human", "以人类可读的格式返回 Redis 分配的内存总量");
        descriptionMap.put("used_memory_rss", "从操作系统的角度，返在Redis 已分配的内存总量（俗称常驻集大小在");
        descriptionMap.put("used_memory_peak", "Redis 的内存消耗峰在以字节为单位)");
        descriptionMap.put("used_memory_peak_human", "以人类可读的格式返回 Redis 的内存消耗峰在");
        descriptionMap.put("used_memory_lua", "Lua 引擎所使用的内存大小（以字节为单位在");
        descriptionMap.put("mem_fragmentation_ratio", "used_memory_rss 在used_memory 之间的比在");
        descriptionMap.put("mem_allocator", "在编译时指定的， Redis 所使用的内存分配器");
        
        // 持久化信在      
          descriptionMap.put("loading", "服务器是否正在载入持久化文件");
        descriptionMap.put("rdb_changes_since_last_save", "离最近一次成功生成rdb文件，写入命令的个数");
        descriptionMap.put("rdb_bgsave_in_progress", "服务器是否正在创建rdb文件");
        descriptionMap.put("rdb_last_save_time", "离最近一次成功创建rdb文件的时间戳");
        descriptionMap.put("rdb_last_bgsave_status", "最近一次rdb持久化是否成在");
        descriptionMap.put("rdb_last_bgsave_time_sec", "最近一次成功生成rdb文件耗时秒数");
        descriptionMap.put("rdb_current_bgsave_time_sec", "如果服务器正在创建rdb文件，当前创建操作已经耗费的秒在");
        descriptionMap.put("aof_enabled", "是否开启了aof");
        descriptionMap.put("aof_rewrite_in_progress", "标识aof的rewrite操作是否在进行中");
        descriptionMap.put("aof_rewrite_scheduled", "rewrite任务计划");
        
        // 统计信息
        descriptionMap.put("total_commands_processed", "redis处理的命令数");
        descriptionMap.put("total_connections_received", "新创建连接个在");
        descriptionMap.put("instantaneous_ops_per_sec", "redis当前的qps");
        descriptionMap.put("total_net_input_bytes", "redis网络入口流量字节在");
        descriptionMap.put("total_net_output_bytes", "redis网络出口流量字节在");
        descriptionMap.put("instantaneous_input_kbps", "redis网络入口kps");
        descriptionMap.put("instantaneous_output_kbps", "redis网络出口kps");
        descriptionMap.put("rejected_connections", "拒绝的连接个在");
        
        // 复制信息
        descriptionMap.put("role", "实例的角色，是master or slave");
        descriptionMap.put("connected_slaves", "连接的slave实例个数");
        descriptionMap.put("master_repl_offset", "主从同步偏移在");
        descriptionMap.put("repl_backlog_active", "复制积压缓冲区是否开在");
        descriptionMap.put("repl_backlog_size", "复制积压缓冲大小");
        
        // CPU信息
        descriptionMap.put("used_cpu_sys", "将所有redis主进程在核心态所占用的CPU时求和累计起在");
        descriptionMap.put("used_cpu_user", "将所有redis主进程在用户态所占用的CPU时求和累计起在");
        
        // 键空间信在      
          descriptionMap.put("expired_keys", "运行以来过期的key的数在");
        descriptionMap.put("evicted_keys", "运行以来剔除(超过了maxmemory在的key的数在");
        descriptionMap.put("keyspace_hits", "命中次数");
        descriptionMap.put("keyspace_misses", "没命中次在");
    }

    /**
     * 信息在     */
    private String key;
    
    /**
     * 信息在     */
    private String value;
    
    /**
     * 信息描述
     */
    private String description;

    /**
     * 默认构造函在     */
    public RedisInfo() {
    }

    /**
     * 构造函在     * @param key 信息在     * @param value 信息在     */
    public RedisInfo(String key, String value) {
        this.key = key;
        this.value = value;
        this.description = descriptionMap.getOrDefault(key, key);
    }

    /**
     * 获取信息在     
     * * @return String 信息在     */
    public String getKey() {
        return key;
    }

    /**
     * 设置信息在    
     *   * @param key 信息在     */
    public void setKey(String key) {
        this.key = key;
        this.description = descriptionMap.getOrDefault(key, key);
    }

    /**
     * 获取信息在     
     * * @return String 信息在     */
    public String getValue() {
        return value;
    }

    /**
     * 设置信息在     * @param value 信息在     */
    public void setValue(String value) {
        this.value = value;
    }

    /**
     * 获取信息描述
     * @return String 信息描述
     */
    public String getDescription() {
        return description;
    }

    /**
     * 设置信息描述
     * @param description 信息描述
     */
    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "RedisInfo{" +
                "key='" + key + '\'' +
                ", value='" + value + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
