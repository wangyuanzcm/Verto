package com.verto.vertomanagement;

import lombok.extern.slf4j.Slf4j;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * 员工管理系统启动类
 * 
 * @author Verto
 * @since 1.0.0
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableCaching
@MapperScan("com.verto.vertomanagement.mapper")
@Slf4j
public class StaffManagementApplication {

    /**
     * 主方法，启动Spring Boot应用
     * 
     * @param args 命令行参数
     */
    public static void main(String[] args) throws UnknownHostException {
        SpringApplication app = new SpringApplication(StaffManagementApplication.class);
        ConfigurableApplicationContext application = app.run(args);
        Environment env = application.getEnvironment();

        String ip = InetAddress.getLocalHost().getHostAddress();
        String port = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "");
        if (contextPath == null) {
            contextPath = "";
        }

        String localUrl = "http://localhost:" + port + contextPath;
        String externalUrl = "http://" + ip + ":" + port + contextPath;

        log.info("\n----------------------------------------------------------\n\t" +
                "Application Verto-Management is running! Access URLs:\n\t" +
                "Local: \t\t" + localUrl + "/doc.html\n\t" +
                "External: \t" + externalUrl + "/doc.html\n\t" +
                "----------------------------------------------------------");
    }
}
