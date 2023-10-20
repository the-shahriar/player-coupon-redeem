import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const body = { playerId: 1, rewardId: 7 };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Coupon not found"', () => {
      return appController.redeemCoupon(body).then((response) => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Coupon not found.');
      });
    });
  });
});
