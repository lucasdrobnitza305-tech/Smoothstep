"""Pixel-Szene für die SmoothStep-Begrüßung: schwebendes Zimmer in Draufsicht von schräg oben.
Raster: 96 x 92 Pixel, 1 Pixel = 4 Punkte (384 x 368), mittig in der 390 x 380-Szene."""
import json, sys
sys.path.insert(0, '.')
from pixel import Canvas, from_rows
from sprites import PAL, FRONT, SIDE

P = 4
O = '#2B2346'
art = {}

def light(c):
    """Hellere Variante einer Farbe (für den Sonnenstrahl auf dem Boden)."""
    r, g, b = int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)
    f = lambda v: min(255, int(v + (255 - v) * 0.35))
    return f'#{f(r):02X}{f(g):02X}{f(b):02X}'

# ============================== ZIMMER ==============================
W, H = 96, 84
c = Canvas(W, H)

# Schatten unter dem schwebenden Zimmer
for j, (x0, x1) in enumerate(((10, 86), (6, 90), (8, 88), (14, 82))):
    c.rect(x0, 79 + j, x1 - x0, 1, '#B4A7EE')

# --- Boden (Holzdielen) ---
FX, FY, FW, FH = 4, 32, 88, 40
plank = ['#E9B987', '#E3B07C']
for row in range(FH // 4):
    y = FY + row * 4
    base = plank[row % 2]
    c.rect(FX, y, FW, 4, base)
    c.rect(FX, y, FW, 1, '#F3CB9F')            # Lichtkante jeder Diele
    c.rect(FX, y + 3, FW, 1, '#C98E5C')        # Fuge
    off = (row * 13) % 22
    for x in range(FX + off, FX + FW, 22):    # Stoßfugen versetzt
        c.rect(x, y, 1, 3, '#C98E5C')
# Vorderkante des Bodens (Dicke = 3D-Look)
c.rect(FX, FY + FH, FW, 4, '#B57C4D')
c.rect(FX, FY + FH + 4, FW, 2, '#8E5C36')
c.rect(FX, FY + FH, FW, 1, '#CC9161')

# --- Rückwand ---
c.rect(FX, 6, FW, 26, '#EFE8FF')
for y in range(9, 24, 4):                       # dezentes Tapetenmuster
    for x in range(FX + 3 + (y % 8), FX + FW - 2, 8):
        c.set(x, y, '#E1D7FB')
c.rect(FX, 24, FW, 8, '#D9CEF9')               # Wandverkleidung unten
c.rect(FX, 24, FW, 1, '#C4B6F3')
c.rect(FX, 31, FW, 1, '#B9AAEE')
# Wandoberkante (Mauerdicke von oben gesehen)
c.rect(FX, 3, FW, 3, '#FFFFFF')
c.rect(FX, 5, FW, 1, '#D9D0F6')

# --- Fenster ---
c.rect(64, 9, 17, 14, '#FFFFFF')
c.rect(66, 11, 13, 10, '#8FCBF4')
c.rect(66, 11, 13, 4, '#7DBDEE')
c.rect(68, 13, 4, 2, '#FFFFFF'); c.rect(67, 14, 6, 1, '#FFFFFF')     # Wölkchen
c.rect(75, 12, 2, 2, '#FFF3A6')                                      # Sonne
c.rect(72, 11, 1, 10, '#FFFFFF'); c.rect(66, 16, 13, 1, '#FFFFFF')   # Sprossen
c.frame(64, 9, 17, 14, O)
c.rect(63, 23, 19, 2, '#FFFFFF'); c.rect(63, 25, 19, 1, '#CFC6F2')   # Fensterbank

# --- Bild an der Wand ---
c.rect(40, 11, 12, 9, '#FFFFFF'); c.rect(41, 12, 10, 7, '#BFE0FA')
c.rect(41, 16, 10, 3, '#6FC6A2'); c.rect(43, 15, 3, 1, '#6FC6A2'); c.rect(44, 14, 1, 1, '#6FC6A2')
c.rect(48, 13, 2, 2, '#FFE07A')
c.frame(40, 11, 12, 9, O)

# --- Hängeschrank Küche ---
c.rect(7, 9, 22, 9, '#FFE1D2'); c.rect(7, 16, 22, 2, '#F6C6AF')
c.rect(17, 10, 1, 7, '#E7A98B'); c.rect(15, 13, 1, 2, O); c.rect(19, 13, 1, 2, O)
c.frame(7, 9, 22, 9, O)

# --- Regal mit Büchern ---
for x, h, col in ((33, 6, '#FF9F78'), (35, 5, '#6FC6A2'), (37, 6, '#8FC6F2'), (39, 4, '#FFD866')):
    c.rect(x, 21 - h, 2, h, col); c.rect(x, 21 - h, 2, 1, O)
c.rect(42, 18, 3, 3, '#FFC0A6'); c.rect(42, 16, 3, 2, '#6FC6A2')
c.rect(32, 21, 15, 2, '#9C8BE6'); c.rect(32, 23, 15, 1, '#7564C4')

# --- Küchenzeile (Arbeitsplatte von oben + Front) ---
c.rect(5, 26, 26, 8, '#F3E9E1')                 # Arbeitsplatte
c.rect(5, 26, 26, 1, '#FFFFFF')
for bx in (8, 17):                              # Herdplatten
    c.rect(bx, 28, 6, 4, '#4A3F66'); c.rect(bx + 1, 29, 4, 2, '#6B5E8F')
c.rect(5, 34, 26, 11, '#FFC9AE')                # Schrankfront
c.rect(5, 34, 26, 1, '#E7A98B')
c.rect(17, 35, 1, 10, '#E7A98B')
c.rect(13, 38, 2, 1, O); c.rect(20, 38, 2, 1, O)
c.rect(5, 43, 26, 2, '#F0AE8F')
c.frame(5, 26, 26, 19, O)
c.rect(5, 33, 26, 1, O)
# Topf
c.rect(23, 25, 6, 5, '#A796F0'); c.rect(22, 24, 8, 1, '#8E7BE6'); c.rect(25, 23, 2, 1, '#8E7BE6')
c.rect(24, 26, 2, 1, '#D7CEFB'); c.frame(22, 23, 8, 7, None) if False else None
for (x, y) in ((22, 24), (29, 24), (22, 25), (29, 25), (22, 29), (29, 29)):
    c.set(x, y, O)
c.rect(23, 30, 6, 1, O)

# --- Stehlampe ---
c.rect(47, 22, 1, 23, '#7A6BB8')
c.rect(44, 18, 7, 4, '#FFD866'); c.rect(44, 18, 7, 1, '#FFF1B0'); c.frame(44, 18, 7, 4, O)
c.rect(45, 45, 5, 1, '#5A4B98')

# --- Sofa (von vorne-oben) ---
SX = 52
c.rect(SX, 26, 29, 9, '#7FCFB1')                # Rückenlehne
c.rect(SX, 26, 29, 2, '#A9E6CE')
c.rect(SX + 4, 28, 10, 6, '#BDEDD9'); c.rect(SX + 15, 28, 10, 6, '#BDEDD9')   # Kissen
c.rect(SX + 4, 28, 10, 1, '#FFFFFF'); c.rect(SX + 15, 28, 10, 1, '#FFFFFF')
c.rect(SX, 35, 29, 6, '#9BDDC2')                # Sitzfläche
c.rect(SX, 35, 29, 1, '#C9F2E1')
c.rect(SX, 41, 29, 4, '#6FBF9F')                # Front
c.rect(SX, 44, 29, 1, '#5AA98A')
c.rect(SX, 30, 4, 15, '#86D4B5'); c.rect(SX + 25, 30, 4, 15, '#86D4B5')       # Armlehnen
c.rect(SX, 30, 4, 1, '#C9F2E1'); c.rect(SX + 25, 30, 4, 1, '#C9F2E1')
c.frame(SX, 26, 29, 19, O)
c.rect(SX + 4, 34, 21, 1, '#5AA98A')
c.rect(SX + 3, 45, 2, 1, '#5A4B98'); c.rect(SX + 24, 45, 2, 1, '#5A4B98')

# --- Pflanze in der Ecke ---
c.rect(84, 34, 7, 7, '#FF9F78'); c.rect(84, 34, 7, 1, '#FFC9B1'); c.frame(84, 34, 7, 7, O)
for (x, y, w, h) in ((83, 26, 3, 7), (86, 23, 3, 10), (89, 27, 3, 6), (85, 29, 5, 4)):
    c.rect(x, y, w, h, '#4FB389')
for (x, y) in ((84, 27), (87, 24), (90, 28)):
    c.set(x, y, '#8EDDB9')

# --- Teppich ---
for j in range(14):
    t = abs(j - 6.5) / 7
    half = int(19 * (1 - t ** 2) ** 0.5)
    c.rect(58 - half, 50 + j, half * 2, 1, '#F6A98C' if 1 <= j <= 12 else '#E58F72')
for j in range(3, 11):
    t = abs(j - 6.5) / 4.6
    half = int(14 * max(0, 1 - t ** 2) ** 0.5)
    c.set(58 - half, 50 + j, '#FFE0D2'); c.set(58 + half - 1, 50 + j, '#FFE0D2')

# --- Sonnenstrahl durchs Fenster auf den Boden ---
for j in range(32, 54):
    k = j - 32
    x0, x1 = 58 - k // 2, 76 - k // 2
    for x in range(max(FX, x0), min(FX + FW, x1)):
        col = c.px[j][x]
        if col and col.startswith('#') and col not in (O,):
            c.px[j][x] = light(col)

# Umriss des Bodens
c.frame(FX, 3, FW, FY + FH + 6 - 3, O)
art['room'] = c.svg(P)

# ============================== FIGUR ==============================
for name, rows in FRONT.items():
    art['fig_' + name] = from_rows(rows, PAL).svg(5)
for name, rows in SIDE.items():
    art['fig_' + name] = from_rows(rows, PAL).svg(5)

sh = Canvas(12, 3)
sh.rect(2, 0, 8, 3, '#2B2346'); sh.rect(1, 1, 10, 1, '#2B2346')
art['shadow'] = sh.svg(5).replace('<svg ', '<svg opacity="0.22" ')

# ============================== BLASEN, LISTE, EFFEKTE ==============================
def bubble(fill, shade, w=30):
    b = Canvas(w, 10)
    b.round_rect(0, 0, w, 10, fill, O, r=2)
    b.rect(2, 7, w - 4, 1, shade)
    b.rect(3, 1, 8, 1, '#FFFFFF')
    return b.svg(P, pad=1)

for n, f, s in (('sky', '#A9D6F7', '#8CC3EC'), ('peach', '#FFC3A8', '#F7A989'), ('mint', '#A5E4CB', '#86D5B6'), ('butter', '#FFE18A', '#F4CC5F')):
    art['bubble_' + n] = bubble(f, s)

tr = Canvas(3, 3); tr.rect(0, 0, 3, 3, O); tr.set(1, 1, '#FFFFFF')
sp = Canvas(42, 13)
sp.round_rect(0, 0, 42, 10, '#FFFFFF', O, r=2)
sp.rect(2, 7, 38, 1, '#EDE8FF'); sp.rect(3, 1, 8, 1, '#F6F3FF')
for k, (x, y) in enumerate(((34, 10), (35, 11), (36, 12))):
    sp.set(x, y, O); sp.set(x - 1, y - 1, '#FFFFFF') if k == 0 else None
sp.rect(32, 9, 4, 1, '#FFFFFF'); sp.set(31, 9, O); sp.set(36, 9, O) if False else None
art['speech'] = sp.svg(P, pad=1)

art['trail'] = tr.svg(P, pad=1)

card = Canvas(38, 10)
card.round_rect(0, 1, 38, 9, '#3E3466', None, r=1)   # Schatten
card.round_rect(0, 0, 38, 9, '#FFFFFF', O, r=1)
card.rect(2, 1, 34, 1, '#EDE8FF')
art['card'] = card.svg(P, pad=1)

chk = from_rows([
    "OOOOOOO",
    "OVVVVWO",
    "OVVVWWO",
    "OWVWWVO",
    "OWWWVVO",
    "OVWVVVO",
    "OOOOOOO",
], {'O': O, 'V': '#6A52E8', 'W': '#FFFFFF'})
art['check'] = chk.svg(P, pad=1)

clock = from_rows([
    ".OO.....OO.",
    "ORRO.O.ORRO",
    "OROOOOOOORO",
    ".OOWWWWWOO.",
    ".OWWWOWWWO.",
    ".OWWWOWWWO.",
    ".OWWWOOOWO.",
    ".OWWWWWWWO.",
    ".OOWWWWWOO.",
    "..OOOOOOO..",
    ".OO.....OO.",
], {'O': O, 'R': '#FF5A47', 'W': '#FFFFFF'})
art['clock'] = clock.svg(P, pad=1)

ring = Canvas(19, 9)
for (x, y) in ((0, 2), (0, 3), (1, 1), (1, 5), (0, 4), (18, 2), (18, 3), (17, 1), (17, 5), (18, 4)):
    ring.set(x, y, '#FF5A47')
art['ring'] = ring.svg(P, pad=1)

bang = from_rows(["OOO", "ORO", "ORO", "ORO", "ORO", "OOO", "...", "OOO", "ORO", "OOO"], {'O': O, 'R': '#FF5A47'})
art['bang'] = bang.svg(P, pad=1)
sweat = from_rows([".O.", "OBO", "OBO", ".O."], {'O': O, 'B': '#8CCBF5'})
art['sweat'] = sweat.svg(P, pad=1)
spark = from_rows(["..W..", "..W..", "WWYWW", "..W..", "..W.."], {'W': '#FFFFFF', 'Y': '#FFD866'})
art['sparkle'] = spark.svg(P, pad=1)
puff = from_rows([".WW.", "WWWW", "WWWW", ".WW."], {'W': '#FFFFFF'})
art['puff'] = puff.svg(P, pad=1)
steam = from_rows(["W.", ".W", "W.", ".W"], {'W': '#FFFFFF'})
art['steam'] = steam.svg(P, pad=1)

logo = from_rows([
    "....OOOOOO....",
    "..OOVVVVVVOO..",
    ".OVLLVVVVVVVO.",
    ".OVLVVVVVVVVO.",
    "OVVVVVVVVVWWVO",
    "OVVVVVVVVWWWVO",
    "OVWWVVVVWWWVVO",
    "OVWWWVVWWWVVVO",
    "OVVWWWWWWVVVVO",
    "OVVVWWWWVVVVVO",
    ".OVVVVWWVVVVO.",
    ".OVVVVVVVVVDO.",
    "..OODDDDDDOO..",
    "....OOOOOO....",
], {'O': O, 'V': '#5B45D6', 'L': '#A796F7', 'W': '#FFFFFF', 'D': '#4430B4'})
art['logo'] = logo.svg(P, pad=1)

art['glow'] = ('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs>'
               '<radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFF0A0" stop-opacity="0.7"/>'
               '<stop offset="1" stop-color="#FFF0A0" stop-opacity="0"/></radialGradient></defs><circle cx="80" cy="80" r="80" fill="url(#g)"/></svg>')
art['logoGlow'] = art['glow'].replace('#FFF0A0', '#8C78F5')

json.dump(art, open(sys.argv[1], 'w'), ensure_ascii=False)
print(len(art), 'Grafiken,', sum(len(v) for v in art.values()), 'Zeichen')
