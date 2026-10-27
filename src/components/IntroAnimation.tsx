import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors, fonts } from '../theme';
import ART from './intro/art.json';

// Pixel-Szene oben auf der Begrüßung – ein schwebendes Zimmer, von schräg oben gesehen,
// wie in alten Handheld-Spielen. Läuft in Dauerschleife (ca. 16 Sekunden pro Runde).
// Grafiken: Pixel-Art aus intro/art.json (per Skript erzeugt), Raster 390 × 380 Punkte.
//
// Ablauf: Typ mit Kappe läuft rein → hüpft aufs Sofa → grübelt, Gedankenblasen ploppen auf →
// Wecker! Schreck, „Oh nein, Training!“ → SmoothStep-Häkchen kommt, Blasen werden zur
// abgehakten Liste → er jubelt → ausblenden → von vorn.

export const SCENE_W = 390;
export const SCENE_H = 380;

const A = ART as Record<string, string>;
type Art = keyof typeof ART;

// Größe jeder Grafik steht in ihrem SVG (width/height) – einmal auslesen.
const SIZE: Record<string, { w: number; h: number }> = {};
for (const k of Object.keys(A)) {
  const m = /width="([\d.]+)" height="([\d.]+)"/.exec(A[k]);
  SIZE[k] = { w: m ? Number(m[1]) : 0, h: m ? Number(m[2]) : 0 };
}

const Pic = React.memo(function Pic({ name }: { name: Art }) {
  const size = SIZE[name];
  if (!A[name] || !size) return null; // fehlende Grafik: lieber nichts zeigen als abstürzen
  return <SvgXml xml={A[name]} width={size.w} height={size.h} />;
});

type Sprite = 'walk0' | 'walk1' | 'walk2' | 'idle' | 'sit' | 'think' | 'shock' | 'happy';

const ITEMS: { label: string; bubble: Art; from: { x: number; y: number } }[] = [
  { label: 'Mama anrufen', bubble: 'bubble_butter', from: { x: 3, y: 4 } },
  { label: 'Training', bubble: 'bubble_mint', from: { x: 131, y: 4 } },
  { label: 'Einkaufen', bubble: 'bubble_peach', from: { x: 259, y: 4 } },
  { label: 'Wäsche', bubble: 'bubble_sky', from: { x: 60, y: 64 } },
];
const cardPos = (i: number) => ({ x: 12, y: 20 + i * 48 });

const ROOM = { x: 3, y: 20 };
const WALK_Y = 183; // Figur steht auf dem Boden
const SIT_Y = 95; // … sitzt auf dem Sofa
const SOFA_X = 237;
const START_X = -70;
const LOGO_FROM = { x: 430, y: 78 };
const LOGO_TO = { x: 184, y: 78 };
const WALK_MS = 3200;

const t = (v: Animated.Value, toValue: number, duration: number, easing: (n: number) => number = Easing.out(Easing.quad)) =>
  Animated.timing(v, { toValue, duration, easing, useNativeDriver: true });
const spring = (v: Animated.Value | Animated.ValueXY, toValue: any, friction = 5, tension = 90) =>
  Animated.spring(v, { toValue, friction, tension, useNativeDriver: true });

export default function IntroScene({ width }: { width: number }) {
  const s = width / SCENE_W;
  const height = Math.round(SCENE_H * s);

  const [sprite, setSprite] = useState<Sprite>('walk0');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);
  const running = useRef<Animated.CompositeAnimation[]>([]);
  const alive = useRef(true);

  const v = useMemo(
    () => ({
      scene: new Animated.Value(0),
      figX: new Animated.Value(START_X),
      figY: new Animated.Value(WALK_Y),
      shadow: new Animated.Value(1),
      puff: new Animated.Value(0),
      trail: new Animated.Value(0),
      clock: new Animated.Value(0),
      shake: new Animated.Value(0),
      ring: new Animated.Value(0),
      bang: new Animated.Value(0),
      sweat: new Animated.Value(0),
      speech: new Animated.Value(0),
      logo: new Animated.ValueXY(LOGO_FROM),
      glow: new Animated.Value(0),
      sparkle: new Animated.Value(0),
      lamp: new Animated.Value(0.4),
      steam: new Animated.Value(0),
      items: ITEMS.map((it) => ({
        pos: new Animated.ValueXY(it.from),
        appear: new Animated.Value(0),
        card: new Animated.Value(0),
        check: new Animated.Value(0),
      })),
    }),
    [],
  );

  useEffect(() => {
    alive.current = true;
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(() => alive.current && fn(), ms));
    const play = (a: Animated.CompositeAnimation, done?: () => void) => {
      running.current.push(a);
      a.start(({ finished }) => finished && alive.current && done?.());
      return a;
    };

    // Dampf aus dem Topf – läuft immer.
    play(Animated.loop(Animated.sequence([t(v.steam, 1, 1400, Easing.linear), t(v.steam, 0, 0)])));

    const reset = () => {
      v.figX.setValue(START_X);
      v.figY.setValue(WALK_Y);
      v.shadow.setValue(1);
      [v.puff, v.trail, v.clock, v.shake, v.ring, v.bang, v.sweat, v.speech, v.glow, v.sparkle].forEach((x) => x.setValue(0));
      v.lamp.setValue(0.4);
      v.logo.setValue(LOGO_FROM);
      v.items.forEach((it, i) => {
        it.pos.setValue(ITEMS[i].from);
        it.appear.setValue(0);
        it.card.setValue(0);
        it.check.setValue(0);
      });
      setSprite('walk0');
    };

    const round = () => {
      reset();

      // Laufzyklus: Sprite-Bilder im Wechsel, wie im Videospiel.
      let f = 0;
      const frames: Sprite[] = ['walk1', 'walk0', 'walk2', 'walk0'];
      const walkTimer = setInterval(() => {
        if (!alive.current) return;
        f = (f + 1) % frames.length;
        setSprite(frames[f]);
      }, 140);
      intervals.current.push(walkTimer);

      play(
        Animated.sequence([
          t(v.scene, 1, 400),
          // 1) Reinlaufen bis vors Sofa
          Animated.timing(v.figX, { toValue: SOFA_X, duration: WALK_MS, easing: Easing.linear, useNativeDriver: true }),
          Animated.delay(320), // umdrehen
          // 2) Hopp aufs Sofa (von schräg oben gesehen heißt das: nach hinten hoch)
          Animated.parallel([
            Animated.sequence([t(v.figY, SIT_Y - 34, 260), t(v.figY, SIT_Y, 200, Easing.in(Easing.quad))]),
            t(v.shadow, 0, 200),
            Animated.sequence([Animated.delay(460), t(v.puff, 1, 500)]),
          ]),
          Animated.delay(500),
          // 3) Grübeln, Gedanken ploppen auf
          t(v.trail, 1, 300),
          Animated.stagger(380, v.items.map((it) => spring(it.appear, 1, 4, 110))),
          Animated.delay(900),
          // 4) Wecker! Schreck!
          Animated.parallel([
            t(v.trail, 0, 150),
            spring(v.clock, 1, 4, 140),
            Animated.sequence(
              Array.from({ length: 12 }, (_, i) => t(v.shake, i % 2 ? -1 : 1, 50, Easing.linear)).concat([t(v.shake, 0, 50)]),
            ),
            Animated.sequence(
              Array.from({ length: 6 }, () => [t(v.ring, 1, 60, Easing.linear), t(v.ring, 0, 60, Easing.linear)]).flat(),
            ),
            Animated.sequence([t(v.figY, SIT_Y - 40, 180), t(v.figY, SIT_Y, 240, Easing.bounce)]),
            spring(v.bang, 1, 3, 160),
            Animated.sequence([Animated.delay(200), t(v.sweat, 1, 700, Easing.linear)]),
            Animated.sequence([Animated.delay(160), spring(v.speech, 1, 5, 100)]),
          ]),
          Animated.delay(1100),
          // 5) SmoothStep kommt und räumt auf
          Animated.parallel([
            t(v.clock, 0, 200),
            t(v.bang, 0, 200),
            t(v.sweat, 0, 200),
            t(v.speech, 0, 220),
            spring(v.logo, LOGO_TO, 6, 50),
            t(v.glow, 1, 500),
          ]),
          Animated.stagger(
            180,
            v.items.map((it, i) =>
              Animated.parallel([
                spring(it.pos, cardPos(i), 7, 60),
                t(it.card, 1, 300),
                Animated.sequence([Animated.delay(240), spring(it.check, 1, 3, 160)]),
              ]),
            ),
          ),
          // 6) Jubel
          Animated.parallel([
            Animated.sequence([t(v.figY, SIT_Y - 22, 160), t(v.figY, SIT_Y, 220, Easing.bounce)]),
            spring(v.sparkle, 1, 4, 70),
            t(v.lamp, 0.8, 500),
          ]),
          Animated.delay(2400),
          // 7) Ausblenden und von vorn
          t(v.scene, 0, 450, Easing.in(Easing.quad)),
        ]),
        round,
      );

      // Sprite-Wechsel passend zum Ablauf oben (Zeiten in ms ab Rundenstart)
      const arrive = 400 + WALK_MS; // vor dem Sofa angekommen
      const land = arrive + 320 + 460; // auf dem Sofa gelandet
      const shock = arrive + 320 + 960 + 500 + 300 + 380 * 3 + 600 + 900; // Wecker klingelt
      at(arrive, () => {
        clearInterval(walkTimer);
        setSprite('idle');
      });
      at(land, () => setSprite('sit'));
      at(land + 500, () => setSprite('think'));
      at(shock, () => setSprite('shock'));
      at(shock + 900 + 1100, () => setSprite('sit'));
      at(shock + 900 + 1100 + 800 + 1240, () => setSprite('happy'));
    };

    round();

    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
      intervals.current.forEach(clearInterval);
      running.current.forEach((a) => a.stop());
    };
  }, [v]);

  const shakeR = v.shake.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] });
  const puffO = v.puff.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });
  const puffY = v.puff.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const steamY = v.steam.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const steamO = v.steam.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const sweatY = v.sweat.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });
  const fade = (x: Animated.Value) => x.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  // Pixel-Look: Blasen poppen in Stufen auf (fühlt sich „8-bit“ an)
  const popScale = (x: Animated.Value) =>
    x.interpolate({ inputRange: [0, 0.33, 0.66, 1, 1.2], outputRange: [0.25, 0.25, 0.7, 1, 1.12] });

  const abs = (x: number, y: number) => ({ position: 'absolute' as const, left: x, top: y });

  return (
    <View
      style={{ width, height, overflow: 'hidden' }}
      accessible
      accessibilityLabel="Animation: Ein kleiner Typ mit Kappe vergisst sein Training, SmoothStep hilft ihm, den Tag zu ordnen."
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: SCENE_W,
          height: SCENE_H,
          left: (width - SCENE_W) / 2,
          top: (height - SCENE_H) / 2,
          transform: [{ scale: s }],
        }}
      >
        {/* Lampenschein + Zimmer */}
        <Animated.View style={[abs(111, 20), { opacity: v.lamp }]}>
          <Pic name="glow" />
        </Animated.View>
        <View style={abs(ROOM.x, ROOM.y)}>
          <Pic name="room" />
        </View>
        {[{ x: 99, y: 100, k: 0 }, { x: 107, y: 92, k: 1 }].map((p) => (
          <Animated.View
            key={p.k}
            style={[abs(p.x, p.y), { opacity: p.k ? Animated.multiply(steamO, 0.7) : steamO, transform: [{ translateY: steamY }] }]}
          >
            <Pic name="steam" />
          </Animated.View>
        ))}

        {/* Alles, was sich bewegt */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: v.scene }]} pointerEvents="none">
          {/* Schatten unter der Figur beim Laufen */}
          <Animated.View style={[abs(0, WALK_Y + 79), { opacity: v.shadow, transform: [{ translateX: v.figX }] }]}>
            <Pic name="shadow" />
          </Animated.View>

          {/* Staub beim Hinsetzen */}
          {[{ x: 222, y: 150 }, { x: 258, y: 158 }, { x: 294, y: 150 }].map((p, i) => (
            <Animated.View key={i} style={[abs(p.x, p.y), { opacity: puffO, transform: [{ translateY: puffY }] }]}>
              <Pic name="puff" />
            </Animated.View>
          ))}

          {/* Die Figur */}
          <Animated.View style={[abs(0, 0), { transform: [{ translateX: v.figX }, { translateY: v.figY }] }]}>
            <Pic name={`fig_${sprite}` as Art} />
          </Animated.View>

          {/* Gedanken-Pünktchen */}
          {[{ x: 228, y: 102 }, { x: 212, y: 96 }, { x: 196, y: 90 }].map((p, i) => (
            <Animated.View key={i} style={[abs(p.x, p.y), { opacity: v.trail }]}>
              <Pic name="trail" />
            </Animated.View>
          ))}

          {/* Gedankenblasen → abgehakte Liste */}
          {ITEMS.map((it, i) => {
            const a = v.items[i];
            return (
              <Animated.View
                key={it.label}
                style={[
                  styles.item,
                  {
                    opacity: a.appear.interpolate({ inputRange: [0, 0.3, 1.2], outputRange: [0, 1, 1] }),
                    transform: [{ translateX: a.pos.x }, { translateY: a.pos.y }, { scale: popScale(a.appear) }],
                  },
                ]}
              >
                <Animated.View style={[abs(0, 0), { opacity: fade(a.card) }]}>
                  <Pic name={it.bubble} />
                  <Text style={styles.bubbleText} numberOfLines={1}>
                    {it.label}
                  </Text>
                </Animated.View>
                <Animated.View style={[abs(0, 0), { opacity: a.card }]}>
                  <Pic name="card" />
                  <Animated.View style={[abs(10, 6), { transform: [{ scale: a.check }] }]}>
                    <Pic name="check" />
                  </Animated.View>
                  <Text style={styles.cardText} numberOfLines={1}>
                    {it.label}
                  </Text>
                </Animated.View>
              </Animated.View>
            );
          })}

          {/* Wecker */}
          <Animated.View style={[abs(302, 118), { opacity: v.ring }]}>
            <Pic name="ring" />
          </Animated.View>
          <Animated.View style={[abs(318, 114), { transform: [{ scale: v.clock }, { rotate: shakeR }] }]}>
            <Pic name="clock" />
          </Animated.View>

          {/* Schreck */}
          <Animated.View style={[abs(300, 30), { opacity: v.bang, transform: [{ scale: v.bang }] }]}>
            <Pic name="bang" />
          </Animated.View>
          <Animated.View style={[abs(226, 78), { opacity: v.sweat, transform: [{ translateY: sweatY }] }]}>
            <Pic name="sweat" />
          </Animated.View>
          <Animated.View style={[abs(56, 132), { opacity: v.speech, transform: [{ scale: v.speech }] }]}>
            <Pic name="speech" />
            <Text style={styles.speechText}>Oh nein, Training!</Text>
          </Animated.View>

          {/* SmoothStep-Häkchen mit Leuchten und Funkeln */}
          <Animated.View
            style={[abs(-48, -48), { opacity: v.glow, transform: [{ translateX: v.logo.x }, { translateY: v.logo.y }] }]}
          >
            <Pic name="logoGlow" />
          </Animated.View>
          <Animated.View style={[abs(0, 0), { transform: [{ translateX: v.logo.x }, { translateY: v.logo.y }] }]}>
            <Pic name="logo" />
          </Animated.View>
          {[{ x: 172, y: 70 }, { x: 246, y: 76 }, { x: 240, y: 138 }, { x: 170, y: 134 }].map((p, i) => (
            <Animated.View key={i} style={[abs(p.x, p.y), { opacity: v.sparkle, transform: [{ scale: v.sparkle }] }]}>
              <Pic name="sparkle" />
            </Animated.View>
          ))}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { position: 'absolute', left: 0, top: 0, width: 160, height: 48 },
  bubbleText: {
    position: 'absolute',
    left: 4,
    width: 120,
    top: 15,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ink,
  },
  cardText: { position: 'absolute', left: 50, top: 14, fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  speechText: {
    position: 'absolute',
    left: 4,
    width: 160,
    top: 15,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
});
