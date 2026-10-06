"""Idempotent seed for AJ Heaven's Harvest Nursery.

Run: cd /app/backend && python seed.py
Catalog, services, projects, plans are hand-written copy; location-page content is
AI-generated once per location (with a hand-written fallback if the LLM is unavailable).
"""

import asyncio
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from lib.ai import complete_json, new_session  # noqa: E402
from lib.db import db, ensure_indexes  # noqa: E402

IMG = {
    "hero": "https://images.unsplash.com/photo-1598902468171-0f50e32a7bf2?crop=entropy&cs=srgb&fm=jpg&q=85",
    "rooftop": "https://images.unsplash.com/photo-1776363284806-873eeef565a7?crop=entropy&cs=srgb&fm=jpg&q=85",
    "rooftop_aerial": "https://images.unsplash.com/photo-1543812226-32a17800526b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "vertical_wall": "https://images.unsplash.com/photo-1764705639956-801d5b6ef197?crop=entropy&cs=srgb&fm=jpg&q=85",
    "indoor_styling": "https://images.unsplash.com/photo-1626965654957-fef1cb80d4b7?crop=entropy&cs=srgb&fm=jpg&q=85",
    "nursery_walkway": "https://images.unsplash.com/photo-1599334064100-4d3a0cc7332c?crop=entropy&cs=srgb&fm=jpg&q=85",
    "nursery_shelf": "https://images.unsplash.com/photo-1683994851774-6e9642fb8a95?crop=entropy&cs=srgb&fm=jpg&q=85",
    "monstera_pot": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "monstera_leaves": "https://images.unsplash.com/photo-1525498128493-380d1990a112?crop=entropy&cs=srgb&fm=jpg&q=85",
    "bamboo": "https://images.unsplash.com/photo-1619423089884-bc5b70bc4e2c?crop=entropy&cs=srgb&fm=jpg&q=85",
    "fern": "https://images.unsplash.com/photo-1604866830513-d54766457f45?crop=entropy&cs=srgb&fm=jpg&q=85",
    "cactus_white": "https://images.unsplash.com/photo-1613372998667-b83ab5bbe081?crop=entropy&cs=srgb&fm=jpg&q=85",
    "cactus_tall": "https://images.unsplash.com/photo-1788145748892-86bdf8b1139d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "succulent_trio": "https://images.unsplash.com/photo-1771164042535-2ca252201c7a?crop=entropy&cs=srgb&fm=jpg&q=85",
    "succulent_table": "https://images.pexels.com/photos/7208488/pexels-photo-7208488.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "succulent_row": "https://images.pexels.com/photos/36620948/pexels-photo-36620948.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "hanging_balcony": "https://images.unsplash.com/photo-1765775585873-868ae680fc26?crop=entropy&cs=srgb&fm=jpg&q=85",
    "flowers_terra": "https://images.unsplash.com/photo-1781819856713-5ff9f5353464?crop=entropy&cs=srgb&fm=jpg&q=85",
    "pots_railing": "https://images.unsplash.com/photo-1761594521497-09c98039d761?crop=entropy&cs=srgb&fm=jpg&q=85",
    "balcony_flowers": "https://images.unsplash.com/photo-1772544547403-054bbff0a7dc?crop=entropy&cs=srgb&fm=jpg&q=85",
    "bonsai_maple": "https://images.unsplash.com/photo-1641412722397-3be359096577?crop=entropy&cs=srgb&fm=jpg&q=85",
    "bonsai_ficus": "https://images.unsplash.com/photo-1526397751294-331021109fbd?crop=entropy&cs=srgb&fm=jpg&q=85",
    "bonsai_ginseng": "https://images.unsplash.com/photo-1467043198406-dc953a3defa0?crop=entropy&cs=srgb&fm=jpg&q=85",
    "bonsai_banyan": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?crop=entropy&cs=srgb&fm=jpg&q=85",
    "terrace_hanging": "https://images.unsplash.com/photo-1765558290832-f50b7fab8f36?crop=entropy&cs=srgb&fm=jpg&q=85",
    "estate_lake": "https://images.unsplash.com/photo-1585663865555-a78a1411f45b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "palm_pair": "https://images.unsplash.com/photo-1711477300788-9f0ef313091d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "desert_rose": "https://images.unsplash.com/photo-1705776859776-b8e5c84ca158?crop=entropy&cs=srgb&fm=jpg&q=85",
}

PLANTS = [
    {"slug": "monstera-deliciosa", "name": "Monstera Deliciosa", "category": "indoor", "tags": ["tropical", "statement"], "price": 899, "sunlight": "medium", "maintenance": "medium", "locations": ["living_room", "balcony", "office"], "description": "The iconic split-leaf philodendron — a bold tropical statement that thrives in Gurgaon's bright indirect light. Instant jungle energy for living rooms and office corners.", "image_url": IMG["monstera_pot"], "badges": ["air_purifying"]},
    {"slug": "split-leaf-philodendron", "name": "Split-Leaf Philodendron", "category": "indoor", "tags": ["tropical"], "price": 1299, "sunlight": "medium", "maintenance": "low", "locations": ["living_room", "office"], "description": "Architectural foliage that forgives missed waterings. One of the easiest large-leaf plants for Gurgaon apartments.", "image_url": IMG["monstera_leaves"], "badges": ["air_purifying", "hardy"]},
    {"slug": "lucky-bamboo", "name": "Lucky Bamboo (Dracaena)", "category": "indoor", "tags": ["vastu", "gift"], "price": 299, "sunlight": "low", "maintenance": "low", "locations": ["bedroom", "office", "living_room"], "description": "Grows in water, tolerates fluorescent light and survives long office weekends. A classic gift and desk plant.", "image_url": IMG["bamboo"], "badges": ["pet_safe", "night_oxygen"]},
    {"slug": "boston-fern", "name": "Boston Fern Collection", "category": "indoor", "tags": ["fern", "humidifier"], "price": 399, "sunlight": "medium", "maintenance": "medium", "locations": ["balcony", "living_room"], "description": "Feathery fronds that love Gurgaon's monsoon humidity and quietly raise humidity in air-conditioned rooms.", "image_url": IMG["fern"], "badges": ["air_purifying", "pet_safe"]},
    {"slug": "areca-palm", "name": "Areca Palm", "category": "indoor", "tags": ["palm", "large"], "price": 699, "sunlight": "medium", "maintenance": "low", "locations": ["balcony", "living_room", "terrace"], "description": "The best large palm for Delhi NCR homes — humidity-loving, pet-safe and an excellent dust trapper in smog season.", "image_url": IMG["palm_pair"], "badges": ["air_purifying", "pet_safe", "night_oxygen"]},
    {"slug": "golden-barrel-cactus", "name": "Golden Barrel Cactus", "category": "succulent", "tags": ["desert"], "price": 349, "sunlight": "direct", "maintenance": "low", "locations": ["balcony", "office", "terrace"], "description": "Practically indestructible in Gurgaon's 45°C summers. Water once a fortnight and it glows.", "image_url": IMG["cactus_white"], "badges": ["hardy"]},
    {"slug": "euphorbia-cactus", "name": "Tall Euphorbia Cactus", "category": "succulent", "tags": ["desert", "statement"], "price": 599, "sunlight": "direct", "maintenance": "low", "locations": ["balcony", "terrace"], "description": "A sculptural column cactus for sunny balconies — dramatic height without the drama.", "image_url": IMG["cactus_tall"], "badges": ["hardy"]},
    {"slug": "jade-plant", "name": "Jade Plant", "category": "succulent", "tags": ["vastu", "gift"], "price": 449, "sunlight": "direct", "maintenance": "low", "locations": ["balcony", "office", "living_room"], "description": "The prosperity plant. A thick-trunked succulent that lives for decades with almost no care.", "image_url": IMG["succulent_trio"], "badges": ["hardy"]},
    {"slug": "echeveria-rosette", "name": "Echeveria Rosette", "category": "succulent", "tags": ["desk"], "price": 299, "sunlight": "direct", "maintenance": "low", "locations": ["balcony", "office", "bedroom"], "description": "Geometric rosettes in dusty pastels. Perfect windowsill succulent for bright desks.", "image_url": IMG["succulent_table"], "badges": []},
    {"slug": "succulent-bowl-trio", "name": "Succulent Bowl Trio", "category": "succulent", "tags": ["combo", "gift"], "price": 799, "sunlight": "direct", "maintenance": "low", "locations": ["balcony", "office"], "description": "Three hand-planted succulents in a stoneware bowl — a ready-made centrepiece or gift.", "image_url": IMG["succulent_row"], "badges": []},
    {"slug": "hibiscus", "name": "Hibiscus (Gudhal)", "category": "flowering", "tags": ["summer"], "price": 499, "sunlight": "direct", "maintenance": "medium", "locations": ["terrace", "garden", "balcony"], "description": "Loud, tropical and made for Delhi NCR summers — daily blooms that butterflies queue for.", "image_url": IMG["flowers_terra"], "badges": ["flowering"]},
    {"slug": "adenium-desert-rose", "name": "Adenium (Desert Rose)", "category": "flowering", "tags": ["bonsai-like"], "price": 899, "sunlight": "direct", "maintenance": "low", "locations": ["balcony", "terrace"], "description": "A swollen caudex and shocking-pink blooms — the ideal 'looks exotic, needs little' terrace plant.", "image_url": IMG["desert_rose"], "badges": ["flowering", "hardy"]},
    {"slug": "geranium-combo", "name": "Geranium Colour Combo", "category": "flowering", "tags": ["winter", "combo"], "price": 599, "sunlight": "direct", "maintenance": "medium", "locations": ["balcony", "terrace"], "description": "Gurgaon's winter balcony hero — reds and pinks that bloom from November to March.", "image_url": IMG["pots_railing"], "badges": ["flowering"]},
    {"slug": "hanging-basket-collection", "name": "Hanging Basket Collection", "category": "flowering", "tags": ["combo"], "price": 999, "sunlight": "direct", "maintenance": "medium", "locations": ["balcony", "terrace"], "description": "Trailing lobelia, petunia and ivy in coir-lined baskets — instant colour at eye level.", "image_url": IMG["hanging_balcony"], "badges": ["flowering"]},
    {"slug": "desert-rose-balcony-set", "name": "Balcony Blooms Set", "category": "flowering", "tags": ["combo"], "price": 1499, "sunlight": "direct", "maintenance": "medium", "locations": ["balcony", "garden"], "description": "Five pre-styled flowering pots tuned to your balcony's sun — installed by our team, blooming in week one.", "image_url": IMG["balcony_flowers"], "badges": ["flowering"]},
    {"slug": "ficus-bonsai-5yr", "name": "Ficus Bonsai (5 Year)", "category": "bonsai", "tags": ["gift", "rare"], "price": 2499, "sunlight": "medium", "maintenance": "medium", "locations": ["living_room", "office"], "description": "A five-year S-shaped ficus with a hardened trunk — the classic bonsai silhouette, trained in our nursery.", "image_url": IMG["bonsai_ficus"], "badges": ["rare"]},
    {"slug": "ginseng-ficus-bonsai", "name": "Ginseng Ficus Bonsai", "category": "bonsai", "tags": ["beginner"], "price": 1499, "sunlight": "low", "maintenance": "low", "locations": ["office", "living_room"], "description": "Fat aerial roots, tiny leaves, forgiving nature — the best first bonsai for offices and bedrooms.", "image_url": IMG["bonsai_ginseng"], "badges": ["rare", "hardy"]},
    {"slug": "japanese-maple-bonsai", "name": "Japanese Maple Bonsai", "category": "bonsai", "tags": ["rare", "collector"], "price": 3999, "sunlight": "medium", "maintenance": "high", "locations": ["balcony", "terrace"], "description": "Lace-leaf acer with autumn crimson. A collector's piece for protected balconies.", "image_url": IMG["bonsai_maple"], "badges": ["rare"]},
    {"slug": "banyan-bonsai", "name": "Banyan Style Bonsai", "category": "bonsai", "tags": ["rare", "large"], "price": 2999, "sunlight": "medium", "maintenance": "medium", "locations": ["living_room", "office"], "description": "Aerial-rooted grandeur in miniature — our most photographed bonsai.", "image_url": IMG["bonsai_banyan"], "badges": ["rare"]},
    {"slug": "mint-herb-kitchen-kit", "name": "Kitchen Herb Kit", "category": "herb", "tags": ["edible"], "price": 599, "sunlight": "medium", "maintenance": "low", "locations": ["balcony", "terrace"], "description": "Mint, coriander, curry leaf and tulsi in nursery pots — pluck-and-cook herbs steps from the kitchen.", "image_url": IMG["terrace_hanging"], "badges": ["hardy"]},
    {"slug": "plumeria-frangipani", "name": "Plumeria (Frangipani)", "category": "outdoor", "tags": ["fragrant", "tree"], "price": 1499, "sunlight": "direct", "maintenance": "medium", "locations": ["terrace", "garden"], "description": "Temple-frangipani in white and pink. Drought-hardy once established — ideal farmhouse tree.", "image_url": IMG["estate_lake"], "badges": ["flowering"]},
    {"slug": "rare-exotic-collectors-bundle", "name": "Rare Exotic Collector's Bundle", "category": "indoor", "tags": ["rare", "combo"], "price": 4999, "sunlight": "medium", "maintenance": "medium", "locations": ["living_room", "office"], "description": "Five collector-grade foliage plants (variegated monsteras, alocasias, philodendrons) with a care card — restocked weekly.", "image_url": IMG["nursery_shelf"], "badges": ["rare", "air_purifying"]},
    {"slug": "office-green-combo", "name": "Office Green Combo", "category": "indoor", "tags": ["combo", "corporate"], "price": 3499, "sunlight": "low", "maintenance": "low", "locations": ["office"], "description": "Low-light survivors (ZZ, snake, pothos) styled for cabins and lobbies. Survives AC, weekends and meetings.", "image_url": IMG["indoor_styling"], "badges": ["air_purifying", "hardy"]},
    {"slug": "tulsi-holy-basil", "name": "Tulsi (Holy Basil)", "category": "herb", "tags": ["medicinal", "vastu"], "price": 199, "sunlight": "direct", "maintenance": "low", "locations": ["terrace", "garden", "balcony"], "description": "The sacred basil every Gurgaon courtyard deserves — aromatic, medicinal and effortless.", "image_url": IMG["flowers_terra"], "badges": ["hardy"]},
]

SERVICES = [
    {"slug": "garden-maintenance", "name": "Garden Maintenance", "short": "Weekly and bi-weekly care crews that keep every garden photo-ready through Gurgaon's seasons.", "hero_image": IMG["nursery_walkway"], "price_from": 1499,
     "description": ["A garden in Gurgaon is a living system fighting 46°C summers, hard water and monsoon washouts. Our maintenance crews handle pruning, feeding, pest scouting, irrigation tuning and seasonal replanting so your landscape only gets better every month.", "Every visit follows a 22-point health checklist, and you get a photo report on WhatsApp the same day. Plants that fail within the plan's guarantee window are replaced free."],
     "features": ["22-point plant health audit per visit", "Seasonal pruning, shaping & deadheading", "Organic pest & fungus management", "Drip irrigation tuning & timer checks", "Free replacement within guarantee window", "Photo report on WhatsApp after every visit"],
     "process": [{"title": "Garden audit", "detail": "Soil, light, irrigation and plant-by-plant health mapping in the first visit."}, {"title": "Care calendar", "detail": "A month-by-month plan tuned to your garden's exposure and your schedule."}, {"title": "Scheduled visits", "detail": "Weekly, bi-weekly or monthly crew visits with a named lead gardener."}, {"title": "Report & replace", "detail": "Same-day WhatsApp report; anything under guarantee is replaced free."}],
     "faqs": [{"q": "How often should my garden be maintained in Gurgaon?", "a": "Weekly in summer and monsoon, bi-weekly in winter keeps most gardens peak. We recommend the cadence after the free audit."}, {"q": "Do you bring your own tools and fertiliser?", "a": "Yes — crews arrive fully equipped with organic feeds, sprays and tools. You only provide water access."}, {"q": "Can you take over a neglected garden?", "a": "Absolutely. Revival visits start with a hard prune, soil rebuild and replacement plan, usually visible recovery in 4-6 weeks."}, {"q": "Is there a lock-in?", "a": "No lock-in on Basic; Premium and Complete run on 3-month cycles with a free replanting credit each cycle."}],
     "stats": [{"label": "Gardens under care", "value": "180+"}, {"label": "Avg. recovery time", "value": "4-6 weeks"}, {"label": "Response SLA", "value": "24 hrs"}]},
    {"slug": "plant-nursery", "name": "Plant Nursery", "short": "A living catalogue of 500+ varieties — acclimatised to NCR, priced nursery-direct.", "hero_image": IMG["nursery_shelf"], "price_from": 199,
     "description": ["Our Gurgaon nursery grows and hardens off plants for local conditions, so what you buy survives your balcony, not just ours. Indoor foliage, flowering shrubs, bonsai, herbs, fruit and rare collector plants — all nursery-direct pricing.", "Walk in for free plant-doctor advice, repotting service and honest light-matching: we will happily talk you out of a plant that won't survive your corridor."],
     "features": ["500+ varieties acclimatised to NCR", "Free repotting & soil mixing service", "Rare & collector plants restocked weekly", "Same-day local delivery in Gurgaon", "14-day establishment guarantee", "Free light-matching advice at the counter"],
     "process": [{"title": "Tell us your space", "detail": "Balcony, bedroom, terrace or office — we map light and wind first."}, {"title": "Match & pick", "detail": "We shortlist plants that genuinely thrive in those conditions."}, {"title": "Pot & prep", "detail": "Free repotting, soil mix and starter feed before you leave."}, {"title": "Establish & support", "detail": "14-day guarantee plus WhatsApp support for the settling-in period."}],
     "faqs": [{"q": "Where exactly is the nursery?", "a": "We're in Gurgaon with same-day delivery across DLF, Golf Course Road, Sohna Road and New Gurgaon — WhatsApp us for directions and today's stock."}, {"q": "Do you deliver and install?", "a": "Yes, same-day within Gurgaon, with potting and placement done by our crew for orders above ₹2,000."}, {"q": "Can I reserve plants on WhatsApp?", "a": "Send us your list — we photo-confirm stock and hold it for 24 hours."}, {"q": "What if a plant dies?", "a": "Within 14 days, with a photo, we replace it free. Beyond that, bring it to the plant doctor clinic for a diagnosis."}],
     "stats": [{"label": "Varieties in stock", "value": "500+"}, {"label": "Establishment guarantee", "value": "14 days"}, {"label": "Same-day delivery", "value": "Gurgaon"}]},
    {"slug": "landscaping", "name": "Landscaping & Hardscaping", "short": "Design-to-handover landscape builds: civil work, irrigation, planting and lighting.", "hero_image": IMG["estate_lake"], "price_from": 150000,
     "description": ["From villa front yards to farmhouse estates, we build complete landscapes — hardscape first (paths, decks, pergolas, water features), then irrigation and lighting, then layered planting that matures gracefully.", "One team owns the whole build with a fixed timeline and a warranty on both hardscape and planting. You get 3D concepts before a single stone is laid."],
     "features": ["3D concept + master layout plan", "Civil, decking, pergolas & water features", "Automated drip & sprinkler systems", "Landscape lighting & night-time design", "Layered planting with maturity plan", "1-year hardscape warranty"],
     "process": [{"title": "Site survey", "detail": "Levels, drainage, sun map and soil test before any design."}, {"title": "3D concepts", "detail": "Two design directions rendered in 3D with itemised BOQ."}, {"title": "Build", "detail": "Hardscape, irrigation and lighting with a named project manager."}, {"title": "Plant & handover", "detail": "Planting day, walkthrough, care plan and warranty card."}],
     "faqs": [{"q": "What does landscaping cost per sq ft in Gurgaon?", "a": "Basic landscaping runs ₹150-300/sqft; premium builds with hardscape and automation ₹500-900/sqft. We itemise every rupee in the BOQ."}, {"q": "How long does a villa garden take?", "a": "Typical 1,500 sqft villa garden: 3-5 weeks end-to-end including civil work."}, {"q": "Do you handle drainage and waterproofing?", "a": "Yes — terrace and podium gardens include drainage layers and root barriers as standard scope."}, {"q": "Can work happen in phases?", "a": "Yes. Many clients build hardscape first and add planting zones across seasons."}],
     "stats": [{"label": "Projects delivered", "value": "320+"}, {"label": "On-time handover", "value": "94%"}, {"label": "Hardscape warranty", "value": "1 year"}]},
    {"slug": "rooftop-gardens", "name": "Rooftop & Terrace Gardens", "short": "Weight-safe, wind-proof, monsoon-ready terraces — from 300 sq ft to full farmhouses.", "hero_image": IMG["rooftop"], "price_from": 75000,
     "description": ["A rooftop in Gurgaon gets full sun, 45°C decks and serious monsoon wind. We engineer for all three: drainage layers, root barriers, wind-hardy species, shade sails and automated drip that survives power cuts.", "From a 300 sq ft tower balcony to a 2,500 sq ft penthouse deck — pergolas, lawns, kitchen gardens and a seating zone that stays usable even in June."],
     "features": ["Structural weight & waterproofing review", "Drainage cells, root barriers, geotextile", "Wind-hardy planting palette", "Pergolas, decking & shade sails", "Automated drip with rain sensors", "Evening lighting & seating zones"],
     "process": [{"title": "Rooftop audit", "detail": "Load, waterproofing, drainage and wind exposure assessment."}, {"title": "Zoning design", "detail": "Deck, lawn, planter and utility zones sized to how you'll actually use it."}, {"title": "Build & irrigate", "detail": "Lightweight substrates, drainage cells and drip automation."}, {"title": "Plant & season-proof", "detail": "Hardened plants plus a summer/monsoon readiness checklist."}],
     "faqs": [{"q": "Will a garden damage my terrace waterproofing?", "a": "No — we build drainage cells and root barriers over the waterproofing, and audit it before starting."}, {"q": "What's the maintenance load?", "a": "With drip automation, about 30 minutes a week; or hand it to our maintenance plan entirely."}, {"q": "Can I have grass on a tower rooftop?", "a": "Natural lawns need deep soil; we usually recommend artificial turf or grass-free lawn alternatives on high-rises."}, {"q": "How much does a 1,000 sq ft rooftop cost?", "a": "Typically ₹2.5-6L depending on hardscape share — the proposal tool gives you an instant indicative range."}],
     "stats": [{"label": "Terraces built", "value": "140+"}, {"label": "Largest rooftop", "value": "2,500 sqft"}, {"label": "Build time", "value": "7-21 days"}]},
    {"slug": "vertical-gardening", "name": "Vertical Green Walls", "short": "Indoor and outdoor living walls with hidden drip — Gurgaon's signature green statement.", "hero_image": IMG["vertical_wall"], "price_from": 900,
     "description": ["A green wall turns a dead wall into the most-photographed corner of the building. We design per-square-foot planting plans — ferns, fittonias, pothos and money plants for indoors; rhoeo, jasmine and grasses outdoors — all fed by a hidden drip line.", "Walls start at ₹900-1,400 per sq ft installed including structure, irrigation and the first month of care. Indoor walls run whisper-quiet; outdoor walls are wind-picked for high floors."],
     "features": ["Per-sqft planting design & mock-up", "Hidden drip irrigation + timer", "Indoor low-light & outdoor wind palettes", "Powder-coated structure & grow lights", "Monthly grooming visits", "Plant replacement guarantee (first month)"],
     "process": [{"title": "Wall audit", "detail": "Light meter reading, sight lines and water point mapping."}, {"title": "Planting plan", "detail": "A species-per-panel plan tuned to the wall's light gradient."}, {"title": "Install", "detail": "Structure, drip line, planting and grow lights in 2-5 days."}, {"title": "Groom", "detail": "Monthly visit to prune, feed and rebalance the wall."}],
     "faqs": [{"q": "Do green walls attract insects indoors?", "a": "With a closed drip system and monthly grooming, no — water never pools in the room."}, {"q": "How much wall does 1 litre of water serve?", "a": "A well-tuned 10 sqft indoor wall uses about a litre a day; timers keep it exact."}, {"q": "Can one go on a balcony in a high-rise?", "a": "Yes — we switch to wind-hardy species and clip the structure for high floors."}, {"q": "What happens when I travel?", "a": "The drip timer keeps watering; our maintenance plan adds holiday visits for high-maintenance walls."}],
     "stats": [{"label": "Walls installed", "value": "90+"}, {"label": "Rate (installed)", "value": "₹900-1,400/sqft"}, {"label": "Install time", "value": "2-5 days"}]},
    {"slug": "plants-seller", "name": "Plants Seller & Pots", "short": "Bulk and retail plant supply — corporate gifting, events, pots and planters.", "hero_image": IMG["monstera_leaves"], "price_from": 199,
     "description": ["We supply plants at every scale: single pots for a study, 200 planters for a corporate launch, seasonal beds for cafés and weddings. Pot and planter catalogue includes ceramic, terracotta, FRP and self-watering systems.", "Corporate accounts get monthly replenishment cycles, branded pot wraps for gifting and a plant-swap service when seasonal displays fade."],
     "features": ["Retail pots, planters & self-watering systems", "Bulk & corporate gifting with branding", "Event & wedding plant rental", "Café / restaurant seasonal displays", "Monthly replenishment contracts", "Same-day Gurgaon delivery"],
     "process": [{"title": "Brief", "detail": "Count, look and budget — WhatsApp photos of your space help."}, {"title": "Curate", "detail": "We shortlist plants and pots with a photo proof sheet."}, {"title": "Deliver", "detail": "Potted, wrapped and placed by our crew."}, {"title": "Refresh", "detail": "Swap or replenish on a monthly cycle for always-fresh displays."}],
     "faqs": [{"q": "Do you rent plants for events?", "a": "Yes — per-event rental with delivery, styling, pickup, and lower rates for multi-day events."}, {"q": "Can I get branded pots for gifting?", "a": "Yes — logo wraps and custom sleeves from 25 units, with a card insert from your team."}, {"q": "What's the bulk discount?", "a": "10-25% on 50+ units depending on species and pot choice — WhatsApp us the list."}, {"q": "Do you supply cafés on monthly contracts?", "a": "Yes, including weekly rotation of flowering displays for terrace cafés."}],
     "stats": [{"label": "Corporate accounts", "value": "40+"}, {"label": "Events styled", "value": "250+"}, {"label": "Planter options", "value": "120+"}]},
    {"slug": "indoor-landscaping", "name": "Indoor Plant Styling", "short": "Biophilic interiors for homes, studios and offices — styled, installed, guaranteed.", "hero_image": IMG["indoor_styling"], "price_from": 9999,
     "description": ["We style interiors with plants the way a decorator styles furniture: sightlines from the door, scale against furniture, and — critically — plants matched to the light they'll actually get, not the light in the photo.", "Every install comes with a light-mapped plant list, self-watering planters where needed, and a 30-day establishment guarantee with a free swap if any plant struggles."],
     "features": ["Light-mapped plant selection", "Statement & floor-level styling", "Self-watering planter systems", "Grow lights for windowless zones", "30-day establishment guarantee", "Office AMC with monthly grooming"],
     "process": [{"title": "Space study", "detail": "Light meter, AC drafts and sightline mapping on site."}, {"title": "Styling board", "detail": "A look-book of placements, pots and plant sizes to approve."}, {"title": "Install day", "detail": "Plants potted, placed and left thriving — same day."}, {"title": "Settle-in care", "detail": "Two check-ins in the first month, free swaps if needed."}],
     "faqs": [{"q": "Our office has no windows.", "a": "We design around it — ZZ plants, snake plants and pothos with discreet grow lights thrive in windowless floors."}, {"q": "Do indoor plants really help with air quality?", "a": "Meaningfully for VOCs and humidity in closed AC rooms; we'll recommend NASA-listed species where it matters."}, {"q": "What does a typical home styling cost?", "a": "₹10k for a living-room refresh; ₹35k-1L for full-home biophilic styling with planters included."}, {"q": "Who waters the office plants?", "a": "Choose self-watering planters or fold it into an office AMC — our crew grooms monthly."}],
     "stats": [{"label": "Interiors styled", "value": "260+"}, {"label": "Guarantee", "value": "30 days"}, {"label": "Corporate AMC floors", "value": "35"}]},
    {"slug": "outdoor-landscaping", "name": "Outdoor Estate Gardens", "short": "Farmhouses, villa lawns and estate grounds — trees, lawns, orchards and outdoor living.", "hero_image": IMG["rooftop_aerial"], "price_from": 250000,
     "description": ["Large-canvas landscaping for farmhouses along the NH-48 belt and villa estates: native trees, lawn zones, orchards, walkways and outdoor dining under real shade.", "We work in Gurgaon's planting windows — amaltas and kachnar in autumn, lawns in spring, fruit orchards in monsoon — so everything establishes in season, not just on day one."],
     "features": ["Tree selection & avenue planning", "Lawn establishment (natural or turf)", "Orchard & kitchen-garden zones", "Walkways, seating & fire-pit zones", "Borewell-fed irrigation rings", "Estate-scale maintenance contracts"],
     "process": [{"title": "Estate survey", "detail": "Soil profile, water source, shade and views mapped at scale."}, {"title": "Master plan", "detail": "Zones for lawn, orchard, walkways and outdoor living."}, {"title": "Season-window build", "detail": "Hardscape and planting scheduled to Gurgaon's planting calendar."}, {"title": "Estate care", "detail": "Optional AMC with full-time gardener placement."}],
     "faqs": [{"q": "Which trees grow fastest in Gurgaon farmhouses?", "a": "Amaltas, kachnar, chikoo and mulberry establish quickly here; we avoid invasive species like subabul."}, {"q": "Can you maintain the lawn through summer?", "a": "Yes — summer lawn care is part of the estate AMC: mowing, aeration, and borewell-timed irrigation."}, {"q": "Do you plant orchards?", "a": "Yes — mango, guava, chikoo and lemon orchards with drip rings and a fruiting-season care plan."}, {"q": "Budget for a 2,000 sqft estate garden?", "a": "₹4-9L depending on trees and hardscape; the proposal tool gives an indicative split in minutes."}],
     "stats": [{"label": "Estates landscaped", "value": "60+"}, {"label": "Largest site", "value": "2.5 acres"}, {"label": "Trees planted", "value": "4,000+"}]},
]

PROJECTS = [
    {"title": "Penthouse Rooftop Retreat — The Magnolias", "location": "DLF Phase 5", "category": "Rooftop Garden", "summary": "A 1,400 sq ft penthouse terrace turned into an all-season retreat: pergola shade, artificial lawn, wind-hardy planters and evening lighting — built weight-safe over existing waterproofing.", "image_url": IMG["rooftop"], "area": "1,400 sq ft", "duration": "18 days", "budget_band": "₹4.5-6L", "highlights": ["Pergola + shade sail for June afternoons", "Automated drip with rain sensor", "Seating for 10 with embedded lighting"]},
    {"title": "Corporate Lobby Green Wall", "location": "Golf Course Road", "category": "Vertical Garden", "summary": "A 180 sq ft indoor living wall in a corporate lobby — low-light foliage on a hidden drip, whisper-quiet pump, grow-lit through the foggy winter weeks.", "image_url": IMG["vertical_wall"], "area": "180 sq ft wall", "duration": "5 days", "budget_band": "₹1.6-2.2L", "highlights": ["26 species per-panel planting plan", "Zero-drip leak design for indoors", "Monthly grooming AMC"]},
    {"title": "Biophilic Office Floor Refresh", "location": "One Horizon Center", "category": "Indoor Landscaping", "summary": "34 workstations, 5 meeting rooms, zero windows. ZZ, snake and pothos palettes with discreet grow lights — plus a 30-day swap guarantee that never needed using.", "image_url": IMG["indoor_styling"], "area": "6,000 sq ft floor", "duration": "2 days", "budget_band": "₹95k", "highlights": ["Light-mapped placement plan", "Self-watering planters throughout", "Monthly corporate grooming visit"]},
    {"title": "Villa Estate Garden Revival", "location": "Nirvana Country", "category": "Outdoor Landscaping", "summary": "A neglected 2,000 sq ft villa garden revived in one season: hard-pruned borders, rebuilt lawn, new walkway and a mango-chikoo corner planted in monsoon.", "image_url": IMG["estate_lake"], "area": "2,000 sq ft", "duration": "4 weeks", "budget_band": "₹5-7L", "highlights": ["Soil rebuild + organic revival", "Walkway & fire-pit hardscape", "Fruiting trees in monsoon window"]},
    {"title": "High-Rise Balcony Makeover", "location": "M3M Golfestate", "category": "Balcony Garden", "summary": "A windy 22nd-floor balcony turned into a flowering morning nook — clip-on green rail, wind-hardy species and a herb corner that survives the gusts.", "image_url": IMG["terrace_hanging"], "area": "120 sq ft", "duration": "1 day", "budget_band": "₹65k", "highlights": ["Wind-picked flowering palette", "Rail-mounted planters, no drilling", "Self-watering for travel weeks"]},
    {"title": "Terrace Kitchen Garden", "location": "South City 2", "category": "Rooftop Garden", "summary": "A family terrace re-zoned into a productive kitchen garden — 16 grow-bags, trellised climbers, drip on a timer, and herbs by the kitchen door.", "image_url": IMG["rooftop_aerial"], "area": "600 sq ft", "duration": "9 days", "budget_band": "₹1.2-1.8L", "highlights": ["16 grow-bags + trellis grid", "Timer drip, 20 min/day", "Seasonal sowing calendar provided"]},
]

PLANS = [
    {"slug": "basic", "name": "Basic Care", "price": 1499, "cadence": "per month · 1 visit", "tagline": "Keep a healthy garden healthy.", "features": ["Monthly gardener visit (up to 2 hrs)", "Pruning, feeding & pest scouting", "22-point health report on WhatsApp", "10% off nursery plants all year", "Free replacement: up to 3 plants/month"], "popular": False},
    {"slug": "premium", "name": "Premium Care", "price": 2999, "cadence": "per month · 2 visits", "tagline": "Bi-weekly care for gardens that host.", "features": ["Bi-weekly gardener visits", "Everything in Basic Care", "Irrigation & timer maintenance", "Seasonal replanting (2 cycles/year)", "Free replacement: up to 6 plants/month", "Priority WhatsApp SLA (12 hrs)"], "popular": True},
    {"slug": "complete", "name": "Complete Care", "price": 5999, "cadence": "per month · weekly", "tagline": "Full-service luxury: garden + plants, guaranteed.", "features": ["Weekly gardener visits", "Everything in Premium Care", "Pest & fungus management included", "Unlimited plant replacement (fair-use)", "Lawn care & hedge sculpting", "Named lead gardener + quarterly review"], "popular": False},
]

LOCATIONS = [
    {"slug": "dlf-phase-1-2-3-4-5", "name": "DLF Phase 1, 2, 3, 4 & 5", "highlights": "Luxury villas and penthouses; balcony green walls for The Crest and The Magnolias; clubhouse-adjacent terraces", "popular_services": ["Terrace gazebos & greenery", "Biophilic indoor styling", "Weekly maintenance AMC"], "neighborhoods": ["DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "The Magnolias", "The Crest", "Aralias"], "image_url": IMG["indoor_styling"]},
    {"slug": "golf-course-road", "name": "Golf Course Road", "highlights": "Ultra-luxury condominiums and corporate headquarters — Aralias, Camellias, Belaire, One Horizon Center", "popular_services": ["Vertical gardens", "Automated drip irrigation", "Exotic palm installation"], "neighborhoods": ["Aralias", "The Camellias", "Belaire", "Vatika Towers", "One Horizon Center", "Sector 42-43"], "image_url": IMG["vertical_wall"]},
    {"slug": "golf-course-extension-road", "name": "Golf Course Extension Road", "highlights": "Modern high-rise balconies — M3M Golfestate, Grand Hyatt Residences, Ireo City; wind and sun exposure is the challenge", "popular_services": ["Wind-resistant balcony plants", "Artificial turf & pebble accents", "Herb & kitchen gardens"], "neighborhoods": ["M3M Golfestate", "Ireo City", "Grand Hyatt Residences", "Emerald Hills", "Sector 61-67"], "image_url": IMG["rooftop"]},
    {"slug": "sohna-road", "name": "Sohna Road & South City", "highlights": "Gated community villas and large terraces — Vipul Greens, Tatvam Villas, Nirvana Country, South City 1 & 2", "popular_services": ["Lawn landscaping", "Fruit & flowering trees", "Bi-weekly garden maintenance"], "neighborhoods": ["South City 1", "South City 2", "Nirvana Country", "Vipul Greens", "Tatvam Villas", "Sector 47-49"], "image_url": IMG["estate_lake"]},
    {"slug": "new-gurgaon-sectors", "name": "New Gurgaon (Sectors 82-95)", "highlights": "Budget-smart greenery for growing families in new high-rises and builder floors — high sun, hard water", "popular_services": ["Low-maintenance air purifiers", "Balcony planter setup", "Plant doctor clinic visits"], "neighborhoods": ["Sector 82", "Sector 84", "Sector 89", "Sector 92", "Sector 95", "Dwarka Expressway belt"], "image_url": IMG["cactus_tall"]},
    {"slug": "sector-14-sector-29-old-gurgaon", "name": "Old Gurgaon — Sector 14 & 29", "highlights": "Traditional kothi gardens, restaurant terraces and the nursery supply belt; mature trees and seasonal beds", "popular_services": ["Seasonal flower bed revival", "Organic fertiliser & repotting", "Hedge & shrub sculpting"], "neighborhoods": ["Sector 14", "Sector 29", "Sector 15", "Civil Lines", "Sadar Bazaar belt"], "image_url": IMG["pots_railing"]},
    {"slug": "manesar-industrial-farmhouses", "name": "Manesar & NH-48 Farmhouses", "highlights": "Acreage farmhouses, industrial green belts and orchards along the NH-48 corridor; estate-scale work", "popular_services": ["Estate hardscaping & lawns", "Commercial green certification", "Comprehensive landscape AMC"], "neighborhoods": ["Manesar", "IMT Manesar", "Pataudi Road", "Bilaspur", "NH-48 farmhouse belt"], "image_url": IMG["rooftop_aerial"]},
]

LOCATION_FALLBACK = {
    "dlf-phase-1-2-3-4-5": {
        "intro": "Gurgaon's most manicured addresses deserve gardens to match. From penthouse terraces in The Magnolias to villa courtyards in the Aralias, we design landscapes that hold their own against the clubhouse.",
        "microclimate": "Low-rise and high-rise mix: tower balconies take strong west sun and upper-floor wind, while villa gardens enjoy mature tree shade and sheltered courtyards.",
        "soil_note": "Builder-fill soil is poor; we rebuild with cocopeat-enriched mixes and insist on drainage layers for every terrace planter.",
        "best_plants": ["Areca Palm", "Monstera Deliciosa", "Jade Plant", "Geraniums (winter)", "Adenium"],
    },
    "golf-course-road": {
        "intro": "On Golf Course Road the landscape is the lobby. We build statement green walls, palm-lined driveways and penthouse terraces for the towers that define Gurgaon's skyline.",
        "microclimate": "Tall towers create wind tunnels on upper floors and deep shade at podium level — every planting plan starts with a light-meter walk.",
        "soil_note": "Podium planters need lightweight substrate and drainage cells to respect slab load limits.",
        "best_plants": ["Rhapis Palm", "Ficus Bonsai", "Philodendron", "Pothos walls", "Dracaena"],
    },
    "golf-course-extension-road": {
        "intro": "The Extension Road's new high-rises get the sunniest balconies in Gurgaon — and the strongest winds. We pick species that shrug off both and turn dead balconies into morning gardens.",
        "microclimate": "Open west exposure, reflective glass heat and persistent upper-floor wind; shade sails and wind-hardy palettes are standard.",
        "soil_note": "Grow-bag and lightweight-mix setups outperform heavy pots here — easier on slabs and easier to re-style.",
        "best_plants": ["Adenium", "Golden Barrel Cactus", "Hibiscus", "Kitchen herbs", "Boston Fern"],
    },
    "sohna-road": {
        "intro": "Sohna Road's gated villas and South City terraces have the space Gurgaon rarely offers — room for lawns, fruit trees and a proper weekend garden.",
        "microclimate": "Larger plots mean friendlier microclimates: lawns cool the air, boundaries shelter borders from wind.",
        "soil_note": "Older plots have better soil structure; we still test pH before lawn work — Gurgaon water pushes it alkaline.",
        "best_plants": ["Amaltas", "Chikoo", "Mint & Tulsi", "Hibiscus", "Plumeria"],
    },
    "new-gurgaon-sectors": {
        "intro": "New Gurgaon's young families want green that survives real life — long commutes, hard water and full-sun balconies. We start with plants that forgive.",
        "microclimate": "Open-sector sun and alkaline borewell water; low-maintenance species and self-watering setups do the heavy lifting.",
        "soil_note": "Water more than soil is the challenge here — we pair hardy plants with drip kits from day one.",
        "best_plants": ["Snake Plant", "ZZ-style hardy foliage", "Areca Palm", "Barrel Cactus", "Tulsi"],
    },
    "sector-14-sector-29-old-gurgaon": {
        "intro": "Old Gurgaon's kothis and café terraces carry the city's gardening memory. We revive heritage gardens, sculpt hedges and keep restaurant greenery camera-ready.",
        "microclimate": "Mature tree cover gives cooler, shadier plots — ferns and shade perennials thrive where new sectors cook.",
        "soil_note": "Decades of leaf litter make genuinely good soil; a pH check usually confirms it just needs feeding.",
        "best_plants": ["Boston Fern", "Seasonal flower beds", "Mogra (Jasmine)", "Hedge varieties", "Curry Leaf"],
    },
    "manesar-industrial-farmhouses": {
        "intro": "Along the NH-48 belt, our work scales up: acreage farmhouses, orchards, industrial green belts and lawns that need a riding mower, not a hand trowel.",
        "microclimate": "Open field exposure — full sun, winter fog and summer loo winds; tree shelterbelts change everything.",
        "soil_note": "Farmhouse plots vary from sandy ridges to heavy loam; we amend per-zone rather than one-fix-all.",
        "best_plants": ["Mango & Guava orchards", "Neem & Amaltas avenues", "Plumeria", "Lemon", "Seasonal lawns"],
    },
}

LOCATION_SYSTEM = """You write unique, factual-sounding location copy for the website of AJ Heaven's Harvest Nursery, a plant nursery and landscaping studio in Gurgaon, India. You are writing one Gurgaon locality page; it must sound local and specific, never templated. Reply with ONLY a JSON object:
{"intro": "2-3 sentences on why this locality's homes suit specific green work", "microclimate": "2 sentences on light/wind/heat realities of this locality", "soil_note": "1-2 sentences on soil or water realities here", "best_plants": ["5 plant names that genuinely suit this locality"], "faqs": [{"q": "...", "a": "..."}, {"q": "...", "a": "..."}, {"q": "...", "a": "..."}]}
The 3 FAQs must mention the locality by name and be things a resident would actually ask (costs in INR, maintenance, water/sun issues)."""


async def upsert(collection: str, doc: dict) -> None:
    await db[collection].update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)


async def seed_locations() -> None:
    for base in LOCATIONS:
        if await db.locations.find_one({"slug": base["slug"]}):
            continue
        content: dict = {}
        try:
            prompt = (
                f"Locality: {base['name']}, Gurgaon. Known for: {base['highlights']}. "
                f"Popular services here: {', '.join(base['popular_services'])}."
            )
            content = await complete_json(new_session("locseed"), LOCATION_SYSTEM, prompt)
        except Exception as exc:
            print(f"  AI content failed for {base['slug']}: {exc} — using fallback copy")
        fb = LOCATION_FALLBACK[base["slug"]]
        doc = {
            **base,
            "region": "Gurgaon",
            "intro": content.get("intro") or fb["intro"],
            "microclimate": content.get("microclimate") or fb["microclimate"],
            "soil_note": content.get("soil_note") or fb["soil_note"],
            "best_plants": content.get("best_plants") or fb["best_plants"],
            "faqs": content.get("faqs") or [
                {"q": f"Do you serve {base['name']}?", "a": "Yes — same-day nursery delivery and site visits across this area, 7 days a week."},
                {"q": f"What does garden maintenance cost in {base['name']}?", "a": "Plans start at ₹1,499/month for a monthly visit; bi-weekly care is ₹2,999/month."},
                {"q": f"Which plants survive best in {base['name']}?", "a": ", ".join(fb["best_plants"][:3]) + " — hardened at our nursery for local conditions."},
            ],
        }
        await db.locations.update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)
        print(f"  location seeded: {doc['slug']}")


async def main() -> None:
    for p in PLANTS:
        await upsert("plants", p)
    print(f"plants: {len(PLANTS)}")
    for s in SERVICES:
        await upsert("services", s)
    print(f"services: {len(SERVICES)}")
    for pr in PROJECTS:
        await db.projects.update_one({"title": pr["title"]}, {"$set": pr}, upsert=True)
    print(f"projects: {len(PROJECTS)}")
    for pl in PLANS:
        await upsert("plans", pl)
    print(f"plans: {len(PLANS)}")
    await seed_locations()
    await ensure_indexes()
    print("seed complete")


if __name__ == "__main__":
    asyncio.run(main())
