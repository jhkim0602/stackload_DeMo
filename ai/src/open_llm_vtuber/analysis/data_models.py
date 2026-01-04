from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class NonVerbalData(BaseModel):
    """프론트엔드에서 전송되는 1초 단위 비언어적 데이터"""
    timestamp: float
    gaze_direction: Literal["center", "up", "down", "left", "right"]
    pose_status: Literal["good", "bad"]
    face_visible: bool

class AnalysisSessionResult(BaseModel):
    """면접 세션 종료 후 생성되는 최종 분석 리포트 데이터"""
    session_id: str
    total_duration: float
    attention_score: float = Field(..., description="0~100 사이의 집중도 점수")
    pose_score: float = Field(..., description="0~100 사이의 자세 안정성 점수")
    gaze_distribution: dict[str, float] = Field(..., description="시선 방향별 비율")
    feedback_text: str = Field(..., description="종합 피드백 텍스트")

class FeedbackRequest(BaseModel):
    """피드백 생성 요청 데이터"""
    question: str
    answer: str
    context: Optional[str] = None

class FeedbackResponse(BaseModel):
    """피드백 생성 결과"""
    summary: str
    good_points: List[str]
    bad_points: List[str]
    follow_up_question: str
