# 05 — API Specification

---

## Document Metadata

| Field           | Value                                                                                                  |
|-----------------|--------------------------------------------------------------------------------------------------------|
| Document ID     | 05-api-specification                                                                                   |
| Version         | 1.0.0                                                                                                  |
| Status          | Living Document                                                                                        |
| Created         | 2026-06-28                                                                                             |
| Last Updated    | 2026-06-28                                                                                             |
| Authors         | Founding Backend Architecture Team                                                                     |
| Audience        | Backend Engineers, Frontend Engineers, Mobile Engineers, QA, Integrators                               |
| Parent Documents| docs/00-project-vision.md, docs/01-product-requirements.md, docs/02-ai-coach-spec.md, docs/03-system-architecture.md, docs/04-database-schema.md |
| Classification  | Internal — Engineering                                                                                 |

---

## 1. Executive Summary

This document specifies the complete REST API contract for the Zyvora MVP platform. It defines all endpoints, request/response models, authentication flows, rate limits, input validation schemas, error structures, and operational semantics.

All API routes are stateless, run over HTTPS, use JSON payloads, and are versioned at the route level. This specification is designed to be fully implemented in Next.js API Routes and Supabase Edge Functions, using Supabase Auth JWT tokens for session security and identity resolution.

---

## 2. API Design Principles

### Versioning
All API endpoints are prefixed with `/api/v1`. Minor non-breaking updates preserve the version path. Breaking changes (e.g., modifying required request structures, deleting fields, or changing response codes) require a new version path (`/api/v2`).

### Consistency
- Paths are plural and represent resources (e.g., `/api/v1/workouts`).
- Query parameters use camelCase.
- JSON keys use snake_case in both request and response payloads.
- HTTP methods represent verbs: `GET` (read), `POST` (create), `PUT` (idempotent replace), `PATCH` (partial update), `DELETE` (removal).

### Security
Authentication requires a bearer token in the HTTP Authorization header: `Authorization: Bearer <JWT_TOKEN>`. The gateway verifies the token, checks claims, and extracts the user context before passing the request to domain handlers.

### Performance
Heavy resource paths (e.g., historical logs, chat transcripts) implement pagination via cursor-based query parameters. Streaming responses are utilized for conversational AI coach paths using Server-Sent Events (SSE).

### Idempotency
All mutating POST requests on transactional operations (payments, logs creation) accept a unique `Idempotency-Key` header. Requests matching an existing key within a 24-hour window return the cached response without re-executing the operation.

### Validation
Input validation occurs at the API gateway boundary using Zod schemas matching the parameters specified below. Invalid payloads fail fast, returning a `400 Bad Request` with field-specific diagnostics.

---

## 3. Authentication APIs

### 3.1 Register
* **Purpose:** Create a new user account.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/auth/register`
* **Authentication Required:** No
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "user_id": "8f8b898a-2c8c-4a3d-8f9f-68e590035171",
      "email": "user@example.com",
      "onboarding_status": "incomplete",
      "email_verified": false
    }
  }
  ```
* **Validation Rules:** Email must be a valid format. Password must be minimum 8 characters, containing 1 number, 1 uppercase, and 1 special character.
* **Possible Errors:** `AUTH-001` (Email already registered), `VAL-001` (Invalid inputs).
* **Rate Limits:** 5 requests / minute per IP.
* **Notes:** Triggers email verification workflow automatically.

---

### 3.2 Login
* **Purpose:** Authenticate credentials and issue session token.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/auth/login`
* **Authentication Required:** No
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "r1_eyJhbGci...",
      "expires_in": 900
    }
  }
  ```
* **Validation Rules:** Email and password are required.
* **Possible Errors:** `AUTH-002` (Invalid credentials), `VAL-001` (Invalid inputs).
* **Rate Limits:** 5 requests / minute per IP.
* **Notes:** Access token cookie is set by gateway under HttpOnly protection flag.

---

### 3.3 Logout
* **Purpose:** Terminate active session and invalidate refresh token.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/auth/logout`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `AUTH-003` (Invalid session).
* **Rate Limits:** 20 requests / minute per user.
* **Notes:** Invalidates the current refresh token in the database.

---

### 3.4 Refresh Token
* **Purpose:** Issue a new access token using a refresh token.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/auth/refresh`
* **Authentication Required:** No
* **Request Body:**
  ```json
  {
    "refresh_token": "r1_eyJhbGci..."
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "r2_eyJhbGci...",
      "expires_in": 900
    }
  }
  ```
* **Validation Rules:** Refresh token is required.
* **Possible Errors:** `AUTH-004` (Invalid refresh token).
* **Rate Limits:** 30 requests / minute per IP.
* **Notes:** Implements refresh token rotation. Previous refresh token is invalidated.

---

### 3.5 Forgot Password
* **Purpose:** Initiate password recovery flow.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/auth/forgot-password`
* **Authentication Required:** No
* **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Password recovery email sent if user exists."
    }
  }
  ```
* **Validation Rules:** Valid email format is required.
* **Possible Errors:** `VAL-001` (Invalid inputs).
* **Rate Limits:** 3 requests / hour per email.
* **Notes:** Fails silently (returns success response even if email is not found) to prevent user enumeration.

---

### 3.6 Reset Password
* **Purpose:** Update password using a recovery token.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/auth/reset-password`
* **Authentication Required:** No
* **Request Body:**
  ```json
  {
    "token": "rec_8a9a...",
    "new_password": "NewSecurePassword123!"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** Token is required. New password must conform to complexity rules.
* **Possible Errors:** `AUTH-005` (Invalid/expired token), `VAL-001` (Invalid inputs).
* **Rate Limits:** 5 requests / minute per IP.
* **Notes:** Revokes all active session tokens for the target user immediately upon execution.

---

### 3.7 Verify Email
* **Purpose:** Verify account email using link token.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/auth/verify-email`
* **Authentication Required:** No
* **Request Body:**
  ```json
  {
    "token": "ver_9a8b..."
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** Verification token is required.
* **Possible Errors:** `AUTH-006` (Invalid/expired verification token).
* **Rate Limits:** 10 requests / minute per IP.
* **Notes:** Updates the `email_verified` flag to true on the user's auth record.

---

### 3.8 Update Password
* **Purpose:** Change password within an active session.
* **HTTP Method:** `PATCH`
* **Route:** `/api/v1/auth/password`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "current_password": "SecurePassword123!",
    "new_password": "NewSecurePassword123!"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** Current password is required. New password must meet complexity rules.
* **Possible Errors:** `AUTH-002` (Invalid current password), `VAL-001` (Invalid inputs).
* **Rate Limits:** 3 requests / minute per user.
* **Notes:** Invalidates all sessions except the active requesting session.

---

### 3.9 Delete Account
* **Purpose:** Terminate user record and initiate full data purge.
* **HTTP Method:** `DELETE`
* **Route:** `/api/v1/auth/account`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "password": "SecurePassword123!"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** Current password verification is required.
* **Possible Errors:** `AUTH-002` (Password verification failed), `SUB-001` (Active subscription must be canceled first).
* **Rate Limits:** 1 request / minute per user.
* **Notes:** Cascades deletes through all tables and triggers async cleanup for files in object storage within 72 hours.

---

## 4. Profile APIs

### 4.1 Create Profile
* **Purpose:** Create user profile record containing biological demographics.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/profiles`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "full_name": "Marcus Aurelius",
    "date_of_birth": "1995-04-26",
    "biological_sex": "male",
    "height": 178.0,
    "current_weight": 82.5,
    "target_weight": 78.0,
    "fitness_level": "intermediate",
    "equipment_access": "gym_full"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "profile_id": "8f8b898a-2c8c-4a3d-8f9f-68e590035171",
      "full_name": "Marcus Aurelius",
      "biological_sex": "male",
      "bmi": 26.04,
      "updated_at": "2026-06-28T13:30:00Z"
    }
  }
  ```
* **Validation Rules:** Height, current_weight, and target_weight must be positive numeric values. biological_sex must be 'male' or 'female'. fitness_level must be 'beginner', 'intermediate', or 'advanced'.
* **Possible Errors:** `VAL-001` (Invalid inputs), `PROF-001` (Profile already exists).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Automatically calculates and returns calculated metrics like body mass index (BMI).

---

### 4.2 Update Profile
* **Purpose:** Modify demographics or preferences of an existing profile.
* **HTTP Method:** `PATCH`
* **Route:** `/api/v1/profiles`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "current_weight": 81.2,
    "equipment_access": "home_dumbbells",
    "injuries_list": ["Lower Back Strain"]
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "profile_id": "8f8b898a-2c8c-4a3d-8f9f-68e590035171",
      "current_weight": 81.2,
      "equipment_access": "home_dumbbells",
      "injuries_list": ["Lower Back Strain"],
      "updated_at": "2026-06-28T13:35:00Z"
    }
  }
  ```
* **Validation Rules:** Weight must be positive. equipment_access values must be from the defined config set.
* **Possible Errors:** `VAL-001` (Invalid inputs), `PROF-002` (Profile not found).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Updates downstream plan variables asynchronously if constraints like injuries are added.

---

### 4.3 Get Profile
* **Purpose:** Retrieve the active profile demographics and constraints.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/profiles`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "full_name": "Marcus Aurelius",
      "date_of_birth": "1995-04-26",
      "biological_sex": "male",
      "height": 178.0,
      "current_weight": 81.2,
      "target_weight": 78.0,
      "fitness_level": "intermediate",
      "equipment_access": "home_dumbbells",
      "injuries_list": ["Lower Back Strain"],
      "dietary_restrictions": []
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `PROF-002` (Profile not found).
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** None.

---

### 4.4 Delete Profile
* **Purpose:** Delete profile details (retains auth user configuration).
* **HTTP Method:** `DELETE`
* **Route:** `/api/v1/profiles`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `PROF-002` (Profile not found).
* **Rate Limits:** 2 requests / minute per user.
* **Notes:** Blocks dashboard access and resets the onboarding state.

---

## 5. Onboarding APIs

### 5.1 Save Answers
* **Purpose:** Store answers from onboarding steps incrementally to support wizard states.
* **HTTP Method:** `PUT`
* **Route:** `/api/v1/onboarding/answers`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "step_id": 3,
    "payload": {
      "experience_level": "beginner",
      "training_frequency": 3,
      "dietary_preferences": ["vegan"]
    }
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "step_id": 3,
      "saved_at": "2026-06-28T13:40:00Z"
    }
  }
  ```
* **Validation Rules:** step_id must be between 1 and 4. Payload must match target validation schemas for that step.
* **Possible Errors:** `VAL-001` (Invalid payloads).
* **Rate Limits:** 20 requests / minute per user.
* **Notes:** Persisted in user context cache.

---

### 5.2 Resume Onboarding
* **Purpose:** Retrieve previously saved wizard steps to resume onboarding.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/onboarding/resume`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "last_completed_step": 3,
      "saved_answers": {
        "1": { "age": 31, "gender": "male" },
        "2": { "primary_goal": "fat_loss" },
        "3": { "experience_level": "beginner", "training_frequency": 3 }
      }
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** Returns 200 with empty fields if onboarding is being started for the first time.

---

### 5.3 Complete Onboarding
* **Purpose:** Verify completion of onboarding details and trigger initial plan creation.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/onboarding/complete`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "onboarding_status": "completed",
      "generated_plan_id": "4d8a56b7-8822-4212-9c3f-c603b55a0f21"
    }
  }
  ```
* **Validation Rules:** Checks that all onboarding steps have validated entries stored.
* **Possible Errors:** `ONB-001` (Incomplete onboarding answers).
* **Rate Limits:** 2 requests / minute per user.
* **Notes:** Triggers workout and nutrition planners background jobs synchronously before response resolving.

---

## 6. Physique Upload APIs

### 6.1 Upload Photo
* **Purpose:** Upload a physique photo to storage.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/physique/photos`
* **Authentication Required:** Yes
* **Request Body:** Multipart/form-data (front, side, and back image files).
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "photo_set_id": "992a5f78-2d8a-4422-921e-128a1c893f41",
      "front_url": "https://storage.zyvora.com/physique-photos/..._front.webp",
      "side_url": "https://storage.zyvora.com/physique-photos/..._side.webp",
      "back_url": "https://storage.zyvora.com/physique-photos/..._back.webp",
      "created_at": "2026-06-28T13:45:00Z"
    }
  }
  ```
* **Validation Rules:** Files must be image/jpeg, image/png, or image/webp. Maximum file size is 10MB per file.
* **Possible Errors:** `UPL-001` (Unsupported file type), `UPL-002` (File size limit exceeded).
* **Rate Limits:** 3 requests / hour per user.
* **Notes:** Requires all three image fields to be provided. Client must blur faces before transmission.

---

### 6.2 Delete Photo
* **Purpose:** Remove a physique photo set.
* **HTTP Method:** `DELETE`
* **Route:** `/api/v1/physique/photos/{photo_set_id}`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** photo_set_id must be a valid UUID.
* **Possible Errors:** `UPL-003` (Photo set not found).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Deletes both the database records and the corresponding raw assets in object storage.

---

### 6.3 List Photos
* **Purpose:** Retrieve history of photo uploads.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/physique/photos`
* **Authentication Required:** Yes
* **Request Body:** None (Supports standard page limits query params).
* **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      {
        "photo_set_id": "992a5f78-2d8a-4422-921e-128a1c893f41",
        "created_at": "2026-06-28T13:45:00Z",
        "urls": {
          "front": "https://storage.zyvora.com/...",
          "side": "https://storage.zyvora.com/...",
          "back": "https://storage.zyvora.com/..."
        }
      }
    ]
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 20 requests / minute per user.
* **Notes:** Emits short-lived presigned URLs with 10-minute expiry boundaries.

---

### 6.4 Start Analysis
* **Purpose:** Trigger AI visual model calculation on an uploaded photo set.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/physique/analysis`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "photo_set_id": "992a5f78-2d8a-4422-921e-128a1c893f41"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "analysis_job_id": "job_a7b92138...",
      "status": "processing",
      "eta_seconds": 15
    }
  }
  ```
* **Validation Rules:** photo_set_id is required.
* **Possible Errors:** `UPL-003` (Photo set not found), `AI-001` (Model connection failed).
* **Rate Limits:** 5 requests / hour per user.
* **Notes:** Asynchronous execution. Client polls status endpoint or subscribes via web sockets.

---

### 6.5 Check Analysis Status
* **Purpose:** Retrieve current computation status of visual analysis job.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/physique/analysis/status/{analysis_job_id}`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "analysis_job_id": "job_a7b92138...",
      "status": "completed",
      "result_id": "res_d9a8b2..."
    }
  }
  ```
* **Validation Rules:** Valid analysis_job_id structure is required.
* **Possible Errors:** `AI-002` (Job ID not found).
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** Status enum values: 'queued', 'processing', 'completed', 'failed'.

---

### 6.6 Retrieve Analysis
* **Purpose:** Fetch the output metrics calculated by visual analysis.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/physique/analysis/{analysis_id}`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "analysis_id": "res_d9a8b2...",
      "photo_set_id": "992a5f78-2d8a-4422-921e-128a1c893f41",
      "estimated_body_fat": 18.5,
      "confidence_interval": 2.0,
      "waist_to_hip_ratio": 0.85,
      "muscle_synthesis": "Symmetrical development. Slight postural shift detected (anterior pelvic tilt). Balance of shoulder-to-waist ratio is normal.",
      "created_at": "2026-06-28T13:46:00Z"
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `AI-003` (Analysis record not found).
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** Includes full visual analysis metrics required by planners.

---

## 7. AI Coach APIs

### 7.1 Start Conversation
* **Purpose:** Initialize a new chat session context.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/coach/conversation`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "conversation_id": "conv_9a8b1c...",
      "created_at": "2026-06-28T13:50:00Z",
      "welcome_message": "Hello Marcus. I've loaded your context. Your chest volume last week was consistent. How can I help you adjust your target today?"
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Checks active log gaps or milestone events to synthesize the dynamic custom welcome message.

---

### 7.2 Continue Conversation
* **Purpose:** Send query to the coach and receive a streamed Markdown response (via Server-Sent Events).
* **HTTP Method:** `POST`
* **Route:** `/api/v1/coach/conversation/{conversation_id}`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "message": "My shoulder feels tight during overhead presses."
  }
  ```
* **Response Body:** Chunked Server-Sent Events containing token strings.
  ```
  data: {"token": "Based"}
  data: {"token": " on"}
  ...
  data: [DONE]
  ```
* **Validation Rules:** message cannot be empty or exceed 1000 characters.
* **Possible Errors:** `AI-004` (Context payload timeout), `AI-005` (Safety boundary triggered).
* **Rate Limits:** 20 requests / minute per user.
* **Notes:** Triggers safety pre-processing before execution. Promotes memory vectors post-session completion asynchronously.

---

### 7.3 Retrieve Chat History
* **Purpose:** Fetch historical message logs for a conversation.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/coach/conversation/{conversation_id}`
* **Authentication Required:** Yes
* **Request Body:** None (Supports query parameters `limit` and `cursor`).
* **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      {
        "message_id": "msg_123a...",
        "sender": "user",
        "content": "My shoulder feels tight during overhead presses.",
        "created_at": "2026-06-28T13:51:00Z"
      },
      {
        "message_id": "msg_124b...",
        "sender": "assistant",
        "content": "Let's swap overhead presses for lateral raises.",
        "created_at": "2026-06-28T13:51:05Z"
      }
    ],
    "pagination": {
      "next_cursor": "msg_124b..."
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `AI-006` (Conversation not found).
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** paginated message logs retrieval.

---

### 7.4 Delete Chat
* **Purpose:** Invalidate and delete history metrics for a chat session.
* **HTTP Method:** `DELETE`
* **Route:** `/api/v1/coach/conversation/{conversation_id}`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `AI-006` (Conversation not found).
* **Rate Limits:** 5 requests / minute per user.
* **Notes:** Erases raw transcript details from the database (does not delete promoted long-term memory metrics).

---

### 7.5 Regenerate Response
* **Purpose:** Instruct the AI Coach to regenerate the last output using updated parameters or alternative selections.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/coach/conversation/{conversation_id}/regenerate`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:** Chunked Server-Sent Events containing token strings.
* **Validation Rules:** None.
* **Possible Errors:** `AI-006` (Conversation not found), `AI-004` (Model error).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Utilizes temperature alterations or alternative prompts to generate a new explanation path.

---

## 8. Workout APIs

### 8.1 Generate Plan
* **Purpose:** Trigger algorithmic generation of a new multi-week workout program.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/workouts/plan`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "preferences": {
      "frequency_days": 4,
      "equipment_access": "gym_full"
    }
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "plan_id": "4d8a56b7-8822-4212-9c3f-c603b55a0f21",
      "block_number": 1,
      "start_date": "2026-06-29",
      "end_date": "2026-07-27",
      "weeks_count": 4,
      "exercises_summary": ["Barbell Bench Press", "Squat", "Pull-up"]
    }
  }
  ```
* **Validation Rules:** frequency_days must be between 2 and 6.
* **Possible Errors:** `VAL-001` (Invalid params), `WK-001` (Active plan already running).
* **Rate Limits:** 2 requests / hour per user.
* **Notes:** None.

---

### 8.2 Retrieve Plan
* **Purpose:** Fetch the active workout plan including schedules, movements, and rep targets.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/workouts/plan/active`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "plan_id": "4d8a56b7-8822-4212-9c3f-c603b55a0f21",
      "weeks": [
        {
          "week_number": 1,
          "days": [
            {
              "session_id": "sess_89aa...",
              "name": "Push Day A",
              "exercises": [
                {
                  "exercise_id": "ex_8b8b...",
                  "name": "Dumbbell Press",
                  "sets": [
                    { "set_number": 1, "target_reps": 10, "target_weight": 24.0, "target_rpe": 8 }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `WK-002` (No active plan found).
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** None.

---

### 8.3 Regenerate Plan
* **Purpose:** Trigger recreation of active block due to major parameter updates.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/workouts/plan/regenerate`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "reason": "injury_reported"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "new_plan_id": "6a7b821a-289c-4f11..."
    }
  }
  ```
* **Validation Rules:** Reason parameter required.
* **Possible Errors:** `WK-002` (No active plan found), `AI-001` (Model connection failed).
* **Rate Limits:** 2 requests / hour per user.
* **Notes:** Inactivates current active plan block and generates a replacement.

---

### 8.4 Complete Workout
* **Purpose:** Mark a scheduled workout session as completed.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/workouts/sessions/{session_id}/complete`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "fatigue_rating": 3,
    "duration_minutes": 55,
    "notes": "Felt good, slight knee stiffness."
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "session_id": "sess_89aa...",
      "completed_at": "2026-06-28T13:55:00Z"
    }
  }
  ```
* **Validation Rules:** fatigue_rating must be between 1 and 5.
* **Possible Errors:** `WK-003` (Session record not found).
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** Triggers daily status completion checks on user dashboard.

---

### 8.5 Log Exercise
* **Purpose:** Submit sets, actual reps, and loads accomplished for an exercise.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/workouts/sessions/{session_id}/exercises/{exercise_id}/log`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "sets": [
      {
        "set_number": 1,
        "actual_reps": 10,
        "actual_weight": 24.0,
        "actual_rpe": 8.0
      }
    ]
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "logged_sets_count": 1,
      "session_volume": 240.0
    }
  }
  ```
* **Validation Rules:** actual_reps and actual_weight values must be non-negative values.
* **Possible Errors:** `WK-003` (Session or exercise not found), `VAL-001` (Invalid parameters).
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** Saves logs matching set configurations.

---

## 9. Nutrition APIs

### 9.1 Generate Nutrition Plan
* **Purpose:** Trigger calculation of new caloric targets and macro allocations.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/nutrition/plan`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "nutrition_plan_id": "nut_7a8b9c...",
      "target_calories": 2400,
      "target_protein": 180,
      "target_carbs": 240,
      "target_fat": 80,
      "target_hydration": 3.0,
      "rationale": "Slight deficit calculated matching the fat loss target."
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `NUT-001` (Failed to generate plan).
* **Rate Limits:** 5 requests / hour per user.
* **Notes:** Integrates metabolic logic checks using user demographics.

---

### 9.2 Retrieve Nutrition Plan
* **Purpose:** Fetch the active nutrition configurations.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/nutrition/plan/active`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "nutrition_plan_id": "nut_7a8b9c...",
      "target_calories": 2400,
      "target_protein": 180,
      "target_carbs": 240,
      "target_fat": 80,
      "target_hydration": 3.0,
      "meals": [
        {
          "meal_id": "meal_1a2b...",
          "name": "Breakfast",
          "target_calories": 600,
          "target_protein": 45,
          "target_carbs": 60,
          "target_fat": 20
        }
      ]
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `NUT-002` (No active nutrition plan found).
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** None.

---

### 9.3 Update Preferences
* **Purpose:** Modify food limits or dietary goals.
* **HTTP Method:** `PATCH`
* **Route:** `/api/v1/nutrition/preferences`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "dietary_restrictions": ["vegan"],
    "hydration_reminder_enabled": true
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "dietary_restrictions": ["vegan"],
      "updated_at": "2026-06-28T13:58:00Z"
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `VAL-001` (Invalid preferences).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Recalculates macronutrient splits to match restrictions.

---

### 9.4 Log Meal
* **Purpose:** Log a food consumption entry matching a designated meal block.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/nutrition/meals/{meal_id}/log`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "food_items": [
      {
        "description": "Oatmeal",
        "serving_size_g": 100.0,
        "protein_g": 12.0,
        "carbs_g": 68.0,
        "fat_g": 6.0,
        "calories": 380
      }
    ]
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "meal_logged_id": "ml_9a8b...",
      "calories_logged": 380
    }
  }
  ```
* **Validation Rules:** Food metrics must be positive numbers.
* **Possible Errors:** `VAL-001` (Invalid inputs), `NUT-003` (Meal record not found).
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** Increments the user's progress bar counters for daily calorie metrics.

---

## 10. Progress APIs

### 10.1 Upload Progress Photo
* **Purpose:** Upload progress images to historical archive bucket.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/progress/photos`
* **Authentication Required:** Yes
* **Request Body:** Multipart/form-data (front, side, or back images).
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "progress_photo_id": "pp_8a9a...",
      "url": "https://storage.zyvora.com/progress-photos/...",
      "created_at": "2026-06-28T14:00:00Z"
    }
  }
  ```
* **Validation Rules:** Image format and size restrictions apply.
* **Possible Errors:** `UPL-001` (Unsupported format), `UPL-002` (Limit exceeded).
* **Rate Limits:** 10 requests / hour per user.
* **Notes:** Independent from the onboarding analysis photo set.

---

### 10.2 Log Weight
* **Purpose:** Create daily physical weight check entry.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/progress/weight`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "weight_kg": 80.5,
    "date": "2026-06-28"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "weight_log_id": "wl_7a8b...",
      "weight_kg": 80.5,
      "date": "2026-06-28"
    }
  }
  ```
* **Validation Rules:** Weight must be positive. Date cannot be in the future.
* **Possible Errors:** `VAL-001` (Invalid parameters).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Overwrites value if entry for target date already exists.

---

### 10.3 Log Measurements
* **Purpose:** Submit tape measurement checks.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/progress/measurements`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "waist_cm": 88.0,
    "chest_cm": 102.5,
    "arms_left_cm": 38.0,
    "arms_right_cm": 38.2
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "measurement_id": "ms_9a8b...",
      "waist_cm": 88.0,
      "updated_at": "2026-06-28T14:02:00Z"
    }
  }
  ```
* **Validation Rules:** All input dimensions must be positive numeric values.
* **Possible Errors:** `VAL-001` (Invalid inputs).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** None.

---

### 10.4 Retrieve Progress
* **Purpose:** Get historical log sets mapping weights, volume, and measurements over time.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/progress`
* **Authentication Required:** Yes
* **Request Body:** None (Supports query parameters `range` e.g., '30d', '90d').
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "weight_history": [
        { "date": "2026-06-28", "weight_kg": 80.5 }
      ],
      "workout_volume_history": [
        { "date": "2026-06-28", "volume": 1240.0 }
      ]
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** Returns cached aggregation data.

---

### 10.5 Compare Analyses
* **Purpose:** Fetch a comparison matrix between two physical analyses.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/progress/compare`
* **Authentication Required:** Yes
* **Request Body:** None (Requires query parameters `basis_id` and `target_id`).
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "body_fat_delta": -2.1,
      "weight_delta_kg": -3.5,
      "waist_to_hip_delta": -0.02,
      "analysis_synthesis": "Progress shows lean mass retention during deficit."
    }
  }
  ```
* **Validation Rules:** Both UUID targets must exist.
* **Possible Errors:** `VAL-001` (Invalid references).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** None.

---

## 11. Dashboard APIs

### 11.1 Today's Summary
* **Purpose:** Fetch the checklist, status tracking bars, and target lists for today's dashboard.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/dashboard/summary`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-06-28",
      "workout": {
        "scheduled": true,
        "session_id": "sess_89aa...",
        "name": "Push Day A",
        "completed": false
      },
      "nutrition": {
        "calories": { "target": 2400, "logged": 1200 },
        "protein": { "target": 180, "logged": 90 }
      },
      "weekly_checkin_pending": false
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** Main endpoint hit at application load state.

---

### 11.2 Insights
* **Purpose:** Fetch system-generated highlights or coaching notes.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/dashboard/insights`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "highlights": [
        "You've hit your protein targets for 5 consecutive days."
      ],
      "coaching_tip": "Focus on recovery sleep: your logged sleep has averaged 6.2 hours this week."
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** Cache refreshed daily.

---

### 11.3 Upcoming Workouts
* **Purpose:** Fetch next three sessions on target training calendar.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/dashboard/workouts/upcoming`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      { "session_id": "sess_90bb...", "name": "Pull Day A", "scheduled_date": "2026-06-30" }
    ]
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** None.

---

### 11.4 Statistics
* **Purpose:** Retrieve aggregated volume, frequency, and macro stats.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/dashboard/statistics`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "compliance_rate": 88.5,
      "total_sessions_completed": 12,
      "average_macro_adherence": 91.0
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 30 requests / minute per user.
* **Notes:** None.

---

## 12. Notification APIs

### 12.1 List Notifications
* **Purpose:** Fetch queue alerts and messages.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/notifications`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      {
        "notification_id": "not_9a8b...",
        "title": "Check-In Ready",
        "body": "Your weekly coaching check-in is now open.",
        "read": false,
        "created_at": "2026-06-28T08:00:00Z"
      }
    ]
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** None.

---

### 12.2 Mark Read
* **Purpose:** Change state of a notification to read.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/notifications/{notification_id}/read`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": null
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `NOT-001` (Notification not found).
* **Rate Limits:** 60 requests / minute per user.
* **Notes:** None.

---

### 12.3 Preferences
* **Purpose:** Update channel configuration routes.
* **HTTP Method:** `PATCH`
* **Route:** `/api/v1/notifications/preferences`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "email_enabled": true,
    "push_enabled": false
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "email_enabled": true,
      "push_enabled": false
    }
  }
  ```
* **Validation Rules:** Boolean variables required.
* **Possible Errors:** `VAL-001` (Invalid parameter types).
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** None.

---

## 13. Subscription APIs

### 13.1 Plans
* **Purpose:** Retrieve active billing matrices.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/subscriptions/plans`
* **Authentication Required:** No
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      {
        "plan_id": "plan_prem_monthly",
        "name": "Premium Monthly",
        "price": 29.99,
        "currency": "USD",
        "interval": "month"
      }
    ]
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 30 requests / minute per IP.
* **Notes:** Static product payload.

---

### 13.2 Subscribe
* **Purpose:** Initialize checkout routing and retrieve Stripe session.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/subscriptions/subscribe`
* **Authentication Required:** Yes
* **Request Body:**
  ```json
  {
    "plan_id": "plan_prem_monthly"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "stripe_checkout_url": "https://checkout.stripe.com/..."
    }
  }
  ```
* **Validation Rules:** Valid plan_id required.
* **Possible Errors:** `SUB-002` (Plan ID not found), `SUB-003` (User already has active subscription).
* **Rate Limits:** 5 requests / minute per user.
* **Notes:** Redirects user to Stripe hosted checkout page client-side.

---

### 13.3 Cancel
* **Purpose:** Terminate subscription auto-renewal features.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/subscriptions/cancel`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "canceled_at_period_end": true,
      "expiry_date": "2026-07-28T13:30:00Z"
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `SUB-004` (No active subscription found).
* **Rate Limits:** 5 requests / minute per user.
* **Notes:** Keeps access live until current period end date.

---

### 13.4 Billing History
* **Purpose:** Fetch listing of payments and invoices.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/subscriptions/billing`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      {
        "invoice_id": "in_1234...",
        "amount": 29.99,
        "date": "2026-06-28T13:30:00Z",
        "status": "paid"
      }
    ]
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** None.
* **Rate Limits:** 10 requests / minute per user.
* **Notes:** Fetches list directly from Stripe cache database.

---

### 13.5 Restore Purchase
* **Purpose:** Re-sync billing receipts in case of webhooks dropouts.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/subscriptions/restore`
* **Authentication Required:** Yes
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "status": "restored",
      "tier": "premium"
    }
  }
  ```
* **Validation Rules:** None.
* **Possible Errors:** `SUB-005` (No purchase transaction found).
* **Rate Limits:** 3 requests / minute per user.
* **Notes:** Directly queries Stripe API using customer identifier mapping.

---

## 14. Admin APIs

### 14.1 Dashboard
* **Purpose:** Fetch system status overview metrics.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/admin/dashboard`
* **Authentication Required:** Yes (Admin role required)
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "active_users": 1420,
      "mrr_usd": 38400.0,
      "system_errors_last_hour": 2
    }
  }
  ```
* **Validation Rules:** Verifies requester role claim in JWT.
* **Possible Errors:** `AUTH-007` (Access denied).
* **Rate Limits:** 30 requests / minute per admin.
* **Notes:** None.

---

### 14.2 Users
* **Purpose:** Search and return list of customer registration profiles.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/admin/users`
* **Authentication Required:** Yes (Admin role required)
* **Request Body:** None (Supports query parameters `email` or `status`).
* **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      { "user_id": "8f8b898a...", "email": "user@example.com", "tier": "premium" }
    ]
  }
  ```
* **Validation Rules:** Role claim validation.
* **Possible Errors:** `AUTH-007` (Access denied).
* **Rate Limits:** 30 requests / minute per admin.
* **Notes:** None.

---

### 14.3 Reports
* **Purpose:** Retrieve system log summaries.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/admin/reports`
* **Authentication Required:** Yes (Admin role required)
* **Request Body:** None (Requires query parameters `type` and `date_range`).
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "report_url": "https://storage.zyvora.com/admin-reports/..."
    }
  }
  ```
* **Validation Rules:** Role claim validation.
* **Possible Errors:** `AUTH-007` (Access denied).
* **Rate Limits:** 10 requests / minute per admin.
* **Notes:** None.

---

### 14.4 Analytics
* **Purpose:** Fetch metrics aggregated from partitioned events tables.
* **HTTP Method:** `GET`
* **Route:** `/api/v1/admin/analytics`
* **Authentication Required:** Yes (Admin role required)
* **Request Body:** None
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "conversion_funnel": { "registered": 100, "onboarded": 85, "subscribed": 15 }
    }
  }
  ```
* **Validation Rules:** Role claim validation.
* **Possible Errors:** `AUTH-007` (Access denied).
* **Rate Limits:** 20 requests / minute per admin.
* **Notes:** Queries precalculated analytics dashboard cache.

---

### 14.5 Moderation
* **Purpose:** Override plan elements or disable flagged profiles.
* **HTTP Method:** `POST`
* **Route:** `/api/v1/admin/moderation/user/{user_id}/suspend`
* **Authentication Required:** Yes (Admin role required)
* **Request Body:**
  ```json
  {
    "reason": "TOS violation - unsafe uploads"
  }
  ```
* **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "user_id": "8f8b898a...",
      "status": "suspended"
    }
  }
  ```
* **Validation Rules:** User ID must exist. Reason must be provided.
* **Possible Errors:** `AUTH-007` (Access denied), `ADM-001` (User ID not found).
* **Rate Limits:** 20 requests / minute per admin.
* **Notes:** Revokes active login sessions immediately.

---

## 15. Common Response Format

### Success
```json
{
  "success": true,
  "data": {
    "key": "value"
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "AUTH-002",
    "message": "Invalid authentication credentials."
  }
}
```

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VAL-001",
    "message": "Input validation failed.",
    "details": [
      { "field": "email", "issue": "Invalid email address format." }
    ]
  }
}
```

### Pagination Meta
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "limit": 20,
    "next_cursor": "uuid_cursor_value",
    "has_more": true
  }
}
```

---

## 16. Error Codes

### Authentication & Authorization
- `AUTH-001` — Email address is already registered.
- `AUTH-002` — Invalid credentials or login checks failed.
- `AUTH-003` — Session is invalid or has expired.
- `AUTH-004` — Invalidation checks on refresh token failed.
- `AUTH-005` — Password reset token expired or was modified.
- `AUTH-006` — Verification link has expired.
- `AUTH-007` — Requester does not hold the permissions required.

### Validation
- `VAL-001` — Schema validation failed on input values.

### AI Errors
- `AI-001` — Model api connection timeout.
- `AI-002` — Target job ID was not found in processing queues.
- `AI-003` — Analysis results file could not be read or recovered.
- `AI-004` — Reasoning generator encountered a processing failure.
- `AI-005` — Safety rules checks flagged input values.
- `AI-006` — Conversation context trace does not match user mapping.

### Upload Errors
- `UPL-001` — File type does not match supported formats.
- `UPL-002` — Uploaded data exceeds transmission limit parameters.
- `UPL-003` — File resource ID was not found in storage.

### Subscription Errors
- `SUB-001` — Operation blocked by an active transaction.
- `SUB-002` — Selected subscription plan ID does not exist.
- `SUB-003` — User account already has active billing status.
- `SUB-004` — Subscriptions records are not found for user.
- `SUB-005` — Re-verification query failed.

### Server Errors
- `SRV-001` — Unhandled database runtime exception.
- `SRV-002` — Third-party service is unreachable.

---

## 17. Rate Limiting Strategy

| Category | Limit Defaults | Enforcement Layer |
|----------|----------------|-------------------|
| Public Authentication | 5 requests / min per IP | API Gateway Middleware |
| Conversational Chat | 20 requests / min per User | Route Handler Logic |
| Image Upload Tasks | 3 uploads / hour per User | API Route Logic |
| Standard Logs Logging | 60 requests / min per User | Route Handler Logic |
| Reading Transactions | 100 requests / min per User | Global Middleware Config |

---

## 18. Security Considerations

- **JWT Session Security:** Access tokens are signed using a HS256 secret. Signature validation occurs before parsing payload claims.
- **Input Sanitization:** String inputs are validated by strict Zod constraint matches. String lengths are restricted to prevent memory attacks.
- **Authorization Contexts:** Query operations scope target statements to user IDs resolved directly from verified session tokens. Client-provided user variables are ignored on user-facing paths.
- **Upload Guards:** Upload files must match target MIME types and be verified by image header checks (verifying the file starts with magic bytes of JPG, PNG, or WebP).

---

## 19. Requirement IDs

| ID | Requirement Summary |
|----|---------------------|
| API-001 | The API must return consistent payload formats for successes, validation failures, and generic errors. |
| API-002 | Access tokens must be verified using JWT signature validation before route processing. |
| API-003 | All mutating requests must check input values using validation schemas before domain services routing. |
| API-004 | Idempotency headers must prevent duplicate executions on payment and check-in paths. |
| API-005 | Conversational coach chats must support streaming SSE channels. |
| API-006 | Admin endpoints must block queries lacking validated role claims. |
| API-007 | Rate limiting gates must protect authentication routes from brute force attacks. |
| API-008 | Image upload paths must validate MIME types and file sizes before persisting data. |

---

## 20. Cross References

- **Project Vision:** [docs/00-project-vision.md](file:///f:/zyvora/docs/00-project-vision.md) — Product requirements and goals.
- **Product Requirements Document:** [docs/01-product-requirements.md](file:///f:/zyvora/docs/01-product-requirements.md) — Functional and non-functional specifications.
- **AI Coach Specification:** [docs/02-ai-coach-spec.md](file:///f:/zyvora/docs/02-ai-coach-spec.md) — AI behavioral patterns.
- **System Architecture:** [docs/03-system-architecture.md](file:///f:/zyvora/docs/03-system-architecture.md) — Multi-tier topology.
- **Database Schema:** [docs/04-database-schema.md](file:///f:/zyvora/docs/04-database-schema.md) — Structured entities.
