import { useState, useCallback } from "react";
import { promotionService, ValidateCouponPayload, ValidateCouponResponse } from "@/services/promotions.service";


export function useValidateCoupon() {
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValidateCouponResponse | null>(null);

  const validateCoupon = useCallback(async (payload: ValidateCouponPayload) => {
    setIsValidating(true);
    setError(null);
    try {
      const response = await promotionService.validateCoupon(payload);
      setResult(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to validate coupon";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearCoupon = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { validateCoupon, clearCoupon, isValidating, error, result };
}
