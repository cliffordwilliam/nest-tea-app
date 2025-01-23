import { SetMetadata } from '@nestjs/common';

// use my key to get my val
export const PUBLIC_ROUTE_KEY = 'isPublic';

export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
