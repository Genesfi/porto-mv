// ── Background CardStack Component (Hiasan Parallax) ──
function BackgroundCardStack({ cards, paused }) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (cards.length < 2 || paused) return;
    const t = setInterval(() => {
      setIndex(i => (i - 1 + cards.length) % cards.length);
    }, 3500);
    return () => clearInterval(t);
  }, [cards.length, paused]);

  if (!cards.length) return null;

  const visible = [0, 1, 2, 3].map(offset => cards[(index + offset + 2) % cards.length]);

  const POSITIONS_BG_DESKTOP = [
    { x: -250, y: 0, rotateZ: 15, rotateX: -20, scale: 0.45, opacity: 0.20, zIndex: 4 },
    { x: 0, y: 30, rotateZ: 5, rotateX: -15, scale: 0.4, opacity: 0.12, zIndex: 3 },
    { x: 250, y: 50, rotateZ: -5, rotateX: -10, scale: 0.35, opacity: 0.08, zIndex: 2 },
    { x: 500, y: 60, rotateZ: -15, rotateX: -5, scale: 0.3, opacity: 0.03, zIndex: 1 },
  ];
  const POSITIONS_BG_MOBILE = [
    { x: -120, y: 0, rotateZ: 15, rotateX: -20, scale: 0.45, opacity: 0.55, zIndex: 4 },
    { x: 0, y: 15, rotateZ: 5, rotateX: -15, scale: 0.4, opacity: 0.35, zIndex: 3 },
    { x: 120, y: 25, rotateZ: -5, rotateX: -10, scale: 0.35, opacity: 0.20, zIndex: 2 },
    { x: 230, y: 30, rotateZ: -15, rotateX: -5, scale: 0.3, opacity: 0.08, zIndex: 1 },
  ];
  const POSITIONS = isMobile ? POSITIONS_BG_MOBILE : POSITIONS_BG_DESKTOP;

  return (
    <div style={{
      position: "absolute",
      left: isMobile ? "50%" : "45%",
      top: isMobile ? "90%" : "90%",
      transform: "translate(-50%, -50%)",
      width: isMobile ? 380 : 1000,
      height: isMobile ? 220 : 300,
      perspective: "1400px",
      transformStyle: "preserve-3d",
      zIndex: 0,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {visible.map((card, depth) => {
          const pos = POSITIONS[depth];

          return (
            <motion.div
              key={card.key + "-bg"}
              style={{
                position: "absolute",
                left: 0, right: 0, margin: "0 auto",
                width: isMobile ? 160 : 400, height: isMobile ? 90 : 225,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 20px rgba(0,0,0,0.5)", // PERBAIKAN: Ganti filter jadi box-shadow
                willChange: "transform, opacity", // PERBAIKAN: Jalur VIP GPU
                transformOrigin: "center center",
                zIndex: pos.zIndex,
              }}
              initial={{ y: -100, x: -500, rotateZ: 30, rotateX: -30, scale: 0.2, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, rotateZ: pos.rotateZ, rotateX: pos.rotateX, scale: pos.scale, opacity: pos.opacity }}
              exit={{ y: 100, x: 700, rotateZ: -30, rotateX: 10, scale: 0.5, opacity: 0, zIndex: 5 }}
              transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <img src={card.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── Hero CardStack Component (Utama) ──
function HeroCardStack({ cards, onCardClick, paused, isMobileOverride }) {
  const [index, setIndex] = useState(0);
  const [isMobileInternal, setIsMobileInternal] = useState(false);
  const isMobile = isMobileOverride !== undefined ? isMobileOverride : isMobileInternal;

  useEffect(() => {
    const handleResize = () => setIsMobileInternal(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (cards.length < 2 || paused) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % cards.length);
    }, 3500);
    return () => clearInterval(t);
  }, [cards.length, paused]);

  if (!cards.length) return null;

  const visible = [0, 1, 2, 3].map(offset => cards[(index + offset) % cards.length]);

  const POSITIONS_DESKTOP = [
    { x: -140, y: -20, rotateZ: -5, rotateX: 18, scale: 1, opacity: 1, zIndex: 40 },
    { x: 80, y: 40, rotateZ: 6, rotateX: 25, scale: 0.9, opacity: 1, zIndex: 30 },
    { x: 260, y: 100, rotateZ: 18, rotateX: 30, scale: 0.8, opacity: 1, zIndex: 20 },
    { x: 420, y: 150, rotateZ: 28, rotateX: 34, scale: 0.7, opacity: 1, zIndex: 10 },
  ];

  const POSITIONS_MOBILE = [
    { x: -60, y: -10, rotateZ: -5, rotateX: 18, scale: 1, opacity: 1, zIndex: 40 },
    { x: 30, y: 20, rotateZ: 6, rotateX: 25, scale: 0.9, opacity: 1, zIndex: 30 },
    { x: 110, y: 50, rotateZ: 18, rotateX: 30, scale: 0.8, opacity: 1, zIndex: 20 },
    { x: 185, y: 75, rotateZ: 28, rotateX: 34, scale: 0.7, opacity: 1, zIndex: 10 },
  ];

  const POSITIONS = isMobile ? POSITIONS_MOBILE : POSITIONS_DESKTOP;
  const CARD_W = isMobile ? 260 : 560;
  const CARD_H = isMobile ? 146 : 315;

  return (
    <div style={{
      position: "absolute",
      left: isMobile ? "35%" : "55%",
      top: isMobile ? "45%" : "50%",
      transform: "translate(-50%, -50%)",
      width: isMobile ? 600 : 1000,
      height: isMobile ? 400 : 600,
      perspective: "1400px",
      transformStyle: "preserve-3d",
      zIndex: 1,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {visible.map((card, depth) => {
          const isTop = depth === 0;
          const pos = POSITIONS[depth];

          return (
            <motion.div
              key={card.key}
              onClick={isTop ? () => onCardClick(card.ytId) : undefined}
              style={{
                position: "absolute",
                left: 0, right: 0, margin: "0 auto",
                width: CARD_W, height: CARD_H,
                borderRadius: 16,
                overflow: "hidden",
                cursor: isTop ? "pointer" : "default",
                transformOrigin: "center center",
                zIndex: pos.zIndex,
                pointerEvents: "auto",
                boxShadow: isTop ? "0 30px 40px rgba(0,0,0,0.55)" : "0 8px 16px rgba(0,0,0,0.35)", // PERBAIKAN
                willChange: "transform, opacity, box-shadow", // PERBAIKAN
              }}
              initial={{ y: 200, x: isMobile ? 300 : 600, rotateZ: 35, rotateX: 45, scale: 0.6, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, rotateZ: pos.rotateZ, rotateX: pos.rotateX, scale: pos.scale, opacity: pos.opacity }}
              exit={{ y: -250, x: isMobile ? -200 : -500, rotateZ: -20, rotateX: 5, scale: 1.1, opacity: 0, zIndex: 50 }}
              transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
              whileHover={isTop ? {
                y: pos.y - 12, scale: 1.03, rotateZ: -1, rotateX: 10,
                boxShadow: "0 40px 60px rgba(0,0,0,0.7)", // PERBAIKAN
                transition: { duration: 0.3, ease: "easeOut" }
              } : {}}
            >
              <img src={card.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
