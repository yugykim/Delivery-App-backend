import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'testKey';
const USER_ID = 1;

//create factory
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

describe('JwtSerive', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });
  it('be defined', () => {
    expect(service).toBeDefined();
  });
  it('it shuld return a signed token', async () => {
    const token = service.sign(USER_ID);
    expect(typeof token).toBe('string');
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toBeCalledWith({ id: USER_ID }, TEST_KEY);
  });
  it('it should return the decoded token', async () => {
    const token = service.sign(USER_ID);
    const decodedToken = service.verify(token);
    expect(jwt.verify).toBeCalledTimes(1);
    expect(jwt.verify).toBeCalledWith(token, TEST_KEY);
  });
});
