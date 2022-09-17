import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { createAccountInput } from './dtos/create-account.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';
import { UserProfileOutput } from './dtos/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: createAccountInput): Promise<{ ok: boolean; error?: string }> {
    // check that email does not exist
    // check new user& hash the password
    try {
      const exists = await this.users.findOne({ where: { email } });

      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      //make error
      return { ok: false, error: "Couldn't creat account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    //find the user with the email
    // check if the passsword is correct
    // make a JWT give it to the user

    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
      if (!user) {
        return {
          ok: false,
          error: 'user not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ where: { id } });
      return {
        ok: true,
        user: user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User not found',
      };
    }
  }

  //do not send any undefind value
  async editProfile(
    id: number,
    { email, password }: EditProfileInput, // distructing syntax
  ): Promise<{ ok: boolean; error?: string }> {
    const user = await this.users.findOne({ where: { id } });
    try {
      // change actual entity with javascript instead of DB
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      this.users.save(user);
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
    //save is all given entities
    return { ok: true, error: null };
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'], //As default, typeorm doesn't call relationship, so we should request relationship to typeorm.
      });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user); //if we send password with users.save() and the object has the password, then the password will be hashed
        await this.verifications.delete(verification.id); //when user is verficated, then verification id delete
        return {
          ok: true,
        };
      }
      return { ok: false, error: 'verification not found' };
    } catch (error) {
      return {
        ok: false,
        error: 'could not verify email',
      };
    }
  }
}
