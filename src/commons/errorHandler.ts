import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

const PASSWORD_NOT_VALID_TOKEN = 'Password did not conform with policy';
const ACCOUNT_NOT_CONFIRMED_TOKEN = 'User is not confirmed';
const CONFIRMATION_CODE_MISMATCH = 'Invalid verification code provided';
const INVALID_ACCESS_TOKEN = 'Invalid Access Token';

export const handleCognitoError = (err: Error) => {
  // this is not a good error handling mechanism
  const message = err.message;
  Logger.error(err);
  if (message.includes(PASSWORD_NOT_VALID_TOKEN)) {
    throw new BadRequestException({ message: message });
  } else if (message.includes(ACCOUNT_NOT_CONFIRMED_TOKEN)) {
    throw new UnauthorizedException({
      message: 'Account is not confirmed yet',
    });
  } else if (message.includes(CONFIRMATION_CODE_MISMATCH)) {
    throw new BadRequestException({ message: 'Confirmation code not correct' });
  } else if (message.includes(INVALID_ACCESS_TOKEN)) {
    throw new UnauthorizedException({
      message: 'Specified auth token is not valid',
    });
  } else {
    throw new ServiceUnavailableException({
      message:
        'Service not available, for some reasons. Please try again in several minutes.',
    });
  }
};
