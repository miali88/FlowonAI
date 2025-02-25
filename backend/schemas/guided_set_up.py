Part one: Quick setup



Message taking


Call notifications

Part two: Talk to Rosie




class TrainingSources(BaseModel):
    google_business_profile: str
    business_website: str

class BusinessInformation(BaseModel):
    business_information: str
    business_name: str
    business_overview: str
    message_taking: str


class QuickSetup(BaseModel):
    training_sources: TrainingSources
    message_taking: str
    call_notifications: str