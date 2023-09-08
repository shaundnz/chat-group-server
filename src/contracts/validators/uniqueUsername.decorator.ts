import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { AuthService } from '../../modules/auth/auth.service';

export const IsUniqueUsername = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueUsernameConstraint,
    });
  };
};

@ValidatorConstraint({ name: 'IsUniqueUsername', async: true })
@Injectable()
export class IsUniqueUsernameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly authService: AuthService) {}

  async validate(username: string) {
    const user = await this.authService.getUser(username);
    if (user === null) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `Username "${args.value}" already exists`;
  }
}
