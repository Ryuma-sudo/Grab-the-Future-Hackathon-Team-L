from fastapi import APIRouter, HTTPException

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse
)

from app.services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/recommendation",
    tags=["AI Recommendation"]
)

recommendation_service = RecommendationService()


@router.post(
    "/route",
    response_model=RecommendationResponse
)
async def recommend_route(request: RecommendationRequest):
    """
    AI recommends the best route for the user.
    """

    try:
        result = await recommendation_service.recommend_route(request)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )