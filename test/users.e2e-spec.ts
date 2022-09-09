import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});
const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'test@test.com',
  PASSWORD: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'yugyeongkim',
      password: '12345',
      database: 'uber-eats-test',
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });
  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            createAccount(input: {
              email: "${testUser.email}",
              password: "${testUser.PASSWORD}",
              role: Owner
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            createAccount(input: {
              email: "${testUser.email}",
              password: "${testUser.PASSWORD}",
              role: Owner
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });
  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          login(input: {
            email: "${testUser.email}",
            password: "${testUser.PASSWORD}"
          }) {
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.ok).toBe(true);
          expect(res.body.data.login.error).toEqual(null);
          expect(res.body.data.login.token).toEqual(expect.any(String));
          jwtToken = res.body.data.login.token;
        });
    });
    it('should not login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
        login(input: {
          email: "hi@test.com",
          password: "111"
        }) {
          ok
          error
          token
        }
      }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.ok).toBe(false);
          expect(res.body.data.login.error).toEqual(expect.any(String));
          expect(res.body.data.login.token).toEqual(null);
        });
    });
  });

  /**
   *.expect(res => {
    const {
      body: {
        data: { login },
      },
    } = res;
    expect(login.ok).toBe(true);
    expect(login.error).toBe(null);
    expect(login.token).toBe(expect.any(String));
   })
   */

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
        {
          userProfile(userId:${userId}){
            ok
            error
            user {
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });

    it('shold not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
        {
          userProfile(userId:2){
            ok
            error
            user {
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User not found');
          expect(user).toBe(null);
        });
    });
  });
});
