// User Content Bank Types
export interface UserCB {
  id: string;
  userId: string;
  spaceId: string;
  requestReason: string;
  intendedUse: string;
  estimatedAudience?: number;
  programmingFrequency?: string;
  targetAudience?: string;
  termsAccepted: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserCBData {
  spaceId: string;
  requestReason: string;
  intendedUse: string;
  estimatedAudience?: number;
  programmingFrequency?: string;
  targetAudience?: string;
  termsAccepted: boolean;
}

export type UpdateUserCBData = Partial<CreateUserCBData> & {
  isActive?: boolean;
};
