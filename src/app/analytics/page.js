import Link from "next/link";
import InteractiveGrid from "@/components/InteractiveGrid";
import AnalyzeGate from "@/components/analytics/AnalyzeGate";
import Collapsible from "@/components/ui/Collapsible";
import BarChart from "@/components/ui/BarChart";
import BattleCard from "@/components/analytics/BattleCard";
import ContentPlaybook from "@/components/analytics/ContentPlaybook";
import RedFlags from "@/components/analytics/RedFlags";
import TrendingScoped from "@/components/analytics/TrendingScoped";
import { analyzeAccount, fetchCompetitors, fetchTrending } from "@/lib/api";

export async function generateMetadata({ searchParams }) {
  const sp = (await searchParams) || {};
  const raw = (Array.isArray(sp.u) ? sp.u[0] : sp.u) || "";
  const handle = raw.replace(/^@+/, "").trim() || "akun";
  return {
    title: `@${handle} — Analitik Stratiq`,
    description: "Analisis AI untuk konten, engagement, dan pertumbuhan TikTok-mu.",
  };
}

/* ---------- helpers ---------- */

function fmt(n) {
  if (typeof n !== "number") return n ?? "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

const ACCENTS = ["#fe2c55", "#7b2ff7", "#25f4ee"];

function Card({ className = "", children, accent }) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-5 shadow-sm ${className}`}
         style={accent ? { borderTopColor: accent, borderTopWidth: "3px" } : undefined}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <Card accent={accent}>
      <p className="text-xs font-medium uppercase tracking-wide text-black/40">{label}</p>
      <p className="mt-2 text-3xl font-bold text-black">{value}</p>
      {sub && <p className="mt-1 text-xs text-black/45">{sub}</p>}
    </Card>
  );
}

function Gauge({ value, size = 160, color = "#fe2c55" }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - v / 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="12" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-black">{v}</div>
          <div className="text-xs font-medium text-black/40">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function Bar({ value, max = 100, accent }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: accent }} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-black/[0.03] py-2 text-center">
      <div className="text-sm font-bold text-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-black/40">{label}</div>
    </div>
  );
}

function Badge({ children, color = "#7b2ff7" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
      {children}
    </span>
  );
}

function Prose({ title, body, accent }) {
  if (!body) return null;
  return (
    <Card accent={accent}>
      <p className="mb-2 text-sm font-semibold text-black">{title}</p>
      <p className="text-sm leading-6 text-black/65">{body}</p>
    </Card>
  );
}

const BAND_LABEL = {
  healthy: { text: "Sehat", color: "#0fb5ad" },
  moderate: { text: "Cukup", color: "#f59e0b" },
  struggling: { text: "Perlu perhatian", color: "#fe2c55" },
};

/* ---------- page ---------- */

export default async function AnalyticsPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const raw = (Array.isArray(sp.u) ? sp.u[0] : sp.u) || "";
  const handle = raw.replace(/^@+/, "").trim();

  let data = null;
  let fetchError = null;
  if (handle) {
    try {
      data = await analyzeAccount(handle);
    } catch (e) {
      fetchError = e.message;
    }
  }

  if (!data) {
    return (
      <AnalyzeGate handle={handle}>
        <div className="relative min-h-dvh">
          <InteractiveGrid />
          <main className="relative z-10 mx-auto grid min-h-dvh max-w-xl place-items-center px-5">
            <div className="text-center">
              <Link href="/" className="text-lg font-bold tracking-tight text-black">Stratiq</Link>
              <h1 className="mt-6 text-2xl font-bold text-black">
                {fetchError ? "Gagal menganalisis" : "Masukkan username TikTok"}
              </h1>
              <p className="mt-2 text-sm text-black/55">
                {fetchError ? `Penyebab: ${fetchError}` : "Tambahkan ?u=username di URL untuk mulai analisis."}
              </p>
              <Link href="/" className="mt-6 inline-block rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white">
                Kembali ke beranda
              </Link>
            </div>
          </main>
        </div>
      </AnalyzeGate>
    );
  }

  const { profile, metrics: m, report, playbook, posts = [] } = data;
  const band = BAND_LABEL[data.health_band] || BAND_LABEL.moderate;
  const sb = m.score_breakdown || {};
  const name = profile.nickname || profile.username || handle;

  const engChart = [...posts].reverse()
    .filter((p) => p.engagement_rate > 0)
    .map((p, i) => ({ label: `#${i + 1}`, value: p.engagement_rate, tip: `${p.engagement_rate}% eng` }));

  const breakdownRows = [
    { label: "Kualitas konten", value: sb.content_quality ?? 0, accent: "#7b2ff7" },
    { label: "Engagement", value: sb.engagement ?? 0, accent: "#fe2c55" },
    { label: "Konsistensi", value: sb.consistency ?? 0, accent: "#25f4ee" },
    { label: "Pertumbuhan", value: sb.growth ?? 0, accent: "#7b2ff7" },
  ];
  const buckets = m.duration_buckets || {};
  const bucketChart = Object.entries(buckets).map(([k, v]) => ({ label: k, value: v, tip: `${k}: ${v} video` }));

  // Competitors + trending (same-category, parallel).
  const topTags = (m.top_hashtags || []).map((h) => h.tag);
  let comp = null, trending = null;
  if (profile.category || topTags.length) {
    const [c, t] = await Promise.allSettled([
      fetchCompetitors({
        category: profile.category || "",
        topHashtags: topTags.slice(0, 3),
        username: profile.username,
        followers: profile.followers,
        userMetrics: m,
        userTopVideos: data.top_videos || [],
      }),
      fetchTrending({
        category: profile.category || "",
        topHashtags: topTags.slice(0, 3),
        userStyle: report?.content_strategy || report?.profile_summary || "",
      }),
    ]);
    if (c.status === "fulfilled") comp = c.value;
    if (t.status === "fulfilled") trending = t.value;
  }

  const userForBattle = {
    nickname: name, username: profile.username, avatar: profile.avatar,
    followers: profile.followers, metrics: m,
  };
  const redFlags = data.red_flags || [];
  const diagnostics = report?.diagnostics || [];

  return (
    <AnalyzeGate handle={handle}>
      <div className="relative min-h-dvh">
        <InteractiveGrid />

        <header className="relative z-10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight text-black">Stratiq</Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black">
              Gratis untuk UMKM
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">
          {data.ai_unavailable && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              ⚠️ AI sedang sibuk — sebagian laporan ditampilkan dari data mentah. Coba lagi sebentar untuk versi lengkap.
            </div>
          )}

          {/* Hero */}
          <div className="flex flex-col gap-8 rounded-3xl border border-black/10 bg-white/90 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-4">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#fe2c55] text-2xl font-bold text-white shadow-sm">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-black">{name}</h1>
                  <p className="text-sm text-black/50">@{profile.username}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge color={band.color}>Status: {band.text}</Badge>
                {profile.verified && <Badge color="#25f4ee">✓ Terverifikasi</Badge>}
                {profile.category && <Badge color="#7b2ff7">{profile.category}</Badge>}
                {profile.tt_seller && <Badge color="#fe2c55">🛍 TikTok Shop</Badge>}
                {profile.has_story && <Badge color="#25f4ee">Story aktif</Badge>}
                {profile.private && <Badge color="#888">Privat</Badge>}
              </div>

              {profile.bio && <p className="mt-3 max-w-md text-sm text-black/55">{profile.bio}</p>}
              {profile.bio_link && <p className="mt-1 text-xs text-[#7b2ff7]">🔗 {profile.bio_link}</p>}

              {report?.roast && (
                <div className="mt-5 max-w-md rounded-2xl bg-black/[0.04] p-4">
                  <div className="mb-1.5 text-sm font-semibold text-black">Roasting AI</div>
                  <p className="text-sm leading-6 text-black/65">“{report.roast}”</p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-5 border-t border-black/[0.07] pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              <Gauge value={m.overall_score} size={132} color={band.color} />
              <div className="max-w-[160px]">
                <div className="mb-1 text-sm font-semibold text-black">Skor keseluruhan</div>
                <p className="text-xs text-black/50">Dari {m.posts_analyzed} video yang dianalisis.</p>
              </div>
            </div>
          </div>

          {/* AI summary */}
          {report?.profile_summary && (
            <Card accent={band.color} className="mt-6">
              <p className="text-sm leading-6 text-black/70">{report.profile_summary}</p>
            </Card>
          )}

          {/* Red Flags (conditional) */}
          {redFlags.length > 0 && (
            <Collapsible title="Red Flags" accent="#fe2c55" badge={redFlags.length} subtitle="Masalah serius yang terdeteksi AI — prioritaskan ini.">
              <RedFlags flags={redFlags} />
            </Collapsible>
          )}

          {/* Stats */}
          <Collapsible title="Statistik" accent="#fe2c55">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Pengikut" value={fmt(profile.followers)} sub={`Rasio F/F ${m.follower_following_ratio}`} accent="#fe2c55" />
              <StatCard label="Video" value={fmt(profile.video_count)} sub="Total posting" accent="#7b2ff7" />
              <StatCard label="Suka" value={fmt(profile.total_likes)} sub="Total likes diterima" accent="#25f4ee" />
              <StatCard label="Mengikuti" value={fmt(profile.following)} sub="Akun diikuti" accent="#7b2ff7" />
            </div>
          </Collapsible>

          {/* Engagement */}
          <Collapsible title="Engagement" accent="#7b2ff7" subtitle="Angka pasti (statsV2) dari video yang dianalisis.">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-black/40">Rata-rata engagement</p>
                    <p className="mt-1 text-3xl font-bold text-black">{m.engagement_rate}%</p>
                  </div>
                  <p className="text-xs text-black/40">{fmt(m.avg_views)} views rata-rata</p>
                </div>
                <div className="mt-5">
                  <BarChart data={engChart} unit="%" />
                </div>
                <p className="mt-2 text-[11px] text-black/35">Terlama → terbaru · arahkan kursor untuk detail</p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <Stat label="Like rate" value={`${m.like_rate}%`} />
                  <Stat label="Komen rate" value={`${m.comment_rate}%`} />
                  <Stat label="Share rate" value={`${m.share_rate}%`} />
                  <Stat label="Save rate" value={`${m.save_rate}%`} />
                </div>
              </Card>
              <Card>
                <div className="mb-3 text-sm font-semibold text-black">Rincian skor</div>
                <div className="flex flex-col gap-4">
                  {breakdownRows.map((s) => (
                    <div key={s.label}>
                      <div className="mb-1 flex justify-between text-xs text-black/55">
                        <span>{s.label}</span><span className="font-semibold text-black">{s.value}</span>
                      </div>
                      <Bar value={s.value} accent={s.accent} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Collapsible>

          {/* AI narrative */}
          <Collapsible title="Analisis AI" accent="#25f4ee" subtitle="Tiap bagian ditulis AI dari data akunmu.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Prose title="Strategi konten" body={report?.content_strategy} accent="#7b2ff7" />
              <Prose title="Analisis engagement" body={report?.engagement_analysis} accent="#fe2c55" />
              <Prose title="Pola posting" body={report?.posting_insights} accent="#25f4ee" />
              <Prose title="Strategi hashtag & musik" body={report?.hashtag_music_strategy} accent="#7b2ff7" />
              <Prose title="Perilaku audiens" body={report?.audience_behavior} accent="#fe2c55" />
              <Prose title="Tren pertumbuhan" body={report?.growth_trajectory} accent="#25f4ee" />
            </div>
          </Collapsible>

          {/* Diagnostics (adaptive — struggling accounts) */}
          {diagnostics.length > 0 && (
            <Collapsible title="Diagnosis mendalam" accent="#fe2c55" badge={diagnostics.length} subtitle="Akar masalah tiap metrik lemah + langkah perbaikan.">
              <div className="flex flex-col gap-3">
                {diagnostics.map((d, i) => (
                  <Card key={i} accent="#fe2c55">
                    <p className="text-sm font-semibold text-black">{d.metric}</p>
                    <p className="mt-1 text-sm leading-6 text-black/65"><span className="font-medium text-black/80">Akar masalah: </span>{d.root_cause}</p>
                    {d.example && <p className="mt-1 text-xs text-black/45">Contoh: {d.example}</p>}
                    {(d.fix_steps || []).length > 0 && (
                      <ol className="mt-2 flex flex-col gap-1">
                        {d.fix_steps.map((s, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-black/70">
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-black text-[10px] font-bold text-white">{j + 1}</span>{s}
                          </li>
                        ))}
                      </ol>
                    )}
                  </Card>
                ))}
              </div>
            </Collapsible>
          )}

          {/* Strengths / weaknesses */}
          <Collapsible title="Kekuatan & kelemahan" accent="#25f4ee">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card accent="#25f4ee">
                <p className="mb-3 text-sm font-semibold text-[#0fb5ad]">▲ Kekuatan</p>
                <ul className="flex flex-col gap-2.5">
                  {(report?.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-6 text-black/70">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0fb5ad]" />{s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card accent="#fe2c55">
                <p className="mb-3 text-sm font-semibold text-[#fe2c55]">▼ Kelemahan</p>
                <ul className="flex flex-col gap-2.5">
                  {(report?.weaknesses || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-6 text-black/70">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fe2c55]" />{s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </Collapsible>

          {/* Best / worst */}
          {(data.best_post || data.worst_post) && (
            <Collapsible title="Performa terbaik & terburuk" accent="#7b2ff7">
              <div className="grid gap-4 sm:grid-cols-2">
                {[["▲ Terbaik", data.best_post, "#25f4ee", "#0fb5ad"], ["▼ Perlu perbaikan", data.worst_post, "#fe2c55", "#fe2c55"]].map(
                  ([label, v, accent, text]) => v && (
                    <Card key={label} accent={accent}>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: text }}>{label}</p>
                      {v.cover && <img src={v.cover} alt="" className="mt-2 h-36 w-full rounded-lg object-cover" />}
                      <p className="mt-2 text-base font-semibold text-black">{v.title}</p>
                      <p className="text-xs text-black/45">{v.type} · {v.date} · {v.duration}s</p>
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <Stat label="Views" value={fmt(v.views)} />
                        <Stat label="Suka" value={fmt(v.likes)} />
                        <Stat label="Save" value={fmt(v.saves)} />
                        <Stat label="Eng." value={`${v.engagement}%`} />
                      </div>
                    </Card>
                  )
                )}
              </div>
            </Collapsible>
          )}

          {/* Recommendations + ideas */}
          <Collapsible title="Rekomendasi & ide konten" accent="#fe2c55">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <p className="mb-4 text-sm font-semibold text-black">Langkah berikutnya</p>
                <ul className="flex flex-col gap-3">
                  {(report?.recommendations || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-black/70">
                      <span className="shrink-0 text-base">{r.icon}</span>{r.text}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <p className="mb-4 text-sm font-semibold text-black">Ide konten untuk akun ini</p>
                <ul className="flex flex-col gap-3">
                  {(report?.content_ideas || []).map((idea, i) => (
                    <li key={i} className="rounded-xl bg-black/[0.03] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-black">{idea.title}</p>
                        <Badge color="#7b2ff7">{idea.estimated_reach}</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-black/55">{idea.description}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </Collapsible>

          {/* Content Playbook (replaces old score-bar section) */}
          {playbook && (
            <Collapsible title="Content Playbook" accent="#7b2ff7" subtitle="Panduan strategi AI khusus untuk akun ini — semua disertai data.">
              <ContentPlaybook playbook={playbook} collabRadar={comp?.collab_radar || []} />
            </Collapsible>
          )}

          {/* Frequency + duration */}
          <Collapsible title="Frekuensi, konsistensi & durasi" accent="#25f4ee" defaultOpen={false}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="flex items-center justify-around gap-4">
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-black/40">Posting / minggu</p>
                  <p className="mt-1 text-4xl font-bold text-black">{m.posts_per_week}</p>
                  <p className="mt-3 text-xs text-black/45">
                    Jam terbaik <span className="font-semibold text-black">{m.best_window || "-"}</span><br />{m.best_days || "-"}
                  </p>
                </div>
                <div className="h-24 w-px shrink-0 bg-black/10" />
                <div className="flex flex-col items-center text-center">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-black/40">Konsistensi</p>
                  <Gauge value={m.consistency_score} size={110} color="#25f4ee" />
                </div>
              </Card>
              <Card>
                <p className="mb-4 text-sm font-semibold text-black">Distribusi durasi video</p>
                <BarChart data={bucketChart} accents={["#7b2ff7", "#fe2c55", "#25f4ee", "#7b2ff7"]} height={96} />
                <p className="mt-4 text-xs text-black/45">Durasi rata-rata: <span className="font-semibold text-black">{m.avg_duration}s</span></p>
              </Card>
            </div>
          </Collapsible>

          {/* Hashtag + music */}
          <Collapsible title="Hashtag & musik" accent="#fe2c55" defaultOpen={false}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <p className="mb-3 text-sm font-semibold text-black">Hashtag paling sering dipakai</p>
                <div className="flex flex-wrap gap-2">
                  {(m.top_hashtags || []).map((h) => (
                    <span key={h.tag} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-black">
                      #{h.tag} <span className="text-black/40">×{h.count}</span>
                    </span>
                  ))}
                </div>
              </Card>
              <Card>
                <p className="mb-3 text-sm font-semibold text-black">Strategi sound</p>
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="Original" value={`${m.original_sound_pct}%`} />
                  <Stat label="Duet on" value={`${m.duet_enabled_pct}%`} />
                  <Stat label="Stitch on" value={`${m.stitch_enabled_pct}%`} />
                </div>
                {(m.top_music || []).length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {m.top_music.slice(0, 5).map((mu, i) => (
                      <li key={i} className="flex justify-between text-xs text-black/60">
                        <span className="truncate">🎵 {mu.title}</span><span className="text-black/40">×{mu.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </Collapsible>

          {/* Competitor battle cards */}
          {comp && comp.competitors?.length > 0 && (
            <Collapsible title="Analisis kompetitor" accent="#fe2c55" badge={comp.competitors.length}
              subtitle={`Ditemukan via kategori ${comp.discovery_signals?.category || "niche"}${(comp.discovery_signals?.hashtags_used || []).length ? " & hashtag " + comp.discovery_signals.hashtags_used.map((h) => "#" + h).join(", ") : ""} — bukan kemiripan nama. ${comp.candidates_found} kandidat dipindai, difilter ukuran audiens yang setara.`}>
              {comp.ai_unavailable && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  ⚠️ Sebagian analisis battle dari data mentah (AI sibuk).
                </div>
              )}
              <div className="flex flex-col gap-4">
                {comp.competitors.map((c) => <BattleCard key={c.username} user={userForBattle} comp={c} />)}
              </div>
            </Collapsible>
          )}

          {/* Category-scoped trending */}
          {trending && trending.videos?.length > 0 && (
            <Collapsible title="Trending di kategori-mu" accent="#25f4ee" subtitle="Video tren khusus kategori akunmu + cara adaptasinya." defaultOpen={false}>
              <TrendingScoped videos={trending.videos} />
            </Collapsible>
          )}

          {/* Popular + growth */}
          {(data.popular_posts?.length > 0 || data.growth?.recent_avg_views) && (
            <Collapsible title="Video populer & pertumbuhan" accent="#7b2ff7" defaultOpen={false}>
              {(data.popular_posts || []).length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {data.popular_posts.slice(0, 5).map((p) => (
                    <Card key={p.id} className="p-3">
                      {p.cover && <img src={p.cover} alt="" className="mb-2 aspect-[9/16] w-full rounded-lg object-cover" />}
                      <p className="truncate text-xs font-medium text-black">{p.desc || "(tanpa caption)"}</p>
                      <p className="text-[11px] text-black/45">{fmt(p.views)} · {p.engagement_rate}%</p>
                    </Card>
                  ))}
                </div>
              )}
              {data.growth?.recent_avg_views ? (
                <Card>
                  <p className="mb-3 text-sm font-semibold text-black">Sinyal pertumbuhan</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label="Views awal" value={fmt(data.growth.early_avg_views)} />
                    <Stat label="Views terbaru" value={fmt(data.growth.recent_avg_views)} />
                    <Stat label="Δ Views" value={`${data.growth.views_delta_pct}%`} />
                  </div>
                </Card>
              ) : null}
            </Collapsible>
          )}

          <p className="mt-10 text-center text-xs text-black/30">
            Data dari TikTok via Tikfly · Analisis oleh Stratiq AI
          </p>
        </main>
      </div>
    </AnalyzeGate>
  );
}
