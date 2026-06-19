import { apiClient } from "@/lib/api-client";

export interface ReferredFriend {
  name: string;
  status: string; // PENDING or COMPLETED
  rewardClaimed: boolean;
}

export interface ReferralResponse {
  myReferralCode: string;
  totalLoyaltyPointsEarned: number;
  friends: ReferredFriend[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const referralsService = {
  getReferrals: async (): Promise<ReferralResponse> => {
    const res = await apiClient.get<ApiResponse<ReferralResponse>>("/api/v1/referrals");
    return res.data;
  },
  
  claimReward: async (): Promise<ReferralResponse> => {
    const res = await apiClient.post<ApiResponse<ReferralResponse>>("/api/v1/referrals/claim", {});
    return res.data;
  }
};
