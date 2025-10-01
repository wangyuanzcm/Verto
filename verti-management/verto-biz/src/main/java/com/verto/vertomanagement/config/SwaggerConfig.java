package com.verto.vertomanagement.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.media.StringSchema;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.core.models.GroupedOpenApi;

/**
 * @Description: Swagger配置在 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Configuration
public class SwaggerConfig {

    /**
     * 创建OpenAPI配置
     * @return OpenAPI配置对象
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // 全局安全方案：使用自定义 Header X-Access-Token（与 Jeecg-Boot 一致）
                .components(new Components()
                        .addSecuritySchemes("X-Access-Token",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-Access-Token")
                        )
                )
                .addSecurityItem(new SecurityRequirement().addList("X-Access-Token"))
                .info(new Info()
                        .title("Verto API服务在")
                        .version("1.0.0")
                        .description("为jeecgboot-vue3前端项目提供后端接口服务，包含用户认证、系统管理、员工管理等功能")
                        .contact(new Contact()
                                .name("Verto")
                                .email("verto@example.com")
                                .url("https://github.com/verto"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")));
    }

    /**
     * 对齐 Jeecg-Boot 风格：定义接口分组（按包扫描）
     */
    @Bean
    public GroupedOpenApi defaultGroup() {
        return GroupedOpenApi.builder()
                .group("verto-api")
                .packagesToScan("com.verto.vertomanagement.controller")
                .pathsToMatch("/**")
                .build();
    }

    // 当前 springdoc 版本不包含 OpenApiCustomiser；如需在文档界面统一展示 X-Access-Token 参数，
    // 可在后续升级到支持 customizer 的依赖版本后再启用，或改用 OperationCustomizer / 安全方案配置实现。

    /**
     * 在每个接口的文档参数列表中全局展示 X-Access-Token 头部（仅文档展示，不强制必填）
     * 注：已同时配置了 SecurityScheme，用户也可通过文档右上角 Authorize 统一输入令牌
     */
    @Bean
    public OperationCustomizer globalHeaderParameterCustomizer() {
        return (operation, handlerMethod) -> {
            Parameter tokenHeader = new Parameter()
                    .name("X-Access-Token")
                    .in("header")
                    .required(false)
                    .description("登录令牌（与 Jeecg-Boot 保持一致）")
                    .schema(new StringSchema());
            // 若已存在同名参数则不重复添加
            if (operation.getParameters() == null ||
                    operation.getParameters().stream().noneMatch(p -> "X-Access-Token".equalsIgnoreCase(p.getName()))) {
                operation.addParametersItem(tokenHeader);
            }
            return operation;
        };
    }
}
