import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(token: string) {
    const firebaseUser = await getAuth()
      .verifyIdToken(token, true)
      .catch(() => {
        throw new UnauthorizedException();
      });

    if (!firebaseUser) throw new UnauthorizedException();
    return firebaseUser;
  }
}
