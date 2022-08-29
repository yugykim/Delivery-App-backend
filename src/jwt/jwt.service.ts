import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './interfaces/jwt.constants';
import { JwtModuleOptions } from './interfaces/jwt.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  sign(payload: object): string {
    return jwt.sign(payload, this.options.privateKey);
  }
}
