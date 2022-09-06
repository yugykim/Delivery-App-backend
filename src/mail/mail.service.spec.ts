import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

const API_KEY = 'APIKEY';
const DOMAIN = 'DOMAIN';
const FROM_EMAIL = 'FROMEMAIL';

jest.mock('got', () => {
  return {};
});
jest.mock('form-data', () => {
  return { append: jest.fn() };
});

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

  it.todo('sendEmail');
  it.todo('sendVerificationEmail');
});
