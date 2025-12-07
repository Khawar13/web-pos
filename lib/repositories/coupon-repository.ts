// Coupon Repository - Coupon data access
// Reengineered from PointOfSale.java coupon() method

import { BaseRepository } from "./base-repository"
import type { Coupon } from "../types/models"

export class CouponRepository extends BaseRepository<Coupon> {
  constructor() {
    super("coupons", "code")
  }

  async findActiveByCode(code: string): Promise<Coupon | null> {
    const coupon = await this.findOne({ code, isActive: true } as any)
    if (!coupon) return null

    // Check if expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return null
    }

    return coupon
  }
}

export const couponRepository = new CouponRepository()
