"""Pixel-Figur für SmoothStep: kleiner Typ mit türkiser Kappe (eigene Figur, 12 x 17 Pixel)."""

PAL = {
    'O': '#2B2346',  # Kontur
    'C': '#1FA7A0', 'c': '#56D6CB', 'b': '#127069', 'w': '#FFFFFF',  # Kappe, Licht, Schirm, Logo
    'H': '#5A3826',  # Haare
    'S': '#F8CFA8', 's': '#E0A47E',  # Haut, Hautschatten
    'E': '#2B2346', 'M': '#A04C55', 'W': '#FFFFFF',
    'R': '#F28A3A', 'r': '#C9631F', 'L': '#FFB36B', 'Z': '#FFF0DC',  # Hoodie
    'P': '#4D6BC4', 'p': '#344F99',  # Jeans
    'K': '#F4F1FF', 'k': '#9B93C9',  # Sneaker
}

HEAD_FRONT = [
    "...OOOOOO...",
    "..OccccCCO..",
    ".OCCCwwCCCO.",
    ".ObbbbbbbbO.",
    ".OHSSSSSSHO.",
]

FRONT = {
    'idle': HEAD_FRONT + [
        ".OSSESSESSO.",
        ".OsSSSSSSsO.",
        "..OsSMMSsO..",
        "..OLRZZRrO..",
        ".OLRRZZRRrO.",
        ".OLRRRRRRrO.",
        ".OSrrrrrrSO.",
        "..OPPPPPPO..",
        "..OPpOOPpO..",
        "..OPPOOPPO..",
        ".OKKkOOkKKO.",
        ".OOOO..OOOO.",
    ],
    'sit': HEAD_FRONT + [
        ".OSSESSESSO.",
        ".OsSSSSSSsO.",
        "..OsSMMSsO..",
        "..OLRZZRrO..",
        ".OLRRZZRRrO.",
        ".OSRRRRRRSO.",
        ".OrrrrrrrrO.",
        ".OPPPPPPPPO.",
        "..OKKOOKKO..",
        "..OOOO.OOO..",
        "............",
        "............",
    ],
    'think': [
        "...OOOOOO...",
        "..OccccCCO..",
        ".OCCCwwCCCO.",
        ".ObbbbbbbbO.",
        ".OHSESSESHO.",
        ".OSSSSSSSSO.",
        ".OsSSSSSSsO.",
        "..OsSSSMsO..",
        "..OLRZOSSO..",
        ".OLRRZOSSO..",
        ".OSRRRRrOO..",
        ".OrrrrrrrO..",
        ".OPPPPPPPPO.",
        "..OKKOOKKO..",
        "..OOOO.OOO..",
        "............",
        "............",
    ],
    'shock': [
        "OO.OOOOOO.OO",
        "SOOccccCCOOS",
        "SOCCCwwCCCOS",
        "RObbbbbbbbOR",
        "ROHSSSSSSHOR",
        "ROSEESSEESOR",
        "ROSEESSEESOR",
        "RROsSMMSsORR",
        ".OOORZZROOO.",
        "..OLRZZRrO..",
        "..ORRRRRrO..",
        "..OrrrrrrO..",
        ".OPPPPPPPPO.",
        "..OKKOOKKO..",
        "..OOOO.OOO..",
        "............",
        "............",
    ],
    'happy': [
        "OO.OOOOOO.OO",
        "SOOccccCCOOS",
        "SOCCCwwCCCOS",
        "RObbbbbbbbOR",
        "ROHSSSSSSHOR",
        "ROSOSSSSOSOR",
        "ROsSSSSSSsOR",
        "RROsMMMMsORR",
        ".OOORZZROOO.",
        "..OLRZZRrO..",
        "..ORRRRRrO..",
        "..OrrrrrrO..",
        ".OPPPPPPPPO.",
        "..OKKOOKKO..",
        "..OOOO.OOO..",
        "............",
        "............",
    ],
}

HEAD_SIDE = [
    "..OOOOO.....",
    ".OccccCO....",
    ".OCCCCCwOOOO",
    ".OCCCCbbbbbO",
    ".OHHHSSOOOO.",
    ".OHHSSESO...",
    ".OHSSSSSSO..",
    "..OsSSMSO...",
]

SIDE = {
    'walk0': HEAD_SIDE + [
        "..OLRRRO....",
        ".OLRRRrRO...",
        ".OLRRSrRO...",
        ".OrrrrrrO...",
        "..OPPPPO....",
        "..OPPpPO....",
        "..OPPpPO....",
        ".OKKkKKO....",
        ".OOOOOOO....",
    ],
    'walk1': HEAD_SIDE + [
        "..OLRRRO....",
        ".OSLRRRRO...",
        ".OLRRRRrO...",
        ".OrrrrrrO...",
        "..OPPPPPO...",
        ".OPPpOPPpO..",
        "OPPOO.OPPO..",
        "OKKkO.OKKkO.",
        "OOOO..OOOOO.",
    ],
    'walk2': HEAD_SIDE + [
        "..OLRRRO....",
        ".OLRRRrRO...",
        ".OLRRRRSO...",
        ".OrrrrrrO...",
        "..OPPPPPO...",
        ".OPPpOPPpO..",
        ".OPO..OPPO..",
        "OKKkO.OKKkO.",
        "OOOO..OOOOO.",
    ],
}
