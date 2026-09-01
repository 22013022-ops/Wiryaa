# Job matching configuration

The Find Jobs recommendation endpoint uses MongoDB Atlas Vector Search only to
retrieve candidates, then computes and stores the full score locally.

Create an Atlas vector-search index named `job_description_embeddings` (or set
`MATCHING_VECTOR_INDEX`) on collection `JP_embeddings`, with the vector field
`embeddings.descriptionStructured.embedding`. It must use the same dimensions
as the `all-MiniLM-L6-v2` embeddings (384). Add `status` as a filter field.

Optional server environment variables:

- `MATCHING_CANDIDATE_LIMIT` — maximum unique jobs sent to detailed matching
  (default `100`).
- `MATCHING_RESULTS_PER_SKILL` — candidates retrieved per independent skill
  vector query (default `30`).
- `MATCHING_NLI_MODEL` — compatible Transformers.js NLI cross-encoder model.
