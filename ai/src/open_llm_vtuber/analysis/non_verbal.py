import time
from collections import defaultdict
from .data_models import NonVerbalData, AnalysisSessionResult

class NonVerbalAggregator:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.start_time = time.time()
        self.data_points: list[NonVerbalData] = []

        # Real-time state
        self.bad_pose_streak = 0
        self.no_face_streak = 0

    def add_data(self, data: NonVerbalData) -> str | None:
        """
        데이터를 추가하고, 즉각적인 개입이 필요한 경우 피드백 메시지를 반환합니다.
        """
        self.data_points.append(data)

        # Real-time monitoring logic
        feedback = None

        # 1. 시선 이탈 감지 (3초 이상)
        if data.gaze_direction != "center" and data.face_visible:
             # 연속 이탈 체크 (단순화: 여기서는 카운터만 증가시키지 않고 바로 체크)
             # 실제로는 1초 단위 데이터이므로, 최근 3개 데이터 확인
             if len(self.data_points) >= 3:
                 recent = self.data_points[-3:]
                 if all(d.gaze_direction != "center" for d in recent):
                     feedback = "카메라를 응시해주세요."

        # 2. 자세 불량 감지
        if data.pose_status == "bad":
             self.bad_pose_streak += 1
             if self.bad_pose_streak >= 5: # 5초 이상
                 feedback = "자세를 바르게 고쳐앉아주세요."
                 self.bad_pose_streak = 0 # 알림 후 초기화
        else:
             self.bad_pose_streak = 0

        return feedback

    def finalize_session(self) -> AnalysisSessionResult:
        """세션 종료 후 통계 생성"""
        total_frames = len(self.data_points)
        if total_frames == 0:
            return AnalysisSessionResult(
                session_id=self.session_id,
                total_duration=0,
                attention_score=0,
                pose_score=0,
                gaze_distribution={},
                feedback_text="데이터가 수집되지 않았습니다."
            )

        duration = time.time() - self.start_time

        # Score Calculation
        center_gaze_count = sum(1 for d in self.data_points if d.gaze_direction == "center")
        good_pose_count = sum(1 for d in self.data_points if d.pose_status == "good")

        attention_score = (center_gaze_count / total_frames) * 100
        pose_score = (good_pose_count / total_frames) * 100

        # Distribution
        gaze_counts = defaultdict(int)
        for d in self.data_points:
            gaze_counts[d.gaze_direction] += 1

        gaze_dist = {k: v/total_frames for k, v in gaze_counts.items()}

        # Text Feedback
        feedback_lines = []
        if attention_score >= 80:
            feedback_lines.append("시선 처리가 매우 안정적입니다.")
        elif attention_score >= 50:
             feedback_lines.append("시선이 다소 불안정합니다. 카메라를 더 응시하세요.")
        else:
             feedback_lines.append("시선이 산만합니다. 주의가 필요합니다.")

        if pose_score < 70:
            feedback_lines.append("자세가 자주 흐트러집니다.")

        return AnalysisSessionResult(
            session_id=self.session_id,
            total_duration=duration,
            attention_score=round(attention_score, 1),
            pose_score=round(pose_score, 1),
            gaze_distribution=gaze_dist,
            feedback_text=" ".join(feedback_lines)
        )
