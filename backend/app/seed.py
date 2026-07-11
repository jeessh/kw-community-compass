"""Seed a couple of hosts (incl. an admin) and sample events.

Run:  python -m app.seed
"""

from datetime import datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models.event import Event
from app.models.event_image import EventImage
from app.models.host import Host

import app.models  # noqa: F401  (populate metadata)


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Host).first():
            print("Data already present — skipping seed.")
            return

        admin = Host(
            name="KW Hab (Admin)",
            email="admin@kwhab.org",
            password_hash=hash_password("admin123"),
            is_admin=True,
        )
        kitchen = Host(
            name="Kitchener Community Kitchen",
            email="hello@kwkitchen.org",
            password_hash=hash_password("host123"),
        )
        db.add_all([admin, kitchen])
        db.flush()

        now = datetime.now(timezone.utc)

        # 5 events across cooking, casual hangouts, and advice lessons.
        # 3 are drop-in (requires_signup=False); 2 need signup. Signup adds no
        # extra form — the member's account already holds everything the host
        # needs, so attending just records an Attendance row.
        events = [
            # --- Public / drop-in ---
            Event(
                host_id=kitchen.id,
                title="Community Soup & Bread Night",
                description=(
                    "Drop in and cook a big pot of soup together, then share it. "
                    "No experience needed — just show up hungry."
                ),
                category="Cooking",
                location="Kitchener Community Kitchen, 45 Weber St",
                starts_at=now + timedelta(days=2, hours=18),
                ends_at=now + timedelta(days=2, hours=20),
                accessibility_tags=["wheelchair_accessible", "free", "no_registration"],
                is_free=True,
                requires_signup=False,
                cover_image_url="https://placehold.co/800x400?text=Soup+Night",
            ),
            Event(
                host_id=admin.id,
                title="Saturday Coffee & Board Games",
                description=(
                    "A relaxed hangout — coffee, tea, and a shelf of board games. "
                    "Come and go as you please."
                ),
                category="Hangout",
                location="Kitchener Public Library, Central Branch",
                starts_at=now + timedelta(days=4, hours=14),
                ends_at=now + timedelta(days=4, hours=17),
                accessibility_tags=["sensory_friendly", "free", "no_registration"],
                is_free=True,
                requires_signup=False,
                cover_image_url="https://placehold.co/800x400?text=Board+Games",
            ),
            Event(
                host_id=admin.id,
                title="Ask-Me-Anything: Renting in KW",
                description=(
                    "Open advice session on tenant rights, leases, and finding a "
                    "place. Bring your questions — no appointment required."
                ),
                category="Advice",
                location="KW Hab Community Room",
                starts_at=now + timedelta(days=6, hours=13),
                ends_at=now + timedelta(days=6, hours=15),
                accessibility_tags=["wheelchair_accessible", "free", "no_registration"],
                is_free=True,
                requires_signup=False,
                cover_image_url="https://placehold.co/800x400?text=Renting+AMA",
            ),
            # --- Requires signup ---
            Event(
                host_id=kitchen.id,
                title="Hands-On Dumpling Workshop",
                description=(
                    "Learn to fold and cook dumplings from scratch. Ingredients and "
                    "a station are reserved per person, so please sign up to hold "
                    "your spot."
                ),
                category="Cooking",
                location="Kitchener Community Kitchen, 45 Weber St",
                starts_at=now + timedelta(days=8, hours=17, minutes=30),
                ends_at=now + timedelta(days=8, hours=19, minutes=30),
                accessibility_tags=["wheelchair_accessible", "free", "childcare_provided"],
                is_free=True,
                requires_signup=True,
                cover_image_url="https://placehold.co/800x400?text=Dumpling+Workshop",
            ),
            Event(
                host_id=admin.id,
                title="Resume & Job Search Clinic",
                description=(
                    "One-on-one guidance on resumes and job applications. Spots are "
                    "limited, so sign up and we'll pair you with a volunteer advisor."
                ),
                category="Advice",
                location="KW Hab Community Room",
                starts_at=now + timedelta(days=10, hours=10),
                ends_at=now + timedelta(days=10, hours=13),
                accessibility_tags=["sensory_friendly", "free"],
                is_free=True,
                requires_signup=True,
                cover_image_url="https://placehold.co/800x400?text=Resume+Clinic",
            ),
        ]
        events[0].images.append(
            EventImage(url="https://placehold.co/600x400?text=Soup", sort_order=0)
        )
        db.add_all(events)
        db.commit()
        print(
            "Seeded 2 hosts (admin@kwhab.org / admin123) and 5 events "
            "(3 drop-in, 2 signup)."
        )
    finally:
        db.close()


if __name__ == "__main__":
    run()
