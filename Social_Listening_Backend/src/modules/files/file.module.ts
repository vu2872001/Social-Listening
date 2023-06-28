import { PrismaModule } from 'src/config/database/database.config.module';
import { Module, forwardRef } from '@nestjs/common';
import { SettingModule } from '../setting/setting.module';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';

@Module({
  imports: [PrismaModule, SettingModule, forwardRef(() => SocialGroupModule)],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
