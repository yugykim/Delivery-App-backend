import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import FormData = require('form-data');
import got from 'got';
import { any } from 'joi';

const API_KEY = 'APIKEY';
const DOMAIN = 'DOMAIN';
const FROM_EMAIL = 'FROMEMAIL';

jest.mock('got');
jest.mock('form-data');

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: API_KEY,
            domain: DOMAIN,
            fromEmail: FROM_EMAIL,
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('sendVerificationEmail', () => {
    const sendVerificationEmailArgs = { email: 'email', code: 'code' };
    //spy on : it implement all of the function.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);
    service.sendVerificationEmail(
      sendVerificationEmailArgs.email,
      sendVerificationEmailArgs.code,
    );
    expect(service.sendEmail).toHaveBeenCalledTimes(1);
    expect(service.sendEmail).toHaveBeenCalledWith(
      'verify your email',
      'confirm',
      [
        { key: 'code', value: sendVerificationEmailArgs.code },
        { key: 'username', value: sendVerificationEmailArgs.email },
      ],
    );
  });

  it('sendEmail', async () => {
    const ok = await service.sendEmail('test', 'test', []);
    const formSpy = jest.spyOn(FormData.prototype, 'append');
    expect(formSpy).toHaveBeenCalled();
    expect(got.post).toHaveBeenCalledTimes(1);
    expect(got.post).toBeCalledWith(
      `https://api.mailgun.net/v3/${DOMAIN}/messages`,
      expect.any(Object),
    );
    expect(ok).toEqual(true);
  });
  it('fails on error', async () => {
    jest.spyOn(got, 'post').mockImplementation(() => {
      throw new Error();
    });
    const ok = await service.sendEmail('test', 'test', []);
    expect(ok).toEqual(false);
  });
});
