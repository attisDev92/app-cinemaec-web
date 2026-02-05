// Enums compartidos en toda la aplicación

// User Role
export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  USER = "user",
}

// Admin Permissions - Permisos granulares para administradores
export enum PermissionEnum {
  ADMIN_SPACES = "admin_spaces",
  ADMIN_MOVIES = "admin_movies",
  APPROVE_MOVIES_REQUEST = "approve_movies_request",
  ADMIN_USERS = "admin_users",
  ASSIGN_ROLES = "assign_roles",
  VIEW_REPORTS = "view_reports",
  EXPORT_DATA = "export_data",
}

// Legal Status (Profile)
export enum LegalStatus {
  NATURAL_PERSON = "natural_person",
  LEGAL_ENTITY = "legal_entity",
}

// Asset Types
export enum AssetTypeEnum {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  LOGO = "logo",
  OTHER = "other",
}

// Asset Owner Types
export enum AssetOwnerEnum {
  SPACE_LOGO = "space_logo",
  SPACE_PHOTO = "space_photo",
  SPACE_DOCUMENT = "space_document",
  USER_BC_PHOTO = "user_bc_photo",
  USER_AGREEMENT = "user_agreement",
  COMPANY_LOGO = "company_logo",
  COMPANY_PHOTOS = "company_photos",
  LOCATION_PHOTOS = "location_photos",
  MOVIE_STILLS = "movie_stills",
  MOVIE_POSTER = "movie_poster",
  MOVIE_DOSSIER = "movie_dossier",
  MOVIE_DOSSIER_EN = "movie_dossier_en",
  MOVIE_PEDAGOGICAL_GUIDE = "movie_pedagogical_guide",
}

// Space Types (alineados con backend)
export enum SpaceTypeEnum {
  THEATER = "theater",
  CINEMA = "cinema",
  CULTURAL_CENTER = "cultural_center",
  MULTIPURPOSE = "multipurpose",
  OTHER = "other",
}

// Space Status (alineados con backend)
export enum SpaceStatusEnum {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  VERIFIED = "verified",
  REJECTED = "rejected",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

// Space Review Decisions (alineados con backend)
export enum SpaceReviewDecisionEnum {
  APPROVE = "approve",
  REQUEST_CHANGES = "request_changes",
  REJECT = "reject",
}
