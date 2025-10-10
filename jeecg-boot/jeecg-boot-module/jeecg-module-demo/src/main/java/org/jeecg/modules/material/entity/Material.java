package org.jeecg.modules.material.entity;

import java.io.Serializable;
import java.util.Date;

import com.baomidou.mybatisplus.annotation.Version;
import org.jeecg.common.system.base.entity.JeecgEntity;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.springframework.format.annotation.DateTimeFormat;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: 物料管理实体类 - 支持组件和模板管理
 * @Author: jeecg-boot
 * @Date: 2024-01-26
 * @Version: V1.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@Schema(description = "物料管理")
@TableName("material")
public class Material extends JeecgEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 物料名称
     */
    @Excel(name = "物料名称", width = 25)
    @Schema(description = "物料名称")
    private String name;

    /**
     * 物料类型：component-组件，template-模板
     */
    @Excel(name = "物料类型", width = 15, dicCode = "material_type")
    @Schema(description = "物料类型")
    private String type;

    /**
     * 版本号
     */
    @Excel(name = "版本号", width = 15)
    @Schema(description = "版本号")
    private String version;

    /**
     * 物料代码/内容 - 组件代码或模板内容
     */
    @Schema(description = "物料代码/内容")
    private String code;

    /**
     * 物料内容 - 模板专用字段
     */
    @Schema(description = "物料内容")
    private String content;

    /**
     * 物料描述
     */
    @Excel(name = "物料描述", width = 30)
    @Schema(description = "物料描述")
    private String description;

    /**
     * 状态：1-启用，0-禁用
     */
    @Excel(name = "状态", width = 10, dicCode = "valid_status")
    @Schema(description = "状态")
    private String status;

    /**
     * 乐观锁字段
     */
    @Version
    private Integer updateCount;

    /**
     * 租户ID
     */
    @Schema(description = "租户ID")
    private Integer tenantId;
}