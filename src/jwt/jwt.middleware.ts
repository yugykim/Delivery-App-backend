import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

// class middle can not be using with app.use(JwtMiddleWare), it should be use with configure module
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly UsersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt']; //http
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        try {
          const { user } = await this.UsersService.findById(decoded['id']);
          req['user'] = user;
          //req meet midleware first, so middle can modify the type of reqest.keep traveling down to resolver
          //if we send wrong token, it won't work
        } catch (error) {
          console.log(error);
        }
      }
    }
    next();
  }
}
/*
// functional middle whare can be writen app.use(JwtMiddleware) for using everywherer
export function JwtMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers);
  next();
}
*/
