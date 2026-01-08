from pydantic import BaseModel
from typing import List, Optional

class DevEvent(BaseModel):
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    tags: List[str] = []
    source: str = "dev-event-github"
