import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// 实体导入
import { User } from '../modules/user/entities/user.entity';
import { Role } from '../modules/auth/entities/role.entity';
import { Permission } from '../modules/auth/entities/permission.entity';
import { UserRole } from '../modules/auth/entities/user-role.entity';
import { Project } from '../modules/project/entities/project.entity';
import { ProjectMember } from '../modules/project/entities/project-member.entity';
import { ProjectEnvironment } from '../modules/project/entities/project-environment.entity';
import { Requirement } from '../modules/requirement/entities/requirement.entity';
import { Prototype } from '../modules/prototype/entities/prototype.entity';
import { Material } from '../modules/material/entities/material.entity';
import { OperationLog } from '../modules/system/entities/operation-log.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', 'root'),
  database: configService.get('DB_DATABASE', 'verto'),
  entities: [
    User,
    Role,
    Permission,
    UserRole,
    Project,
    ProjectMember,
    ProjectEnvironment,
    Requirement,
    Prototype,
    Material,
    OperationLog,
  ],
  synchronize: configService.get('NODE_ENV') !== 'production',
  logging: configService.get('NODE_ENV') === 'development',
  timezone: '+08:00',
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
});

// 用于 TypeORM CLI 的数据源配置
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'verto',
  entities: [
    'src/modules/**/entities/*.entity.ts'
  ],
  migrations: [
    'src/migrations/*.ts'
  ],
  synchronize: false,
  logging: true,
  timezone: '+08:00',
  charset: 'utf8mb4',
});

export default AppDataSource;