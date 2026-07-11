from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    JWT_SECRET: str  # no default — pydantic raises at startup if unset
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    COOKIE_NAME: str = "kwcc_session"
    COOKIE_SECURE: bool = False

    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Path prefix the backend is served under. Empty in local dev (the frontend
    # calls http://localhost:8000 directly); set to "/api" in Vercel production,
    # where the top-level rewrite routes /api/* to this service and forwards the
    # original /api-prefixed path. FastAPI's root_path makes routes resolve
    # correctly under that prefix and fixes the /docs + OpenAPI URLs.
    ROOT_PATH: str = ""


settings = Settings()
