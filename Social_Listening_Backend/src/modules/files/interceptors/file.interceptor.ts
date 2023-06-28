import { Injectable, NestInterceptor, Type, mixin } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { SettingService } from 'src/modules/setting/service/setting.service';

interface FileInterceptorOptions {
  fieldName: string;
  path?: string;
  fileName?: any;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

export function FilesInterceptor(
  options: FileInterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(private readonly settingService: SettingService) {}

    async makeFileInterceptor() {
      const fileDestination = await this.settingService.getSettingByKeyAndGroup(
        'UPLOADED_FILE_DESTINATION',
        'FILE',
      );
      const destination = `${fileDestination.value}${options.path}`;

      const multerOptions: MulterOptions = {
        storage: diskStorage({ destination, filename: options.fileName }),
        fileFilter: options.fileFilter,
        limits: options.limits,
      };

      this.fileInterceptor = new (FileInterceptor(
        options.fieldName,
        multerOptions,
      ))();
    }

    async intercept(...args: Parameters<NestInterceptor['intercept']>) {
      await this.makeFileInterceptor();
      return this.fileInterceptor.intercept(...args);
    }
  }

  return mixin(Interceptor);
}
