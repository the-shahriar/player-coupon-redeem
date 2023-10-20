import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return "Coupon not found"', () => {
    // Mock valid request data for redeeming a coupon
    const redeemCouponData = {
      playerId: 2,
      rewardId: 7,
    };

    return request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(redeemCouponData)
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Coupon not found.');
      });
  });

  it('should return "A valid coupon"', () => {
    // Mock valid request data for redeeming a coupon
    const redeemCouponData = {
      playerId: 2,
      rewardId: 1,
    };

    return request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(redeemCouponData)
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Coupon found.');
        expect(Object.keys(response.body.data).length).toBe(2);
      });
  });

  it('should return "Coupon expired"', () => {
    // Mock valid request data for redeeming a coupon
    const redeemCouponData = {
      playerId: 2,
      rewardId: 6,
    };

    return request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(redeemCouponData)
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Coupon is expired.');
      });
  });

  it('should return "User daily limit exceed"', () => {
    // Mock request data for redeeming an expired coupon
    const redeemCouponData = {
      playerId: 1,
      rewardId: 2,
    };

    return request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(redeemCouponData)
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Daily limit has been exceed.');
      });
  });

  it('should return "User weekly limit exceed"', () => {
    // Mock request data for redeeming an expired coupon
    const redeemCouponData = {
      playerId: 1,
      rewardId: 2,
    };

    return request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(redeemCouponData)
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Daily limit has been exceed.');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
