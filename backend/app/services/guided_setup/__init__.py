from app.models.guided_setup import (
    TrainingSource,
    BusinessHours,
    BusinessInformation,
    CallerName,
    CallerPhoneNumber,
    SpecificQuestion,
    MessageTaking,
    EmailNotifications,
    SmsNotifications,
    CallNotifications,
    QuickSetupData,
)

from .setup_crud import (
    save_guided_setup,
    get_guided_setup,
    has_completed_setup,
    update_guided_setup_agent_id,
    mark_setup_complete,
    get_formatted_setup_data,
    get_rosie_phone_number,
    check_user_exists,
)

from .agent_operations import (
    create_or_update_agent_from_setup
)

from .audio_generation import (
    generate_greeting_preview,
    generate_message_preview
)

from .web_scraping import (
    generate_business_overview,
    retrain_agent_service
)

from .api_handlers import (
    submit_quick_setup,
    check_setup_status,
    generate_onboarding_preview_service,
    set_trial_plan_service,
    save_onboarding_data_service
)

# Export all the functions and models from the original guided_setup.py
__all__ = [
    # Models
    'TrainingSource',
    'BusinessHours',
    'BusinessInformation',
    'CallerName',
    'CallerPhoneNumber',
    'SpecificQuestion',
    'MessageTaking',
    'EmailNotifications',
    'SmsNotifications',
    'CallNotifications',
    'QuickSetupData',
    
    # Setup CRUD operations
    'save_guided_setup',
    'get_guided_setup',
    'has_completed_setup',
    'update_guided_setup_agent_id',
    'mark_setup_complete',
    'get_formatted_setup_data',
    'get_rosie_phone_number',
    'check_user_exists',
    'diagnose_and_repair_database_issues',
    
    # Agent operations
    'create_or_update_agent_from_setup',
    
    # Audio generation
    'generate_greeting_preview',
    'generate_message_preview',
    
    # Web scraping
    'generate_business_overview',
    'retrain_agent_service',
    
    # API handlers
    'submit_quick_setup',
    'check_setup_status',
    'generate_onboarding_preview_service',
    'set_trial_plan_service',
    'save_onboarding_data_service'
] 