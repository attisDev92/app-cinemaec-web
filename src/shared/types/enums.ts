// Enums compartidos en toda la aplicación

// User Role
export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  USER = "user",
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
}
