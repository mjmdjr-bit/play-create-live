import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

        // Firebase 設定
        const firebaseConfig = {
            apiKey: "AIzaSyAA97KPsLsnHUg5G8Rtb7-3CwMJ1oynkVs",
            authDomain: "play-create-live.firebaseapp.com",
            databaseURL: "https://play-create-live-default-rtdb.firebaseio.com",
            projectId: "play-create-live",
            storageBucket: "play-create-live.firebasestorage.app",
            messagingSenderId: "143889321354",
            appId: "1:143889321354:web:3c2d16f5fd928ba10e0c73",
            measurementId: "G-ZFHF93QQCJ"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const $ = (s) => document.querySelector(s);

        function bindCardTap(card, onOpen) {
            const TAP_MOVE_PX = 14;   // 12〜16で調整（大きいほど誤爆しにくい）
            const TAP_TIME_MS = 450;

            let sx = 0, sy = 0, st = 0;
            let moved = false;
            let pointerId = null;

            // 縦スクロールを優先（これが効く）
            card.style.touchAction = "pan-y";

            card.addEventListener("pointerdown", (e) => {
                if (e.button != null && e.button !== 0) return;
                pointerId = e.pointerId;
                sx = e.clientX;
                sy = e.clientY;
                st = performance.now();
                moved = false;
                try { card.setPointerCapture(pointerId); } catch { }
            }, { passive: true });

            card.addEventListener("pointermove", (e) => {
                if (pointerId == null || e.pointerId !== pointerId) return;
                const dx = Math.abs(e.clientX - sx);
                const dy = Math.abs(e.clientY - sy);
                if (dx > TAP_MOVE_PX || dy > TAP_MOVE_PX) moved = true;
            }, { passive: true });

            card.addEventListener("pointerup", (e) => {
                if (pointerId == null || e.pointerId !== pointerId) return;

                const dt = performance.now() - st;
                const dx = Math.abs(e.clientX - sx);
                const dy = Math.abs(e.clientY - sy);

                const isTap = !moved && dx <= TAP_MOVE_PX && dy <= TAP_MOVE_PX && dt <= TAP_TIME_MS;
                pointerId = null;

                if (!isTap) return;

                // interactive elements are excluded from card-open behavior
                const t = e.target;
                if (t && t.closest && t.closest("button, a, input, textarea, select, [data-no-open]")) return;

                onOpen();
            }, { passive: true });

            card.addEventListener("pointercancel", () => { pointerId = null; }, { passive: true });
        }

        // 状態
        let creators = [];
        let projects = [];
        let currentSort = "newest";
        let currentSearch = "";
        let currentCategory = "";
        let currentCreatorName = "";
        let currentCreatorId = "";
        let currentCreatorUrl = "";

        const ADMIN_SECRET = "pcl-admin-2024";
        let isAdmin = false;

        // CGC MICRO DUST — visible cinematic silver particles
        (function () {
          const canvas = document.getElementById("particles");
          if (!canvas) return;
          const ctx = canvas.getContext("2d", { alpha: true });
          let W = 0, H = 0, dpr = 1;
          const mouse = { x: 0, y: 0, active: false };
          let parts = [];

          function resetParticle(p, randomPosition = true) {
            p.x = randomPosition ? Math.random() * W : (Math.random() < .5 ? -16 : W + 16);
            p.y = Math.random() * H;
            p.z = Math.random();
            p.r = (0.28 + Math.pow(p.z, 1.7) * 0.95) * dpr;
            p.vx = (Math.random() - 0.5) * (0.035 + p.z * 0.05) * dpr;
            p.vy = (Math.random() - 0.5) * 0.028 * dpr;
            p.alpha = 0.16 + p.z * 0.34;
            p.twinkle = Math.random() * Math.PI * 2;
            p.phase = Math.random() * Math.PI * 2;
          }

          function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = canvas.width = Math.max(innerWidth * dpr, 1);
            H = canvas.height = Math.max(innerHeight * dpr, 1);
            canvas.style.width = innerWidth + "px";
            canvas.style.height = innerHeight + "px";
            const count = Math.min(720, Math.max(420, Math.round(innerWidth * innerHeight / 3800)));
            parts = Array.from({ length: count }, () => { const p = {}; resetParticle(p, true); return p; });
          }

          resize();
          addEventListener("resize", resize, { passive: true });
          addEventListener("pointermove", (e) => {
            mouse.x = e.clientX * dpr;
            mouse.y = e.clientY * dpr;
            mouse.active = true;
          }, { passive: true });
          addEventListener("pointerleave", () => { mouse.active = false; }, { passive: true });

          function draw(t) {
            ctx.clearRect(0, 0, W, H);
            const time = t * 0.00035;

            for (const p of parts) {
              if (mouse.active) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const d2 = dx * dx + dy * dy;
                const range = 190 * dpr;
                if (d2 < range * range && d2 > 25) {
                  const d = Math.sqrt(d2);
                  const f = (1 - d / range) * 0.00012;
                  p.vx += dx * f;
                  p.vy += dy * f;
                }
              }

              p.vx += Math.sin(time + p.phase) * 0.000015 * dpr;
              p.vy += Math.cos(time * 0.7 + p.phase) * 0.000012 * dpr;
              p.vx *= 0.997;
              p.vy *= 0.997;
              p.x += p.vx;
              p.y += p.vy;
              p.twinkle += 0.004 + p.z * 0.009;

              if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) resetParticle(p, false);

              const pulse = 0.78 + Math.sin(p.twinkle) * 0.22;
              const a = Math.min(0.92, p.alpha * pulse);
              const radius = p.r * (0.7 + p.z * 0.55);

              ctx.beginPath();
              ctx.fillStyle = `rgba(226,238,244,${a})`;
              ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
              ctx.fill();

              if (p.z > 0.88) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(220,240,250,${a * 0.26})`;
                ctx.lineWidth = Math.max(0.35, dpr * 0.42);
                ctx.moveTo(p.x - radius * 2.4, p.y);
                ctx.lineTo(p.x + radius * 2.4, p.y);
                ctx.stroke();
              }
            }
            requestAnimationFrame(draw);
          }

          requestAnimationFrame(draw);
        })();

        // ==============================
        // SELECTED WORKS / PROJECTS
        // ==============================
        const DEFAULT_PROJECTS = [{
          id: "fuji-rock-world",
          title: "FUJI ROCK WORLD",
          clientName: "CGC / ORIGINAL PROJECT",
          category: "3D WEB APP / FESTIVAL EXPERIENCE",
          summary: "フジロックを世界ごと楽しむための3Dフェスティバル体験アプリ。仲間との現在地、ライブ予定、思い出をひとつのWORLDで共有するプロジェクトです。",
          thumbnailUrl: "",
          mediaType: "url",
          mediaUrl: "https://fujirock-26-app.web.app/",
          projectUrl: "https://fujirock-26-app.web.app/",
          sortOrder: 1,
          isPublished: true
        }];

        function projectMediaElement(project, detail = false) {
          const wrap = document.createElement("div");
          const url = detail
            ? (project.mediaUrl || project.thumbnailUrl || project.projectUrl)
            : (project.thumbnailUrl || project.mediaUrl || project.projectUrl);
          const type = (detail ? project.mediaType : project.thumbnailType) || project.mediaType || "image";
          if (!url) return wrap;

          if (type === "youtube") {
            const iframe = document.createElement("iframe");
            iframe.src = toYoutubeEmbed(url) + (detail ? "?autoplay=1" : "");
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            wrap.appendChild(iframe);
          } else if (type === "vimeo") {
            const iframe = document.createElement("iframe");
            iframe.src = toVimeoEmbed(url) + (detail ? "?autoplay=1" : "");
            iframe.allow = "autoplay; fullscreen; picture-in-picture";
            iframe.allowFullscreen = true;
            wrap.appendChild(iframe);
          } else if (type === "video") {
            const video = document.createElement("video");
            video.src = url;
            video.muted = !detail;
            video.loop = false;
            video.playsInline = true;
            video.controls = detail;
            video.autoplay = detail;
            video.preload = "metadata";
            wrap.appendChild(video);

            if (!detail) {
              const play = document.createElement("span");
              play.className = "project-video-play";
              wrap.appendChild(play);
            } else {
              video.play().catch(() => {});
            }
          } else if (type === "url") {
            if (detail) {
              const iframe = document.createElement("iframe");
              iframe.src = url;
              iframe.loading = "lazy";
              wrap.appendChild(iframe);
            } else {
              const fallback = document.createElement("div");
              fallback.className = "project-url-preview";
              fallback.textContent = project.title || "OPEN PROJECT";
              wrap.appendChild(fallback);
            }
          } else {
            const img = document.createElement("img");
            img.src = url;
            img.alt = project.title || "project";
            wrap.appendChild(img);
          }
          return wrap;
        }

        async function loadProjects() {
          try {
            const snap = await getDocs(collection(db, "projects"));
            projects = [];
            snap.forEach((docSnap) => {
              const d = docSnap.data();
              if (d.isPublished === false) return;
              projects.push({ id: docSnap.id, ...d });
            });
            if (!projects.length) projects = DEFAULT_PROJECTS.slice();
            projects.sort((a,b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
            renderProjects();
          } catch (err) {
            console.warn("projects load failed; using default project", err);
            projects = DEFAULT_PROJECTS.slice();
            renderProjects();
          }
        }

        function renderProjects() {
          const grid = document.getElementById("projectGrid");
          if (!grid) return;
          grid.innerHTML = "";
          projects.forEach((project, index) => {
            const card = document.createElement("article");
            card.className = "project-card";
            card.tabIndex = 0;
            const media = document.createElement("div"); media.className = "project-card-media";
            const el = projectMediaElement(project, false); while (el.firstChild) media.appendChild(el.firstChild);
            const content = document.createElement("div"); content.className = "project-card-content";
            content.innerHTML = `<div class="project-card-index">${String(index+1).padStart(2,"0")}</div><h3>${escapeProjectHtml(project.title || "UNTITLED")}</h3><div class="project-card-category">${escapeProjectHtml(project.category || "PROJECT")}</div>`;
            const arrow = document.createElement("div"); arrow.className = "project-card-arrow"; arrow.textContent = "↗";
            card.append(media, content, arrow);
            card.addEventListener("click", () => openProject(project));
            card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(project); } });
            grid.appendChild(card);
          });
        }

        function escapeProjectHtml(value) {
          return String(value || "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]));
        }

        function openProject(project) {
          const overlay = document.getElementById("projectOverlay");
          const media = document.getElementById("projectModalMedia");
          if (!overlay || !media) return;
          media.innerHTML = "";
          const el = projectMediaElement(project, true); while (el.firstChild) media.appendChild(el.firstChild);
          document.getElementById("projectModalTitle").textContent = project.title || "";
          document.getElementById("projectModalClient").textContent = project.clientName || "";
          document.getElementById("projectModalCategory").textContent = project.category || "";
          document.getElementById("projectModalSummary").textContent = project.summary || "";
          const link = document.getElementById("projectModalLink");
          // アプリURLを公開しない案件は、動画自体を外部リンクとして公開しない。
          link.href = project.projectUrl || "#";
          link.style.display = project.projectUrl ? "inline-flex" : "none";
          overlay.classList.add("show"); overlay.setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden";
        }

        function closeProject() {
          const overlay = document.getElementById("projectOverlay");
          const media = document.getElementById("projectModalMedia");
          overlay?.classList.remove("show"); overlay?.setAttribute("aria-hidden","true"); if (media) media.innerHTML = ""; document.body.style.overflow = "";
        }

        function setupProjectModal() {
          document.getElementById("projectClose")?.addEventListener("click", closeProject);
          document.getElementById("projectOverlay")?.addEventListener("click", e => { if (e.target.id === "projectOverlay") closeProject(); });
          window.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("projectOverlay")?.classList.contains("show")) closeProject(); });
        }


        // Creators取得
        async function loadCreators() {
            try {
                const snap = await getDocs(collection(db, "creators"));
                const list = [];

                snap.forEach(docSnap => {
                    const d = docSnap.data();
                    list.push({
                        id: docSnap.id,
                        name: d.name || "",
                        company: d.company || "",
                        url: d.url || "",
                        videoTitle: d.videoTitle || "",
                        summary: d.summary || "",
                        // ★ profileImage / profileImageUrl 両対応
                        profileImageUrl: d.profileImageUrl || d.profileImage || "",
                        videoUrl: d.videoUrl || "",
                        categories: Array.isArray(d.categories) ? d.categories : [],
                        works: Array.isArray(d.works) ? d.works : [],
                        createdAt: d.createdAt || null
                    });
                });

                console.log("✅ creators loaded:", list.length, list); // ★追加

                creators = list;
                console.log("first profile url:", creators[0]?.profileImageUrl);
                rebuildCategoryOptions();
                renderGrid();

            } catch (err) {
                console.error("❌ loadCreators error:", err); // ★追加
            }
        }


        function rebuildCategoryOptions() {
            const sel = $("#categorySelect");
            if (!sel) return;
            const set = new Set();
            creators.forEach(c => {
                (c.categories || []).forEach(cat => {
                    const t = (cat || "").trim();
                    if (t) set.add(t);
                });
            });
            sel.innerHTML = '<option value="">すべてのカテゴリ</option>';
            [...set].sort().forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat;
                sel.appendChild(opt);
            });
        }
        function toMillisSafe(v) {
            if (!v) return 0;

            // Firestore Timestamp
            if (typeof v.toMillis === "function") return v.toMillis();

            // JS Date
            if (v instanceof Date) return v.getTime();

            // number (already ms)
            if (typeof v === "number") return v;

            // string -> Date.parse
            if (typeof v === "string") {
                const t = Date.parse(v);
                return Number.isFinite(t) ? t : 0;
            }

            return 0;
        }


        function sortCreators(list) {
            const arr = list.slice();

            if (currentSort === "name-asc") {
                arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                return arr;
            }

            if (currentSort === "name-desc") {
                arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                return arr;
            }

            if (currentSort === "oldest") {
                arr.sort((a, b) => toMillisSafe(a.createdAt) - toMillisSafe(b.createdAt));
                return arr;
            }

            // newest
            arr.sort((a, b) => toMillisSafe(b.createdAt) - toMillisSafe(a.createdAt));
            return arr;
        }


        // Grid 描画
        function renderGrid() {
            const grid = $("#grid");
            if (!grid) return;

            grid.innerHTML = "";

            const s = (currentSearch || "").toLowerCase();
            let filtered = creators.filter(c => {
                const name = (c.name || "").toLowerCase();
                const cats = Array.isArray(c.categories) ? c.categories : [];
                const okName = !s || name.includes(s);
                const okCat = !currentCategory || cats.includes(currentCategory);
                return okName && okCat;
            });

            filtered = sortCreators(filtered);

            if (!filtered.length) {
                grid.innerHTML =
                    '<div style="padding:20px 0;text-align:center;color:#9ca3af;font-size:13px;">該当するクリエーターがいません。</div>';
                return;
            }

            filtered.forEach(c => {
                const card = document.createElement("div");
                card.className = "card";

                const tw = document.createElement("div");
                tw.className = "thumb-wrap";

                if (c.profileImageUrl) {
                    const img = document.createElement("img");
                    img.src = c.profileImageUrl;
                    img.alt = c.name || "profile";
                    img.className = "thumb";
                    tw.appendChild(img);
                } else {
                    const fb = document.createElement("div");
                    fb.className = "thumb-fallback";
                    tw.appendChild(fb);
                }

                const title = document.createElement("div");
                title.className = "thumb-title";
                title.textContent = c.videoTitle || c.name || "Untitled";
                tw.appendChild(title);

                const body = document.createElement("div");
                body.className = "card-body";

                if (Array.isArray(c.categories) && c.categories[0]) {
                    const chip = document.createElement("div");
                    chip.className = "category-chip";
                    chip.textContent = c.categories[0];
                    body.appendChild(chip);
                }

                const nameEl = document.createElement("div");
                nameEl.className = "creator-name";
                nameEl.textContent = c.name || "—";

                const compEl = document.createElement("div");
                compEl.className = "creator-company";
                compEl.textContent = c.company || "";

                body.appendChild(nameEl);
                body.appendChild(compEl);

                card.appendChild(tw);
                card.appendChild(body);

                // スマホ誤爆防止（タップ判定）
                bindCardTap(card, () => openDetailById(c.id));
                grid.appendChild(card);
            });
        }


        // 埋め込みURL変換
        function toYoutubeEmbed(urlOrId) {
            if (!urlOrId) return "";
            if (urlOrId.startsWith("https://www.youtube.com/embed/")) return urlOrId;
            let s = urlOrId.trim();
            const m = s.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_\-]{6,})/);
            if (m) {
                s = m[1];
            } else if (!/^[A-Za-z0-9_\-]{6,}$/.test(s)) {
                return "";
            }
            return `https://www.youtube.com/embed/${s}`;
        }

        function isVerticalYoutube(url) {
            if (!url) return false;
            return url.toLowerCase().includes("/shorts/");
        }

        function toVimeoEmbed(urlOrId) {
            if (!urlOrId) return "";
            if (urlOrId.startsWith("https://player.vimeo.com/video/")) return urlOrId;
            let s = urlOrId.trim();
            const m = s.match(/vimeo\.com\/(\d+)/);
            if (m) s = m[1];
            return `https://player.vimeo.com/video/${s}`;
        }

        // メイン動画
        function renderMainVideo(videoUrl) {
            const container = document.getElementById("detailVideoContainer");
            if (!container) return;
            container.innerHTML = "";

            if (!videoUrl) {
                const box = document.createElement("div");
                box.style.width = "100%";
                box.style.aspectRatio = "16/9";
                box.style.borderRadius = "14px";
                box.style.background = "#020617";
                container.appendChild(box);
                return;
            }

            const url = (videoUrl || "").toLowerCase();
            const isYouTube = url.includes("youtu.be") || url.includes("youtube.com");
            const isVimeo = url.includes("vimeo.com");
            const isFile = url.endsWith(".mp4") || url.endsWith(".mov") ||
                url.startsWith("https://firebasestorage.googleapis.com");

            if (isYouTube) {
                const iframe = document.createElement("iframe");
                iframe.src = toYoutubeEmbed(videoUrl);
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                iframe.allowFullscreen = true;
                iframe.frameBorder = "0";
                const vertical = isVerticalYoutube(videoUrl);
                container.style.aspectRatio = vertical ? "9/16" : "16/9";
                container.appendChild(iframe);
            } else if (isVimeo) {
                const iframe = document.createElement("iframe");
                iframe.src = toVimeoEmbed(videoUrl);
                iframe.allow = "autoplay; fullscreen; picture-in-picture";
                iframe.allowFullscreen = true;
                iframe.frameBorder = "0";
                container.style.aspectRatio = "16/9";
                container.appendChild(iframe);
            } else if (isFile) {
                const v = document.createElement("video");
                v.src = videoUrl;
                v.controls = true;
                v.playsInline = true;
                container.style.aspectRatio = "16/9";
                container.appendChild(v);
            } else {
                const iframe = document.createElement("iframe");
                iframe.src = videoUrl;
                iframe.allowFullscreen = true;
                iframe.frameBorder = "0";
                container.style.aspectRatio = "16/9";
                container.appendChild(iframe);
            }
        }


        // WORKS Lightbox
        function openWorksLightbox(work) {
            const overlay = document.getElementById("worksLightbox");
            const body = document.getElementById("worksLightboxBody");
            const caption = document.getElementById("worksLightboxCaption");
            if (!overlay || !body) return;
            body.innerHTML = "";
            if (caption) caption.textContent = work.title || "";
            const type = (work.type || "").toLowerCase();
            const url = work.url || "";
            if (!url) return;
            if (type === "image") {
                const img = document.createElement("img");
                img.src = url;
                img.alt = work.title || "work";
                body.appendChild(img);
            } else if (type === "youtube") {
                const iframe = document.createElement("iframe");
                iframe.src = toYoutubeEmbed(url);
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                iframe.allowFullscreen = true;
                iframe.frameBorder = "0";
                body.appendChild(iframe);
            } else if (type === "vimeo") {
                const iframe = document.createElement("iframe");
                iframe.src = toVimeoEmbed(url);
                iframe.allow = "autoplay; fullscreen; picture-in-picture";
                iframe.allowFullscreen = true;
                iframe.frameBorder = "0";
                body.appendChild(iframe);
            } else {
                const video = document.createElement("video");
                video.src = url;
                video.controls = true;
                video.playsInline = true;
                video.autoplay = true;
                body.appendChild(video);
                video.play().catch(() => {
                    // If autoplay is restricted, native controls remain available.
                });
            }
            overlay.classList.add("show");
            overlay.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }

        function closeWorksLightbox() {
            const overlay = document.getElementById("worksLightbox");
            const body = document.getElementById("worksLightboxBody");
            const caption = document.getElementById("worksLightboxCaption");
            overlay?.classList.remove("show");
            overlay?.setAttribute("aria-hidden", "true");
            if (body) body.innerHTML = "";
            if (caption) caption.textContent = "";
            const detailOpen = document.getElementById("detailOverlay")?.classList.contains("show");
            const contactOpen = document.getElementById("contactOverlay")?.classList.contains("show");
            document.body.style.overflow = detailOpen || contactOpen ? "hidden" : "";
        }

        function setupWorksLightbox() {
            const overlay = document.getElementById("worksLightbox");
            const closeBtn = document.getElementById("worksLightboxClose");
            closeBtn?.addEventListener("click", closeWorksLightbox);
            overlay?.addEventListener("click", (e) => {
                if (e.target === overlay) closeWorksLightbox();
            });
            window.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && document.getElementById("worksLightbox")?.classList.contains("show")) {
                    closeWorksLightbox();
                }
            });
        }

        // WORKS 描画
        function renderWorks(works) {
            const container = document.getElementById("worksContainer");
            if (!container) return;

            container.innerHTML = "";

            const list = Array.isArray(works) ? works : [];
            if (!list.length) {
                const msg = document.createElement("div");
                msg.className = "meta-text";
                msg.style.fontSize = "11px";
                msg.style.color = "#6b7280";
                msg.textContent = "登録された作品はまだありません。";
                container.appendChild(msg);
                return;
            }

            const grid = document.createElement("div");
            grid.className = "works-grid";

            list.forEach(w => {
                const card = document.createElement("div");
                card.className = "work-card";

                const thumb = document.createElement("div");
                thumb.className = "work-thumb";

                const type = (w.type || "").toLowerCase();
                const url = w.url;

                if (type === "image") {
                    const img = document.createElement("img");
                    img.src = url;
                    img.alt = w.title || "";
                    thumb.appendChild(img);
                } else if (type === "youtube") {
                    const iframe = document.createElement("iframe");
                    iframe.src = toYoutubeEmbed(url);
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                    iframe.allowFullscreen = true;
                    iframe.frameBorder = "0";
                    thumb.appendChild(iframe);
                } else if (type === "vimeo") {
                    const iframe = document.createElement("iframe");
                    iframe.src = toVimeoEmbed(url);
                    iframe.allow = "autoplay; fullscreen; picture-in-picture";
                    iframe.allowFullscreen = true;
                    iframe.frameBorder = "0";
                    thumb.appendChild(iframe);
                } else {
                    const v = document.createElement("video");
                    v.src = url;
                    v.muted = true;
                    v.playsInline = true;
                    v.preload = "metadata";
                    v.controls = false;
                    v.style.pointerEvents = "none";

                    v.addEventListener("loadedmetadata", () => {
                        try {
                            if (Number.isFinite(v.duration) && v.duration > 0.2) {
                                v.currentTime = Math.min(0.15, v.duration / 4);
                            }
                        } catch (err) {
                            console.warn("WORK thumbnail seek failed:", err);
                        }
                    }, { once: true });

                    thumb.appendChild(v);

                    const playMark = document.createElement("div");
                    playMark.className = "work-play-mark";
                    playMark.setAttribute("aria-hidden", "true");
                    thumb.appendChild(playMark);
                }

                card.appendChild(thumb);

                if (w.title) {
                    const titleEl = document.createElement("div");
                    titleEl.className = "work-title";
                    titleEl.textContent = w.title;
                    card.appendChild(titleEl);
                }
                if (w.type) {
                    const typeEl = document.createElement("div");
                    typeEl.className = "work-type";
                    typeEl.textContent = w.type;
                    card.appendChild(typeEl);
                }
                  card.addEventListener("click", () => {
                    openWorksLightbox(w);
                });

                grid.appendChild(card);
            });

            container.appendChild(grid);
        }

        function openDetailById(id) {
            try {
                const c = creators.find(x => x.id === id);
                console.log("✅ openDetailById found:", !!c, id);
                if (!c) return;

                openDetail(c);
                console.log("✅ after openDetail, overlay classes:", document.getElementById("detailOverlay")?.className);
            } catch (err) {
                console.error("❌ openDetailById error:", err);
                alert("openDetailでエラー: " + err.message);
            }
        }
        // DETAIL 開閉
        function openDetail(c) {
            currentCreatorName = c?.name || "";
            currentCreatorId = c?.id || "";
            currentCreatorUrl = c?.url || "";
            const avatar = $("#detailAvatar");
            const nameEl = $("#detailName");
            const compEl = $("#detailCompany");
            const urlBox = $("#detailUrl");
            const titleEl = $("#detailVideoTitle");
            const aboutEl = $("#detailAbout");

            avatar.innerHTML = c.profileImageUrl
                ? `<img src="${c.profileImageUrl}" alt="${c.name || "avatar"}">`
                : "";

            nameEl.textContent = c.name || "";
            compEl.textContent = c.company || "";
            titleEl.textContent = c.videoTitle || "";
            aboutEl.textContent = c.summary || "";

            urlBox.innerHTML = "";
            if (c.url) {
                const a = document.createElement("a");
                a.href = c.url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.textContent = c.url.replace(/^https?:\/\//, "");
                urlBox.appendChild(a);
            }

            renderMainVideo(c.videoUrl);
            renderWorks(c.works);


            const ov = document.getElementById("detailOverlay");
            console.log("detailOverlay exists:", !!ov);
            ov?.classList.add("show");
            const dcb = document.getElementById("detailContactBtn");
            if (dcb) {
                dcb.dataset.creatorName = currentCreatorName || "";
                dcb.dataset.creatorId = currentCreatorId || "";
                dcb.dataset.creatorUrl = currentCreatorUrl || "";
            }

            ov.style.zIndex = "2000";

            document.body.style.overflow = "hidden";
            console.log("✅ overlay show added");
        }

        function closeDetail() {
            const overlay = $("#detailOverlay");
            const videoWrap = $("#detailVideoContainer");
            const worksWrap = $("#worksContainer");
            overlay.classList.remove("show");
            if (videoWrap) videoWrap.innerHTML = "";
            if (worksWrap) worksWrap.innerHTML = "";
            const contactOpen = document.getElementById("contactOverlay")?.classList.contains("show");
            if (!contactOpen) document.body.style.overflow = "";

        }

        // 検索 & ソート
        function setupSearchAndSort() {
            const sIn = $("#searchInput");
            const cSel = $("#categorySelect");
            const sort = $("#sortSelect");

            if (sIn) {
                sIn.addEventListener("input", e => {
                    currentSearch = e.target.value || "";
                    renderGrid();
                });
            }
            if (cSel) {
                cSel.addEventListener("change", e => {
                    currentCategory = e.target.value || "";
                    renderGrid();
                });
            }
            if (sort) {
                sort.addEventListener("change", e => {
                    currentSort = e.target.value || "newest";
                    renderGrid();
                });
            }
        }

        // メニュー & モーダル クローズ
        function setupModalClose() {
            const closeBtn = $("#detailClose");
            const overlay = $("#detailOverlay");
            if (closeBtn) {
                closeBtn.addEventListener("click", closeDetail);
            }
            if (overlay) {
                overlay.addEventListener("click", e => {
                    if (e.target.id === "detailOverlay") closeDetail();
                });
            }
            window.addEventListener("keydown", e => {
                if (e.key === "Escape" && document.getElementById("detailOverlay")?.classList.contains("show")) {
                    closeDetail();
                }
            });
        }

        function setupMenu() {
            const btn = $("#menuButton");
            const ov = $("#menuOverlay");
            if (!btn || !ov) return;

            const closeMenu = () => {
                btn.classList.remove("active");
                ov.classList.remove("show");
            };

            const toggle = () => {
                btn.classList.toggle("active");
                ov.classList.toggle("show");
            };

            btn.addEventListener("click", toggle);
            ov.addEventListener("click", e => {
                if (e.target.id === "menuOverlay") closeMenu();
            });

            ov.querySelectorAll('a[href^="#"]').forEach(link => {
                link.addEventListener("click", e => {
                    const targetId = link.getAttribute("href");
                    if (!targetId || targetId === "#") return;
                    e.preventDefault();
                    closeMenu();
                    document.querySelector(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
            });

            $("#menuContact")?.addEventListener("click", e => {
                e.preventDefault();
                closeMenu();
                $("#contactBtn")?.click();
            });

            window.addEventListener("keydown", e => {
                if (e.key === "Escape" && ov.classList.contains("show")) closeMenu();
            });

            document.body.style.overflow = "";
        }
      // ==============================
      // CGC BGM
      // ==============================
      const BGM_TRACKS = [
  "audio/bgm-01.mp3",
  "audio/bgm-02.mp3",
  "audio/bgm-03.mp3",
  "audio/bgm-04.mp3"
];

let bgmTrackIndex = -1;
let bgmEnabled = false;

const bgmAudio = new Audio();
bgmAudio.loop = true;
bgmAudio.volume = 0.42;
bgmAudio.preload = "auto";

function setupBgmToggle() {
  const btn = document.getElementById("soundToggleBtn");
  const text = document.getElementById("soundToggleText");

  if (!btn || !text) return;

  function updateUI() {
    btn.classList.toggle("is-on", bgmEnabled);
    text.textContent = bgmEnabled
      ? `SOUND ON ${bgmTrackIndex + 1}/4`
      : "SOUND OFF";
  }

  async function playTrack(index) {
    bgmTrackIndex = index;
    bgmEnabled = true;

    bgmAudio.pause();
    bgmAudio.src = BGM_TRACKS[bgmTrackIndex];
    bgmAudio.currentTime = 0;

    updateUI();
    unlockAudio();

    try {
      await bgmAudio.play();
    } catch (err) {
      console.warn("BGM play blocked:", err);
    }
  }

  function stopBgm() {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmTrackIndex = -1;
    bgmEnabled = false;
    updateUI();
  }

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    playClickSE();

    const nextIndex = bgmTrackIndex + 1;

    if (nextIndex >= BGM_TRACKS.length) {
      stopBgm();
      return;
    }

    await playTrack(nextIndex);
  });

  updateUI();
 }



        // ==============================
        // CGC 3D HERO / Three.js GLB Viewer
        // ==============================
        const CGC_MODELS = [
         "models/01.glb",
         "models/02.glb",
         "models/03.glb",
        ];

        let cgcModelIndex = 0;

        function setupCgcHero3D() {
        const mount = document.getElementById("hero3dCanvas");
         if (!mount) return;

        const PC_X_OFFSET = 0.15;
        const MOBILE_X_OFFSET = 0;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
         38,
         mount.clientWidth / mount.clientHeight,
         0.1,
         100
        );
        camera.position.set(0, 0.2, 3.0);

        const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
       });

       renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
       renderer.setSize(mount.clientWidth, mount.clientHeight);
       renderer.setClearColor(0x000000, 0);
       renderer.outputColorSpace = THREE.SRGBColorSpace;
       renderer.toneMapping = THREE.ACESFilmicToneMapping;
       renderer.toneMappingExposure = 1.15;

      mount.innerHTML = "";
      mount.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.04;

      controls.enablePan = false;
      controls.enableZoom = true;
      controls.enableRotate = true;

      controls.minDistance = 2.0;
      controls.maxDistance = 7.2;

      controls.rotateSpeed = 1.35;
      controls.zoomSpeed = 0.9;

      controls.autoRotate = false;

      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;

      controls.touches = {
       ONE: THREE.TOUCH.ROTATE,
       TWO: THREE.TOUCH.DOLLY_ROTATE
      };

      let touchStartX = 0;
      let touchStartY = 0;
      let touchMode = "none";
      // none / scroll / rotate / multi

     const TOUCH_ROTATE_THRESHOLD = 6;
     const TOUCH_DIRECTION_BIAS = 1.05;

     renderer.domElement.addEventListener("pointerdown", (e) => {
      lastInteraction = performance.now();

      isPointerActive = true;

      if (window.innerWidth <= 768 && e.pointerType === "touch") {
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        touchMode = "none";

        // 2本指以上は即OrbitControlsに渡す
       if (e.isPrimary === false) {
         touchMode = "multi";
         controls.enabled = true;
         return;
        }

       // 1本指は最初だけ方向判定
       controls.enabled = false;
       return;
      }

      controls.enabled = true;
     }, { passive: true });

     renderer.domElement.addEventListener("pointermove", (e) => {
      if (!(window.innerWidth <= 768 && e.pointerType === "touch")) return;

      // 2本指は常にズーム・回転OK
      if (touchMode === "multi" || e.isPrimary === false) {
        touchMode = "multi";
        controls.enabled = true;
        lastInteraction = performance.now();
        return;
      }

     const dx = e.clientX - touchStartX;
     const dy = e.clientY - touchStartY;

     const absX = Math.abs(dx);
     const absY = Math.abs(dy);

     if (touchMode === "none") {
      if (absX < TOUCH_ROTATE_THRESHOLD && absY < TOUCH_ROTATE_THRESHOLD) return;

      // ほぼ横、斜め、少し縦でも3D操作に入る
      if (absX > absY * TOUCH_DIRECTION_BIAS || absY < 42) {
       touchMode = "rotate";
       controls.enabled = true;
       mount.closest(".hero-3d")?.classList.add("is-touch-rotating");
      } else {
       touchMode = "scroll";
       controls.enabled = false;
      }
     }

     if (touchMode === "rotate") {
      controls.enabled = true;
      lastInteraction = performance.now();
     }
     }, { passive: true });

     renderer.domElement.addEventListener("pointerup", () => {
       isPointerActive = false;
       touchMode = "none";
       controls.enabled = true;
       lastInteraction = performance.now();

       mount.closest(".hero-3d")?.classList.remove("is-touch-rotating");
     }, { passive: true });

     renderer.domElement.addEventListener("pointercancel", () => {
      isPointerActive = false;
      touchMode = "none";
      controls.enabled = true;

      mount.closest(".hero-3d")?.classList.remove("is-touch-rotating");
     }, { passive: true });

      scene.add(new THREE.AmbientLight(0xffffff, 1.2));

      const keyLight = new THREE.DirectionalLight(0x9bdcff, 3.2);
       keyLight.position.set(3, 4, 5);
      scene.add(keyLight);

      const orangeLight = new THREE.PointLight(0xff8c37, 7, 9);
      orangeLight.position.set(-2.8, -1.4, 2.5);
      scene.add(orangeLight);

      const blueLight = new THREE.PointLight(0x38bdf8, 8, 10);
      blueLight.position.set(2.8, 1.2, 2.5);
      scene.add(blueLight);

      const loader = new GLTFLoader();

      let currentModel = null;
      let modelLoadToken = 0;

      let targetRotationY = 0;
      let targetRotationX = 0;
      let baseRotation = 0;

      let isPointerActive = false;
      let lastInteraction = performance.now();

      let autoModelTimer = null;


     function normalizeModel(model) {
     const box = new THREE.Box3().setFromObject(model);
     const size = new THREE.Vector3();
     const center = new THREE.Vector3();

     box.getSize(size);
     box.getCenter(center);

     const maxAxis = Math.max(size.x, size.y, size.z) || 1;
     const scale = 2.0 / maxAxis;

     model.scale.setScalar(scale);
     model.position.sub(center.multiplyScalar(scale));

     model.position.x = window.innerWidth >= 900 ? PC_X_OFFSET : MOBILE_X_OFFSET;
     model.position.y = 0;
     model.position.z = 0;
    }

    function disposeModel(model) {
     if (!model) return;

     scene.remove(model);

     model.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();

      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose?.());
        } else {
          obj.material.dispose?.();
        }
       }
      });
    }

    function loadCgcModel(index) {
     const path = CGC_MODELS[index];
      if (!path) return;

     const token = ++modelLoadToken;

     loader.load(
      path,
      (gltf) => {
        if (token !== modelLoadToken) {
          disposeModel(gltf.scene);
          return;
        }

        if (currentModel) {
          disposeModel(currentModel);
          currentModel = null;
        }

        const model = gltf.scene;

        normalizeModel(model);
        model.rotation.set(0.18, 0, 0);

        currentModel = model;
        scene.add(currentModel);

        const placeholder = document.getElementById("hero3dPlaceholder");
        if (placeholder) placeholder.style.display = "none";
      },
      undefined,
      (err) => {
        console.warn("GLB load failed:", path, err);
       }
      );
    }

    function nextModel() {
      cgcModelIndex = (cgcModelIndex + 1) % CGC_MODELS.length;
      loadCgcModel(cgcModelIndex);
    }

    function prevModel() {
     cgcModelIndex =
      (cgcModelIndex - 1 + CGC_MODELS.length) % CGC_MODELS.length;
     loadCgcModel(cgcModelIndex);
    }

    function restartAutoModelTimer() {
      if (autoModelTimer) clearInterval(autoModelTimer);

       autoModelTimer = setInterval(() => {
       nextModel();
       }, 12000);
    }

    const nextBtn = document.getElementById("modelNextBtn");
    const prevBtn = document.getElementById("modelPrevBtn");

    nextBtn?.addEventListener("pointerup", (e) => {
      e.preventDefault();
      e.stopPropagation();

      unlockAudio();
      playClickSE();

      nextModel();
      restartAutoModelTimer();
    });

    prevBtn?.addEventListener("pointerup", (e) => {
      e.preventDefault();
      e.stopPropagation();

      unlockAudio();
      playClickSE();

      prevModel();
      restartAutoModelTimer();
    });

    renderer.domElement.addEventListener("pointermove", (e) => {
      if (!(window.innerWidth <= 768 && e.pointerType === "touch")) return;

      const dx = e.clientX - touchStartX;
      const dy = e.clientY - touchStartY;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (touchMode === "none") {
        if (absX < TOUCH_ROTATE_THRESHOLD && absY < TOUCH_ROTATE_THRESHOLD) return;

        if (absX > absY * TOUCH_DIRECTION_BIAS) {
          touchMode = "rotate";
          controls.enabled = true;
          mount.closest(".hero-3d")?.classList.add("is-touch-rotating");
        } else {
         touchMode = "scroll";
         controls.enabled = false;
        }
      }

     if (touchMode === "rotate") {
       controls.enabled = true;
       lastInteraction = performance.now();
     }
    }, { passive: true });

    renderer.domElement.addEventListener("pointerup", () => {
      isPointerActive = false;
      touchMode = "none";
      controls.enabled = true;
      lastInteraction = performance.now();

     mount.closest(".hero-3d")?.classList.remove("is-touch-rotating");
    }, { passive: true });

    renderer.domElement.addEventListener("pointercancel", () => {
      isPointerActive = false;
      touchMode = "none";
      controls.enabled = true;

      mount.closest(".hero-3d")?.classList.remove("is-touch-rotating");
    }, { passive: true });


    function animate(now) {
      requestAnimationFrame(animate);

     const elapsed = now * 0.001;
     const idle = now - lastInteraction > 1200;

     if (currentModel) {
     if (idle && !isPointerActive) {
      baseRotation = Math.sin(elapsed * 0.18) * 0.75;

      targetRotationY = baseRotation;
      targetRotationX = 0.18 + Math.sin(elapsed * 0.42) * 0.08;

      currentModel.rotation.y +=
        (targetRotationY - currentModel.rotation.y) * 0.018;

      currentModel.rotation.x +=
        (targetRotationX - currentModel.rotation.x) * 0.016;

      mount.closest(".hero-3d")?.classList.add("is-rotating");
     } else {
      mount.closest(".hero-3d")?.classList.remove("is-rotating");
     }

     currentModel.position.y = Math.sin(elapsed * 0.55) * 0.05;
     currentModel.position.z = Math.sin(elapsed * 0.28) * 0.03;

     }

     controls.update();
     renderer.render(scene, camera);
    }

    function onResize() {
     const w = mount.clientWidth;
     const h = mount.clientHeight;

      if (!w || !h) return;

     camera.aspect = w / h;
     camera.updateProjectionMatrix();

     renderer.setSize(w, h);

     if (currentModel) {
      currentModel.position.x =
        window.innerWidth >= 900 ? PC_X_OFFSET : MOBILE_X_OFFSET;
      }
     }

     window.addEventListener("resize", onResize);

     loadCgcModel(cgcModelIndex);
     restartAutoModelTimer();
     requestAnimationFrame(animate);
     } // setupCgcHero3D


    // ==============================
    // CGC ARTIFACT / 3D LOGO
    // ==============================
    function setupCgcArtifact3D() {
      const mount = document.getElementById("cgcArtifactCanvas");
      if (!mount) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        34,
        Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1),
        0.1,
        100
      );
      camera.position.set(0, 0.08, 4.1);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xf4f9fc, 0.58));

      const key = new THREE.DirectionalLight(0xf5fbff, 4.6);
      key.position.set(3.4, 4.2, 5.0);
      key.intensity = 3.15;
      scene.add(key);

      const rim = new THREE.PointLight(0xe8f8ff, 4.8, 12);
      rim.position.set(-2.6, 1.8, 3.0);
      scene.add(rim);

      const scanLight = new THREE.PointLight(0xffffff, 0, 7.0);
      scanLight.position.set(-3.2, 0.2, 2.5);
      scene.add(scanLight);

      const loader = new GLTFLoader();
      let model = null;
      let modelReady = false;
      let targetY = 0;
      let currentY = 0;
      let pointerX = 0;
      let pointerY = 0;
      let active = false;
      let hovering = false;
      let lastTime = performance.now();

      loader.load(
        "models/cgc-logo.glb",
        (gltf) => {
          model = gltf.scene;

          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          const maxAxis = Math.max(size.x, size.y, size.z) || 1;
          const scale = 2.15 / maxAxis;
          model.scale.setScalar(scale);
          model.position.sub(center.multiplyScalar(scale));
          model.rotation.set(0.08, -0.12, 0.02);

          model.traverse((obj) => {
            if (!obj.isMesh) return;
            if (obj.material) {
              const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
              materials.forEach((material) => {
                if (material.color) material.color.setRGB(0.34, 0.39, 0.42);
                if ("roughness" in material) material.roughness = 0.11;
                if ("metalness" in material) material.metalness = 0.98;
                if ("emissive" in material) { material.emissive.setRGB(0.028, 0.038, 0.045); material.emissiveIntensity = 0.34; }
                material.needsUpdate = true;
              });
            }
          });

          scene.add(model);
          modelReady = true;
        },
        undefined,
        (err) => {
          console.warn("CGC Artifact GLB load failed:", err);
        }
      );

      const observer = new IntersectionObserver((entries) => {
        active = entries.some((entry) => entry.isIntersecting);
      }, { threshold: 0.08 });
      observer.observe(mount);

      const onPointerMove = (event) => {
        const rect = mount.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        pointerY = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
        hovering = true;
      };

      mount.addEventListener("pointermove", onPointerMove, { passive: true });
      mount.addEventListener("pointerenter", () => { hovering = true; }, { passive: true });
      mount.addEventListener("pointerleave", () => {
        hovering = false;
        pointerX = 0;
        pointerY = 0;
      }, { passive: true });

      function resize() {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      window.addEventListener("resize", resize, { passive: true });

      function animate(now) {
        requestAnimationFrame(animate);
        if (!active && !modelReady) return;

        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        if (model && active) {
          const time = now * 0.001;
          targetY = Math.sin(time * 0.16) * 0.055 + pointerX * 0.075;
          currentY += (targetY - currentY) * 0.035;

          model.rotation.y = currentY;
          model.rotation.x = 0.055 + pointerY * -0.045 + Math.sin(time * 0.20) * 0.018;
          model.position.y = Math.sin(time * 0.42) * 0.04;
          model.position.z = Math.sin(time * 0.21) * 0.025;

          const scan = (Math.sin(time * 0.72) + 1) * 0.5;
          scanLight.position.x = -3.0 + scan * 6.0;
          scanLight.position.y = 0.15 + Math.sin(time * 0.43) * 0.5;
          scanLight.intensity = 0.55 + Math.pow(Math.max(0, Math.sin(time * 0.72)), 10) * 8.0;
          if (hovering) {
            rim.intensity += (6.8 - rim.intensity) * Math.min(dt * 3.0, 1);
            scanLight.intensity *= 1.35;
          } else {
            rim.intensity += (4.8 - rim.intensity) * Math.min(dt * 2.0, 1);
          }
        }

        renderer.render(scene, camera);
      }

      resize();
      requestAnimationFrame(animate);
    }

     function setupWorkflowVideos() {
       document.querySelectorAll(".workflow-step").forEach((step) => {
         const video = step.querySelector("video");
         if (!video) return;

         video.pause();
         video.currentTime = 0;

         const playVideo = () => {
          video.play().catch(() => {});
         };

         const stopVideo = () => {
          video.pause();
          video.currentTime = 0;
         };

         step.addEventListener("mouseenter", playVideo);
         step.addEventListener("mouseleave", stopVideo);

         step.addEventListener("touchstart", () => {
           document.querySelectorAll(".workflow-step video").forEach((v) => {
             if (v !== video) {
               v.pause();
               v.currentTime = 0;
             }
           });

           playVideo();
          }, { passive: true });
        });
    }

    // 初期化
       (function init() {
        setupSearchAndSort();
        setupModalClose();
        setupMenu();
        setupWorksLightbox();
        setupProjectModal();
        setupWorkflowVideos();
        setupBgmToggle();

       loadCreators();
       loadProjects();

       const heroVideo = document.querySelector(".cgc-cinematic-video");
       if (heroVideo) {
         const heroSources = [
           "media/cgc-hero.mp4",
           "media/cgc-hero-2.mp4"
         ];
         let heroIndex = Number(localStorage.getItem("cgcHeroVideoIndex") || "0");
         heroIndex = heroIndex === 1 ? 1 : 0;
         heroVideo.src = heroSources[heroIndex];
         heroVideo.load();
         heroVideo.play().catch(() => {});
         localStorage.setItem("cgcHeroVideoIndex", String(heroIndex === 0 ? 1 : 0));
         heroVideo.addEventListener("error", () => {
           if (heroIndex === 1) {
             heroVideo.src = heroSources[0];
             heroVideo.load();
             heroVideo.play().catch(() => {});
           }
         }, { once: true });
       }

       try {
        setupCgcArtifact3D();
      } catch (err) {
        console.error("Artifact 3D init error:", err);
      }
    })();

        const toBottomBtn = document.getElementById("toBottomBtn");
        if (toBottomBtn) {
            const updateToBottomBtn = () => {
                const nearBottom =
                    (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 120);
                if (nearBottom) toBottomBtn.classList.remove("show");
                else toBottomBtn.classList.add("show");
            };

            window.addEventListener("scroll", updateToBottomBtn, { passive: true });
            window.addEventListener("resize", updateToBottomBtn, { passive: true });
            updateToBottomBtn();

            toBottomBtn.addEventListener("click", () => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            });
        }
        // ---- To Top button ----
        const toTopBtn = document.getElementById("toTopBtn");
        if (toTopBtn) {
            function updateToTopBtn() {
                const y = window.scrollY || document.documentElement.scrollTop;
                if (y > 520) toTopBtn.classList.add("show");
                else toTopBtn.classList.remove("show");
            }
            window.addEventListener("scroll", updateToTopBtn, { passive: true });
            window.addEventListener("resize", updateToTopBtn, { passive: true });
            updateToTopBtn();

            toTopBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        // ===== CONTACT modal =====
        const FORMSPREE_ENDPOINT = "https://formspree.io/f/meeqorjp";
        const contactBtn = document.getElementById("contactBtn");
        const contactOverlay = document.getElementById("contactOverlay");
        const contactClose = document.getElementById("contactClose");
        const contactForm = document.getElementById("contactForm");
        const contactStatus = document.getElementById("contactStatus");
        const contactSend = document.getElementById("contactSend");
        const contactContext = document.getElementById("contactContext");

        function escapeHtml(s) {
            return String(s).replace(/[&<>"']/g, m => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[m]));
        }

        function openContact({ name = undefined, id = undefined, url = undefined } = {}) {
            // ✅ 引数が渡された時だけ上書き（渡されない時は現状維持）
            if (name !== undefined) currentCreatorName = name;
            if (id !== undefined) currentCreatorId = id;
            if (url !== undefined) currentCreatorUrl = url;

            const toName = currentCreatorName || "";

            // 宛先表示（TO: ◯◯）
            if (contactContext) {
                contactContext.innerHTML = toName
                    ? `<span class="pill">TO: <b>${escapeHtml(toName)}</b></span>`
                    : `<span class="pill">TO: <b>CGC</b></span>`;
            }

            contactOverlay?.classList.add("show");
            contactOverlay?.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            if (contactStatus) contactStatus.textContent = "";

            const first = contactForm?.querySelector('input[name="name"]');
            first?.focus();
        }

        const detailContactBtn = document.getElementById("detailContactBtn");
        detailContactBtn?.addEventListener("click", (e) => {
            e.preventDefault();

            const btn = e.currentTarget;
            const name = btn?.dataset?.creatorName || "";
            const id = btn?.dataset?.creatorId || "";
            const url = btn?.dataset?.creatorUrl || "";

            if (!id) {
                alert("クリエイター情報の取得に失敗しました。もう一度カードを開き直してください。");
                return;
            }

            // ✅ 先にDetailを閉じる（見た目が気持ちいい）
            closeDetail();

            // ✅ その後にCONTACT
            openContact({ name, id, url });
        });



        function closeContact() {
            contactOverlay?.classList.remove("show");
            contactOverlay?.setAttribute("aria-hidden", "true");

            const detailOpen = document.getElementById("detailOverlay")?.classList.contains("show");
            document.body.style.overflow = detailOpen ? "hidden" : "";
        }


        contactBtn?.addEventListener("click", () => {
            openContact({ name: "", id: "", url: "" }); // 常にCGC宛（リセット）
        });



        contactClose?.addEventListener("click", closeContact);
        contactOverlay?.addEventListener("click", (e) => {
            if (e.target === contactOverlay) closeContact();
        });
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && contactOverlay?.classList.contains("show")) closeContact();
        });

        // submit → FormspreeへPOST → Gmailへ届く
        contactForm?.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (contactSend) contactSend.disabled = true;
            contactStatus && (contactStatus.textContent = "送信中…");


            const fd = new FormData(contactForm);
            fd.append("creator", currentCreatorName || "（一覧ページからの問い合わせ）");
            fd.append("creatorId", currentCreatorId || "");
            fd.append("creatorUrl", currentCreatorUrl || "");
            fd.append("pageUrl", location.href);

            // 追加情報（任意だけど便利）
            fd.append("userAgent", navigator.userAgent);

            try {
                const res = await fetch(FORMSPREE_ENDPOINT, {
                    method: "POST",
                    body: fd,
                    headers: { "Accept": "application/json" }
                });

                if (res.ok) {
                    contactStatus && (contactStatus.textContent = "送信しました。ありがとうございます！");
                    contactForm.reset();
                    setTimeout(closeContact, 700);
                } else {
                    contactStatus && (contactStatus.textContent = "送信に失敗しました。時間をおいて再度お試しください。");
                }
            } catch (err) {
                console.error(err);
                contactStatus && (contactStatus.textContent = "ネットワークエラーです。接続状況をご確認ください。");
            } finally {
                if (contactSend) contactSend.disabled = false;
            }

        });