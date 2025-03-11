# Changelog

## [Unreleased]

### Added
- Added support for `agent_language` field in the guided setup process
  - Updated `save_guided_setup` function to accept and store agent language
  - Modified `save_onboarding_data_service` to pass agent language to database
  - Updated all function calls to `save_guided_setup` to include agent language
  - Default language is set to "en" (English) if not specified

### Changed
- Enhanced onboarding flow to better preserve language preferences
- Improved logging for language-related operations
