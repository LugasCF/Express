export type UserRole = 'driver' | 'company';

export type VehicleType = 'moto' | 'car' | 'van' | 'truck';

export interface VehicleConfig {
  type: VehicleType;
  label: string;
  model: string;
  plate: string;
  avgConsumptionKmPerL: number; // e.g. 35 for moto, 12 for car, 8.5 for van, 6 for truck
  fuelType: 'gasolina' | 'etanol' | 'diesel' | 'gnv';
  fuelPricePerL: number; // in R$
}

export type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'not_submitted';

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalDeliveries: number;
  cnhStatus: DocumentStatus;
  crlvStatus: DocumentStatus;
  vehicle: VehicleConfig;
  efficiencyTier: 'Diamante' | 'Ouro' | 'Prata' | 'Bronze';
  efficiencyScore: number; // 0 - 100
  fuelSavedLiters: number;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type DeliveryStatus = 'pending' | 'in_transit' | 'arrived' | 'delivered' | 'failed';

export interface ProofOfDelivery {
  recipientName: string;
  recipientDocument: string;
  signatureDataUrl?: string;
  photoDataUrl?: string;
  deliveredAt: string;
  deliveryNotes?: string;
  gpsCoordinates?: Coordinates;
}

export interface DeliveryPackage {
  id: string;
  trackingCode: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: Coordinates;
  weightKg: number;
  volumeCategory: 'Pequeno' | 'Médio' | 'Grande';
  freightFee: number; // R$
  companyName: string;
  deliveryStatus: DeliveryStatus;
  scannedAt?: string;
  sequenceOrder?: number;
  specialInstructions?: string;
  proof?: ProofOfDelivery;
}

export interface OptimizedRoute {
  id: string;
  driverId: string;
  depotOrigin: {
    name: string;
    address: string;
    coordinates: Coordinates;
  };
  stops: DeliveryPackage[];
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  originalDurationMin: number;
  optimizedDurationMin: number;
  distanceSavedKm: number;
  percentSaved: number;
  estimatedFuelCost: number;
  totalFreightGross: number;
  platformFeeAmount: number;
  netDriverEarnings: number;
  status: 'planning' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
}

export interface FreightDemand {
  id: string;
  companyName: string;
  title: string;
  originAddress: string;
  originCoordinates: Coordinates;
  totalPackages: number;
  totalWeightKg: number;
  totalDistanceEstKm: number;
  totalPayout: number; // R$
  suggestedVehicle: VehicleType;
  status: 'available' | 'assigned' | 'in_transit' | 'completed';
  assignedDriverName?: string;
  createdAt: string;
  packages: DeliveryPackage[];
}

export interface EfficiencyMetrics {
  driverId: string;
  punctualityRate: number; // %
  routeAdherence: number; // %
  completionRate: number; // %
  avgTimePerStopMin: number;
  co2SavedKg: number;
  fuelSavedReais: number;
  rankPosition: number;
  totalActiveDrivers: number;
}

export interface ReviewCategoryRatings {
  punctuality: number; // 1-5
  communication: number; // 1-5
  careAndCondition: number; // 1-5 (Cuidado com a carga / Estado do produto)
  speedOrEase: number; // 1-5 (Agilidade no despacho / Facilidade de acesso)
}

export interface Review {
  id: string;
  authorRole: 'company' | 'driver';
  authorName: string;
  authorAvatar?: string;
  targetRole: 'company' | 'driver';
  targetId: string;
  targetName: string;
  freightId?: string;
  freightTitle?: string;
  rating: number; // 1 - 5
  categoryRatings: ReviewCategoryRatings;
  tags: string[];
  comment?: string;
  wouldRecommend: boolean;
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  cnpj: string;
  rating: number;
  totalReviews: number;
  totalFreightsDispatched: number;
  address: string;
  avatar: string;
  paymentRating: number;
  dispatchSpeedRating: number;
  verified: boolean;
  activeSince: string;
}

export type NotificationCategory = 'freight' | 'route' | 'delivery' | 'review' | 'finance' | 'system';

export interface AppNotification {
  id: string;
  recipientRole: 'company' | 'driver' | 'both';
  category: NotificationCategory;
  type:
    | 'freight_accepted'
    | 'route_started'
    | 'delivery_completed'
    | 'route_finished'
    | 'new_demand'
    | 'traffic_alert'
    | 'review_received'
    | 'payment_confirmed';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority?: 'high' | 'normal' | 'low';
  metadata?: {
    freightId?: string;
    driverName?: string;
    companyName?: string;
    packageId?: string;
    trackingCode?: string;
    payout?: number;
    rating?: number;
  };
}

export interface NotificationPreferences {
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  newDemands: boolean;
  routeUpdates: boolean;
  deliveryConfirmations: boolean;
  reviewsAndRatings: boolean;
  paymentsAndPix: boolean;
  demandRadiusKm: number; // Radius in km for relevant demands
}
