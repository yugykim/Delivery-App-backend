import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decoratior';
import {
  createAccountInput,
  createAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import {
  VerifyEmailInputput,
  VerifyEmailOutput,
} from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => createAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: createAccountInput,
  ): Promise<createAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') LoginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(LoginInput);
  }

  @Query(() => User)
  @Role(['Any']) //protect endpoint/ authentication /implement function
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query(() => UserProfileOutput)
  @Role(['Any'])
  async userProfile(
    @Args() UserProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(UserProfileInput.userId);
  }

  @Role(['Any'])
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(
    @Args('input') { code }: VerifyEmailInputput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
