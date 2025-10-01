package com.verto.vertomanagement;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * @Description: Verto API服务端启动类
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableCaching
@MapperScan("com.verto.vertomanagement.mapper")
public class VertoApiServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(VertoApiServerApplication.class, args);
        System.out.println("========================================");
        System.out.println("Verto API服务端启动成功！");
        System.out.println("接口文档地址: http://localhost:8080/verto-api/doc.html");
        System.out.println("数据库监在 http://localhost:8080/verto-api/druid/");
        System.out.println("========================================");
    }
}
