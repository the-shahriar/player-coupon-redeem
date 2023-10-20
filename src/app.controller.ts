import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('coupon-redeem')
  @UsePipes(ValidationPipe)
  redeemCoupon(@Body() body: RedeemCouponDto) {
    return this.appService.redeemCoupon(body);
  }
}
