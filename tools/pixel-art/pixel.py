"""Pixel-Art-Werkzeug: Raster zeichnen und als SVG (zusammengefasste Rechtecke) ausgeben."""

class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.px = [[None] * w for _ in range(h)]

    def set(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h and c is not None:
            self.px[y][x] = c

    def rect(self, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w):
                self.set(i, j, c)

    def frame(self, x, y, w, h, c):
        self.rect(x, y, w, 1, c); self.rect(x, y + h - 1, w, 1, c)
        self.rect(x, y, 1, h, c); self.rect(x + w - 1, y, 1, h, c)

    def round_rect(self, x, y, w, h, fill, outline=None, r=1):
        """Rechteck mit abgeschnittenen Pixel-Ecken (r = 1 oder 2)."""
        for j in range(h):
            inset = 0
            if r >= 1 and (j == 0 or j == h - 1): inset = r
            elif r >= 2 and (j == 1 or j == h - 2): inset = 1
            for i in range(inset, w - inset):
                self.set(x + i, y + j, fill)
        if outline:
            for j in range(h):
                inset = 0
                if r >= 1 and (j == 0 or j == h - 1): inset = r
                elif r >= 2 and (j == 1 or j == h - 2): inset = 1
                if j in (0, h - 1):
                    for i in range(inset, w - inset): self.set(x + i, y + j, outline)
                else:
                    self.set(x + inset, y + j, outline); self.set(x + w - 1 - inset, y + j, outline)
            if r >= 2:
                for (i, j) in ((1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2)):
                    self.set(x + i, y + j, outline)

    def ellipse(self, cx, cy, rx, ry, c):
        for j in range(-ry, ry + 1):
            for i in range(-rx, rx + 1):
                if (i / (rx + 0.5)) ** 2 + (j / (ry + 0.5)) ** 2 <= 1:
                    self.set(cx + i, cy + j, c)

    def sprite(self, rows, pal, ox=0, oy=0, flip=False):
        for j, row in enumerate(rows):
            if flip: row = row[::-1]
            for i, ch in enumerate(row):
                if ch != '.':
                    self.set(ox + i, oy + j, pal[ch])

    def svg(self, scale, pad=0):
        """Gierig maximale Rechtecke zusammenfassen -> wenige Elemente, keine Haarlinien."""
        used = [[False] * self.w for _ in range(self.h)]
        out = []
        for y in range(self.h):
            for x in range(self.w):
                c = self.px[y][x]
                if c is None or used[y][x]: continue
                w = 1
                while x + w < self.w and self.px[y][x + w] == c and not used[y][x + w]: w += 1
                h = 1
                while y + h < self.h and all(self.px[y + h][x + k] == c and not used[y + h][x + k] for k in range(w)): h += 1
                for j in range(h):
                    for k in range(w): used[y + j][x + k] = True
                # minimal überlappen, damit beim Skalieren keine feinen Spalten entstehen
                out.append(f'<rect x="{x + pad}" y="{y + pad}" width="{w + 0.04}" height="{h + 0.04}" fill="{c}"/>')
        W, H = self.w + 2 * pad, self.h + 2 * pad
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * scale}" height="{H * scale}" viewBox="0 0 {W} {H}" '
                f'shape-rendering="crispEdges">{"".join(out)}</svg>')


def from_rows(rows, pal, flip=False):
    c = Canvas(max(len(r) for r in rows), len(rows))
    c.sprite(rows, pal, flip=flip)
    return c
