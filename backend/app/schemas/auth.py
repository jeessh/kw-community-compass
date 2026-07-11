from pydantic import BaseModel


class UserSignup(BaseModel):
    first_name: str
    last_name: str
    # The member's chosen, ordered 3-icon key. If omitted, the server allocates
    # a random unique set (legacy behaviour).
    icons: list[str] | None = None
    # Optional custom password. If omitted, the icon password is used by default.
    custom_password: str | None = None
    # Onboarding prefs (free-form slugs from the FE chip taxonomy). Optional so
    # the plain signup path keeps working; default to empty, never null.
    accessibility_prefs: list[str] = []
    interest_categories: list[str] = []


class UserLogin(BaseModel):
    username: str
    # Either the icon password ("tree_cat_apple") or the custom password.
    password: str


class HostSignup(BaseModel):
    name: str
    email: str
    password: str


class HostLogin(BaseModel):
    email: str
    password: str
