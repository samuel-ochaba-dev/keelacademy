from extract_claims import Pipeline, PromptProvider
def test_pipeline_runs():
    p = Pipeline(PromptProvider())
    out = p.run(RECORDS)              # 20 records fixture
    assert all(o.payload for o in out)
def test_result_envelope_has_meta():
    p = Pipeline(PromptProvider())
    out = p.run(RECORDS)
    assert all("claim_id" in o.meta for o in out)
