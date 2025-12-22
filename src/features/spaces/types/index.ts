// Space Types
export interface Space {
  id: string;
  userId: string;
  locationId: string;
  companyId?: string;
  name: string;
  description?: string;
  type: 'cinema' | 'auditorium' | 'cultural-center' | 'outdoor' | 'mobile' | 'other';
  capacity: number;
  screenSize?: string;
  projectionType: 'digital' | 'film' | 'both';
  soundSystem?: string;
  accessibility: string[];
  amenities: string[];
  technicalSpecs?: {
    resolution?: string;
    aspectRatio?: string;
    audioChannels?: string;
    [key: string]: string | undefined;
  };
  availableDays: string[];
  availableHours?: string;
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpaceData {
  locationId: string;
  companyId?: string;
  name: string;
  description?: string;
  type: 'cinema' | 'auditorium' | 'cultural-center' | 'outdoor' | 'mobile' | 'other';
  capacity: number;
  screenSize?: string;
  projectionType: 'digital' | 'film' | 'both';
  soundSystem?: string;
  accessibility: string[];
  amenities: string[];
  technicalSpecs?: Record<string, string>;
  availableDays: string[];
  availableHours?: string;
}

export interface UpdateSpaceData extends Partial<CreateSpaceData> {
  isActive?: boolean;
}
