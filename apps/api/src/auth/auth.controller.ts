import {
  Controller,
  Post,
  Get,
  Req,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Webhook } from 'svix';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkGuard } from './clerk.guard';
import { CurrentUser } from './current-user.decorator';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ) {
    const payload = req.rawBody?.toString('utf8');
    if (!payload) {
      throw new UnauthorizedException('No payload');
    }

    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new UnauthorizedException('Missing svix headers');
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not configured');
    }

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid signature');
    }

    const eventType = evt.type;
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const primaryEmail = email_addresses.find(
        (email: any) => email.id === evt.data.primary_email_address_id,
      );

      await this.prisma.user.create({
        data: {
          clerkId: id,
          email: primaryEmail?.email_address || '',
          displayName: `${first_name || ''} ${last_name || ''}`.trim(),
          avatarUrl: image_url,
          plan: 'free',
        },
      });
    }

    return { success: true };
  }

  @UseGuards(ClerkGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    return dbUser;
  }
}
