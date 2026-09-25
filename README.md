# Travel Buddy

A full-stack, data-driven platform designed to connect solo travelers using bidirectional reciprocal matching, implicit behavioral Machine Learning re-ranking, and real-time collaboration.

---

## Table of Contents
- Problem Statement
- Key Capabilities
- Mathematical Formulation
- Machine Learning and Ranking Benchmark
- Tech Stack
- Configuration and Environment Variables
- Installation and Setup
- Testing
- License and Attribution

---

## Problem Statement

Solo travelers often face friction when attempting to find travel companions or organize shared trips. Most existing commercial platforms rely either on superficial swipe mechanics based solely on photos or on simple geographical filters.

Travel Buddy addresses this by:
- Structuring travel identity via a multi-dimensional Travel DNA profile[cite: 1].
- Formulating compatibility as an asymmetric, reciprocal relationship rather than a one-way similarity score[cite: 1].
- Augmenting declared compatibility with continuous Machine Learning re-ranking based on implicit interactions such as dwell time and bookmarking[cite: 1].

---

## Key Capabilities

- Travel DNA Profiling: Captures structured travel habits across lifestyle, interests, intentions, and logistics (pace, budget tier, planning style, accommodation)[cite: 1].
- Reciprocal Matching Engine: Computes directional compatibility scores between users, ensuring that match quality is mutual before surfacing suggestions[cite: 1].
- Crew Compatibility Scoring: Extends pairwise calculations to group dynamics, scoring applicants against active Trip Rooms to maintain group coherence[cite: 1].
- ML-Driven Feed Personalization: Continuously refines candidate feeds using behavioral signals stored and retrieved via Redis Sorted Sets[cite: 1].
- Real-Time Trip Rooms: Instant group messaging powered by Spring WebSocket and STOMP, secured via JWT during the handshake phase[cite: 1].
- AI Trip Planner: Generates context-aware, structured itineraries tailored to group budgets and activity preferences using Groq API and LLaMA 3.3[cite: 1].

---

## Mathematical Formulation

Reciprocal compatibility between user $u$ and user $v$ is modeled as a non-symmetric relation aggregated through the harmonic mean to penalize extreme imbalances:

$$R(u, v) = \frac{2 \cdot S(u \rightarrow v) \cdot S(v \rightarrow u)}{S(u \rightarrow v) + S(v \rightarrow u)}$$

Where the directional score $S(u \rightarrow v)$ is computed over four core dimensions with dimension-specific weights $w_d$ and severity penalty factors $P$:

$$S(u \rightarrow v) = \left( \sum_{d \in D} w_d \cdot \text{Sim}_d(u, v) \right) \cdot \prod_{k} P_k(u, v)$$

- Categorical Overlap: Calculated using Jaccard similarity:
  $$J(A, B) = \frac{\vert{}A \cap B\vert{}}{\vert{}A \cup B\vert{}}$$
- Scalar Attributes: Normalized distance metrics applied to budget and travel pace.
- Hard Constraint Penalties: Multiplicative reductions applied when planning styles or spending tiers conflict significantly.

---

## Machine Learning and Ranking Benchmark

Candidate feed ranking was evaluated as a continuous regression task on a 21-feature space combining declared profile metrics and implicit behavioral tracking[cite: 1].

| Model | MAE | RMSE | R2 | NDCG@5 | NDCG@10 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Decision Tree Regressor (Deployed) | 8.23 | 13.42 | 0.834 | 0.977 | 0.977 |
| Gradient Boosting | 7.24 | 11.39 | 0.881 | 0.976 | 0.976 |
| Random Forest | 6.89 | 11.87 | 0.870 | 0.976 | 0.976 |
| AdaBoost | 10.43 | 13.90 | 0.822 | 0.967 | 0.967 |
| Linear Regression | 11.67 | 15.10 | 0.790 | 0.967 | 0.967 |
| Ridge Regression | 11.69 | 15.11 | 0.790 | 0.967 | 0.967 |
| KNN Regressor | 11.61 | 16.40 | 0.753 | 0.960 | 0.961 |
| Static Baseline (No ML) | 26.77 | 30.98 | 0.117 | 0.951 | 0.952 |

Key finding: Incorporating user dwell time (`dwell_time_ms`) provided ~29% feature importance, lifting the ranking accuracy substantially over purely static profile comparisons.

---

## Tech Stack

- Backend: Java 17, Spring Boot, Spring Data JPA, Spring Security, JJWT, WebSocket/STOMP[cite: 1]
- Machine Learning and Data Pipeline: Python 3.10+, Scikit-Learn, Pandas, NumPy, Anthropic MCP Server[cite: 1]
- Caching and Persistence: PostgreSQL, Redis (Sorted Sets, Key-Value)[cite: 1]
- Frontend: React 18, Vite, Tailwind CSS, STOMP.js[cite: 1]
- External APIs: Groq API (LLaMA 3.3), Open-Meteo, OpenTripMap[cite: 1]

---

## Configuration and Environment Variables

### Backend Configuration (`backend/src/main/resources/application.properties` or system environment variables)

```text
SERVER_PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/travelbuddy
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_postgres_password
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379
JWT_SECRET=your_base64_encoded_jwt_secret_key_here
JWT_EXPIRATION_MS=86400000
GROQ_API_KEY=your_groq_api_key
