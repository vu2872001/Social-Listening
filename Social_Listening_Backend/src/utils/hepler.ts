import { plainToClass, Transform } from 'class-transformer';
import { ClassType } from 'class-transformer-validator';

export function plainToClassCustom<T>(
  cls: ClassType<T>,
  plain: object,
  mapping: any[],
): T {
  class InsensitiveDto {
    [key: string]: any;

    constructor(input: object) {
      Object.entries(input).forEach(([k, v]) => {
        const propertyKey = mapping.find((key) => key.header === k)?.props;
        if (propertyKey) {
          this[propertyKey] = v;
        }
      });
    }
  }

  Object.getOwnPropertyNames(cls.prototype).forEach((prop) => {
    Transform((plainObj) => plainObj[prop.toLowerCase() || prop])(
      InsensitiveDto.prototype,
      prop,
    );
  });

  const dto = new InsensitiveDto(plain);
  return plainToClass(cls, dto);
}

export class Helper {
  public static getFileName(fileName: string) {
    const listAttr = fileName.split('.');
    listAttr.pop();
    return listAttr.join('.');
  }

  public static getFileExtension(fileName: string) {
    const mimetype = fileName.split('.').pop();
    return mimetype;
  }

  public static flatObject(object) {
    const data = Object.keys(object).reduce((acc, key) => {
      if (typeof object[key] === 'object' && object[key] !== null) {
        Object.keys(object[key]).forEach((subKey) => {
          acc[subKey] = object[key][subKey];
        });
      } else {
        acc[key] = object[key];
      }
      return acc;
    }, {});

    return data;
  }

  public static getGender(gender: string) {
    if (gender?.toLowerCase() === 'Male'.toLowerCase()) return 'Male';
    else if (gender?.toLowerCase() === 'Female'.toLowerCase()) return 'Female';
    return 'Other';
  }

  public static getSentimentRange(data) {
    const sentimentRange = Object.keys(data).reduce((acc, key) => {
      const [min, max] = data[key].split(' - ');
      acc[key] = { min: parseFloat(min), max: parseFloat(max) };
      return acc;
    }, {});

    return sentimentRange;
  }
}
