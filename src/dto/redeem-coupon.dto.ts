import { IsNotEmpty, IsNumber } from 'class-validator';

export class RedeemCouponDto {
  @IsNotEmpty()
  @IsNumber()
  playerId: number;

  @IsNotEmpty()
  @IsNumber()
  rewardId: number;
}
