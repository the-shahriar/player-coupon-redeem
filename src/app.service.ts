import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
import { PlayerCoupon } from './entities/PlayerCoupon';
import { Reward } from './entities/Reward';
import { connectionSource } from './typeorm';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async redeemCoupon(body: RedeemCouponDto) {
    try {
      // initialize moment timezone
      moment.locale('Asia/Dhaka');
      const current_date = moment();

      // initialize db connection
      const dbConnection = await connectionSource.initialize();

      /* 
        Notes: I am assuming the configuration as ---------
        1. One reward has one coupon and
        2. If any reward is exist (other validation will be in down part) than its coupon will be exist too.
      */

      // fetch coupon data along with necessary data using rewardId
      const rewardCoupon = await dbConnection
        .createQueryBuilder(Reward, 'reward')
        .select([
          'reward.id as id',
          'reward.perDayLimit as perDayLimit',
          'reward.totalLimit as totalLimit',
          'reward.startDate as startDate',
          'reward.endDate as endDate',
          'coupon.id as coupon_id',
          'coupon.value as coupon_value',
        ])
        .innerJoin('coupon', 'coupon', 'coupon.rewardId = reward.id')
        .where('reward.id = :rewardId', { rewardId: body.rewardId })
        .getRawOne();

      // check coupon exist or not
      if (!rewardCoupon) {
        return this.prepareApiResult('Coupon not found.', false);
      }

      /* Business Logics ---------------------------------------
        1. A Reward should be valid within startDate and endDate
        2. The Player cannot exceed its per day limit
        3. The Player cannot exceed his total limit
        4. One Coupon could be redeem once
      */

      // 1. check if the reward campaign is available or not
      const isAvailable =
        current_date >= rewardCoupon.startDate &&
        current_date <= rewardCoupon.endDate;

      if (!isAvailable) {
        return this.prepareApiResult('Coupon is expired.', false);
      }

      // prepare data to check limits validations
      const dailyLimit = await this.checkRewardLimitExceed(
        'daily',
        dbConnection,
        body.playerId,
      );

      // 2. check if reward has been exceed its per day limit or not
      if (dailyLimit >= 3) {
        return this.prepareApiResult('Daily limit has been exceed.', false);
      }

      // prepare data to check limits validations
      const weeklyLimit = await this.checkRewardLimitExceed(
        'weekly',
        dbConnection,
        body.playerId,
      );

      // 3. check if reward has been exceed its weekly limit or not
      if (weeklyLimit >= 21) {
        return this.prepareApiResult('Weekly limit has been exceed.', false);
      }

      // 4. check specified coupon has been redeemed or not for the user
      const isRedeemed = await this.isCouponRedeemed(
        dbConnection,
        rewardCoupon.coupon_id,
        body.playerId,
      );

      if (isRedeemed) {
        return this.prepareApiResult('Already redeemed the coupon.', false);
      }

      return this.prepareApiResult('Coupon found.', true, {
        id: rewardCoupon.coupon_id,
        value: rewardCoupon.coupon_value,
      });
    } catch (error) {
      this.logger.error(error.message);
      return this.prepareApiResult('Something went wrong.', false);
    } finally {
      await connectionSource.destroy();
    }
  }

  // check reward limit exceed or not
  async checkRewardLimitExceed(
    type: string,
    dbConnection: any,
    playerId: number,
  ) {
    try {
      let rewardCount = null;
      if (type === 'daily') {
        rewardCount = await dbConnection
          .createQueryBuilder(PlayerCoupon, 'player_coupon')
          .select(['COUNT(player_coupon.id) as redeemedCoupon'])
          .where('player_coupon.playerId = :playerId', {
            playerId: playerId,
          })
          .andWhere('DATE(player_coupon.redeemedAt) = CURRENT_DATE')
          .getRawOne();
      } else {
        rewardCount = await dbConnection
          .createQueryBuilder(PlayerCoupon, 'player_coupon')
          .select(['COUNT(player_coupon.id) as redeemedCoupon'])
          .where('player_coupon.playerId = :playerId', {
            playerId: playerId,
          })
          .andWhere(
            'DATE(player_coupon.redeemedAt) BETWEEN CURRENT_DATE - INTERVAL 7 DAY AND CURRENT_DATE',
          )
          .getRawOne();
      }

      return rewardCount ? parseInt(rewardCount.redeemedCoupon) : 0;
    } catch (error) {
      return null;
    }
  }

  // check is coupon redeemed or not
  async isCouponRedeemed(
    dbConnection: any,
    coupon_id: number,
    playerId: number,
  ) {
    try {
      const isRedeemed = await dbConnection
        .createQueryBuilder(PlayerCoupon, 'coupon')
        .select(['coupon.id as id'])
        .where('coupon.couponId = :couponId', { couponId: coupon_id })
        .andWhere('coupon.playerId = :playerId', { playerId: playerId })
        .getRawOne();

      return isRedeemed;
    } catch (error) {
      return null;
    }
  }

  // prepare api result in a structured way
  prepareApiResult(
    message: string = '',
    success: boolean = true,
    data: object = {},
  ) {
    return {
      success: success,
      message,
      data: data,
    };
  }
}
