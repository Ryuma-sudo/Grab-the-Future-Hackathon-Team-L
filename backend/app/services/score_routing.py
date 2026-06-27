def compute_weighted_score(    
  availability_flag: int,          # 1 if vehicile is available
  availability_score: float,       # 0.0 - 1.0
  battery_flag: float,            # 0.0 - 1.0
  additional_length_score: float,  # 0.0 - 1.0
  confidence_score: float) -> float:         # 0.0 - 1.0
    
    base_score = (
        50 * availability_score
        + 30 * additional_length_score
        + 20 * confidence_score
    )

    availability_bonus = (availability_flag + battery_flag) * 1000

    return availability_bonus + base_score

def compute_availability_score():
    pass


def compute_additional_length_score():
    pass


def compute_confidence_score():
    pass