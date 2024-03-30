import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOption, Profile } from 'passport-linkedin-oauth2';
import { User } from '@prisma/client';
import { processUsername } from '@reactive-resume/utils';
import { ErrorMessage } from '@reactive-resume/utils';

import { UserService } from '@/server/user/user.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    readonly clientID: string,
    readonly clientSecret: string,
    readonly callbackURL: string,
    private readonly userService: UserService,
  ) {
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['r_emailaddress', 'r_liteprofile'], // LinkedIn permissions for email and profile
      state: true, // Use a state parameter for security purposes
    } as StrategyOption);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err?: string | Error | null, user?: Express.User, info?: unknown) => void,
  ) {
    const { displayName, emails, photos } = profile;

    const email = emails?.[0].value;
    const picture = photos?.[0].value;

    let user: User | null = null;

    if (!email) throw new BadRequestException(ErrorMessage.OAuthUser);

    try {
      user = await this.userService.findOneByIdentifier(email);

      if (!user) throw new UnauthorizedException(ErrorMessage.InvalidCredentials);

      done(null, user);
    } catch (error) {
      try {
        user = await this.userService.create({
          email,
          picture,
          locale: 'en-US',
          name: displayName,
          provider: 'linkedin',
          emailVerified: true, // You might want to verify emails through LinkedIn
          username: processUsername(email.split('@')[0]),
          secrets: { create: {} },
        });

        done(null, user);
      } catch (error) {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }
    }
  }
}
