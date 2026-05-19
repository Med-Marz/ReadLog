from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/readlog.db"
    openlibrary_base_url: str = "https://openlibrary.org"
    cors_origins: str = "http://localhost:5173,http://localhost:8090"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
