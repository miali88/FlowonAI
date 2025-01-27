from typing import Optional, List
from pydantic import BaseModel

class KnowledgeBaseItem(BaseModel):
    """Base model for knowledge base items"""
    id: int
    title: str
    content: Optional[str]
    url: Optional[str] = None
    token_count: Optional[int] = None
    user_id: str
    data_type: Optional[str] = None
    heading: Optional[str] = None
    file_name: Optional[str] = None

class KnowledgeBaseItemCreate(BaseModel):
    """Model for creating a new knowledge base item"""
    title: str
    content: str
    user_id: str
    data_type: Optional[str] = "text"
    heading: Optional[str] = None
    file_name: Optional[str] = None

class KnowledgeBaseHeader(BaseModel):
    """Model for knowledge base headers"""
    id: int
    heading: str
    file_name: str
    user_id: str
    data_type: str
    parent_id: int

class WebScrapeRequest(BaseModel):
    """Model for web scraping requests"""
    urls: List[str]

class UrlCrawlRequest(BaseModel):
    """Model for URL crawling requests"""
    url: str

class TokenCalculationRequest(BaseModel):
    """Model for token calculation requests"""
    content: str

class TokenResponse(BaseModel):
    """Model for token calculation response"""
    token_count: int

class KnowledgeBaseResponse(BaseModel):
    """Model for knowledge base list response"""
    items: List[KnowledgeBaseItem]
    total_tokens: int
