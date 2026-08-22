from extract_claims import run, ClaimExtraction

def test_extractor_runs():
    assert callable(run)
    assert ClaimExtraction is not None
