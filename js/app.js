import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  query,
  orderBy
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

                // いいねボタン等を押した時に開かない
                const t = e.target;
                if (t && t.closest && t.closest("button, a, input, textarea, select, [data-no-open]")) return;

                onOpen();
            }, { passive: true });

            card.addEventListener("pointercancel", () => { pointerId = null; }, { passive: true });
        }

        // 状態
        let creators = [];
        let currentSort = "newest";
        let currentSearch = "";
        let currentCategory = "";
        let messagesUnsub = null;
        let currentCreatorName = "";
        let currentCreatorId = "";
        let currentCreatorUrl = "";

        // クライアントID（投稿者識別）
        let clientId = localStorage.getItem("pcl_client_id");
        if (!clientId) {
            clientId = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
            localStorage.setItem("pcl_client_id", clientId);
        }
        const ADMIN_SECRET = "pcl-admin-2024";
        let isAdmin = false;

        // 背景パーティクル：hover reactive
        (function () {
          const canvas = document.getElementById("particles");
           if (!canvas) return;

          const ctx = canvas.getContext("2d");
           let W, H, dpr;
           let mouse = { x: 0, y: 0, active: false };
           let mode = "float";
           let modeTimer = 0;

          const colors = [
           "rgba(80,220,255,",
           "rgba(180,90,255,",
           "rgba(255,180,87,",
           "rgba(120,255,220,"
         ];

         function resize() {
          dpr = Math.min(window.devicePixelRatio || 1, 2);
          W = canvas.width = innerWidth * dpr;
          H = canvas.height = innerHeight * dpr;
            canvas.style.width = innerWidth + "px";
            canvas.style.height = innerHeight + "px";
          }

          resize();
          window.addEventListener("resize", resize);

         const parts = Array.from({ length: 120 }, () => ({
           x: Math.random() * W,
           y: Math.random() * H,
           ox: Math.random() * W,
           oy: Math.random() * H,
           vx: 0,
           vy: 0,
           r: (Math.random() * 2.6 + 0.8) * dpr,
           a: Math.random() * Math.PI * 2,
           color: colors[Math.floor(Math.random() * colors.length)]
         }));

         function changeMode() {
         const modes = ["gather", "burst", "orbit", "glow", "collapse"];
          mode = modes[Math.floor(Math.random() * modes.length)];
          modeTimer = 90 + Math.random() * 90;
         }

          window.addEventListener("pointermove", (e) => {
           mouse.x = e.clientX * dpr;
           mouse.y = e.clientY * dpr;
           mouse.active = true;

           if (Math.random() < 0.025) changeMode();
          }, { passive: true });

         window.addEventListener("pointerleave", () => {
           mouse.active = false;
           mode = "float";
          });

         function draw() {
          ctx.clearRect(0, 0, W, H);

           if (mouse.active) {
            modeTimer--;
           if (modeTimer <= 0) changeMode();
          }

          for (const p of parts) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const range = 260 * dpr;
          const force = Math.max(0, 1 - dist / range);

          if (mouse.active) {
          if (mode === "gather") {
           p.vx += dx * 0.0009 * force;
           p.vy += dy * 0.0009 * force;
          }

          if (mode === "burst") {
           p.vx -= dx * 0.0018 * force;
           p.vy -= dy * 0.0018 * force;
          }

          if (mode === "orbit") {
           p.vx += -dy * 0.0011 * force;
           p.vy += dx * 0.0011 * force;
          }

          if (mode === "collapse") {
           p.vx += dx * 0.0022 * force;
           p.vy += dy * 0.0022 * force;
          if (dist < 34 * dpr) {
            p.x = Math.random() * W;
            p.y = Math.random() * H;
          }
         }

          if (mode === "glow") {
           p.vx += dx * 0.00045 * force;
           p.vy += dy * 0.00045 * force;
          }
         }

          p.a += 0.015;
          p.vx += Math.cos(p.a) * 0.025 * dpr;
          p.vy += Math.sin(p.a) * 0.025 * dpr;

          p.vx *= 0.94;
          p.vy *= 0.94;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20;
          if (p.y > H + 20) p.y = -20;

         const glow = mouse.active ? 0.25 + force * 0.75 : 0.22;
         const size = p.r * (mouse.active ? 2.2 + force * 5.5 : 2.4);

          ctx.beginPath();
          ctx.fillStyle = `${p.color}${glow})`;
          ctx.shadowBlur = 18 * glow;
          ctx.shadowColor = `${p.color}0.9)`;
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
          }

          ctx.shadowBlur = 0;
           requestAnimationFrame(draw);
          }

         draw();
        })();

        // Creators取得
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
                        likes: typeof d.likes === "number" ? d.likes : 0,
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

                const footer = document.createElement("div");
                footer.className = "card-footer";

                const likesLabel = document.createElement("span");
                likesLabel.textContent = `${c.likes} ♥`;

                const likeBtn = document.createElement("button");
                likeBtn.className = "like-btn";
                likeBtn.innerHTML = '<span class="heart">👍</span> いいね';
                likeBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    try {
                        await updateDoc(doc(db, "creators", c.id), { likes: increment(1) });
                        c.likes += 1;
                        likesLabel.textContent = `${c.likes} ♥`;
                    } catch (err) {
                        console.error(err);
                        alert("いいねの送信に失敗しました");
                    }
                });

                footer.appendChild(likesLabel);
                footer.appendChild(likeBtn);

                body.appendChild(nameEl);
                body.appendChild(compEl);
                body.appendChild(footer);

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
                    v.controls = true;
                    v.playsInline = true;
                    thumb.appendChild(v);
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

        // CHAT（Firestoreサブコレクション）
        function listenComments(creatorId) {
            const list = document.getElementById("commentList");
            if (!list) return;
            list.innerHTML = "";

            if (messagesUnsub) {
                messagesUnsub();
                messagesUnsub = null;
            }

            const colRef = collection(db, "creators", creatorId, "messages");
            const q = query(colRef, orderBy("createdAt", "asc"));

            messagesUnsub = onSnapshot(q, snapshot => {
                list.innerHTML = "";
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const isMine = data.clientId === clientId;

                    const row = document.createElement("div");
                    row.className = "comment-row " + (isMine ? "mine" : "theirs");

                    const bubble = document.createElement("div");
                    bubble.className = "comment-bubble";
                    bubble.textContent = data.text || "";

                    const meta = document.createElement("div");
                    meta.className = "comment-meta";

                    let dateStr = "";
                    if (data.createdAt?.toDate) {
                        const d = data.createdAt.toDate();
                        dateStr = d.toLocaleString("ja-JP", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                    }
                    meta.textContent = (data.nickname || "匿名") + (dateStr ? ` · ${dateStr}` : "");
                    bubble.appendChild(meta);

                    row.appendChild(bubble);

                    const canDelete = isMine || isAdmin;
                    if (canDelete) {
                        const del = document.createElement("button");
                        del.className = "comment-delete";
                        del.textContent = "削除";
                        del.onclick = async (e) => {
                            e.stopPropagation();
                            if (!confirm("このメッセージを削除しますか？")) return;
                            try {
                                await deleteDoc(doc(db, "creators", creatorId, "messages", docSnap.id));
                            } catch (err) {
                                console.error(err);
                                alert("削除に失敗しました");
                            }
                        };
                        row.appendChild(del);
                    }

                    list.appendChild(row);
                });

                list.scrollTop = list.scrollHeight;
            });
        }

        function setupCommentInput(creatorId) {
            const input = $("#commentInput");
            const send = $("#commentSend");
            const nickIn = $("#nicknameInput");
            if (!input || !send || !nickIn) return;

            const storedNick = localStorage.getItem("pcl_nickname");
            if (storedNick && !nickIn.value) {
                nickIn.value = storedNick;
            }

            async function doSend() {
                const text = input.value.trim();
                const nick = nickIn.value.trim();
                if (!nick) {
                    alert("ニックネームを入力してください。");
                    nickIn.focus();
                    return;
                }
                if (!text) return;

                if (text.startsWith("/admin ")) {
                    const code = text.replace("/admin ", "").trim();
                    if (code === ADMIN_SECRET) {
                        isAdmin = true;
                        alert("管理者モードになりました（このブラウザのみ）");
                    } else {
                        alert("管理者コードが違います");
                    }
                    input.value = "";
                    return;
                }

                localStorage.setItem("pcl_nickname", nick);

                try {
                    await addDoc(collection(db, "creators", creatorId, "messages"), {
                        text,
                        nickname: nick,
                        clientId,
                        createdAt: serverTimestamp()
                    });
                    input.value = "";
                } catch (err) {
                    console.error(err);
                    alert("メッセージ送信に失敗しました");
                }
            }

            send.onclick = () => { doSend(); };
            input.onkeydown = (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    doSend();
                }
            };
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
            listenComments(c.id);
            setupCommentInput(c.id);


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
            const list = $("#commentList");

            overlay.classList.remove("show");
            if (messagesUnsub) {
                messagesUnsub();
                messagesUnsub = null;
            }
            if (videoWrap) videoWrap.innerHTML = "";
            if (worksWrap) worksWrap.innerHTML = "";
            if (list) list.innerHTML = "";
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

            function toggle() {
                btn.classList.toggle("active");
                ov.classList.toggle("show");
            }

            btn.addEventListener("click", toggle);
            ov.addEventListener("click", e => {
                if (e.target.id === "menuOverlay") toggle();
            });

            $("#linkMarket")?.addEventListener("click", e => {
                e.preventDefault();
                toggle();
                alert("Creator’s Market（ECモール構想）の仮画面です。");
            });
            $("#linkAI")?.addEventListener("click", e => {
                e.preventDefault();
                toggle();
                alert("Creator’s AI Consulting（AIクローン相談）の仮画面です。");
            });
            $("#linkGuild")?.addEventListener("click", e => {
                e.preventDefault();
                toggle();
                alert("Creator’s Guild Produce（課題相談→クリエイターアサイン）の仮画面です。");
            });
            document.body.style.overflow = "";
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
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.minDistance = 2.2;
      controls.maxDistance = 6.5;
      controls.rotateSpeed = 0.45;
      controls.autoRotate = false;

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
      let nextElectricFlash =
       performance.now() + 9000 + Math.random() * 9000;
      let electricLines = [];

      function createElectricLine() {
      if (!currentModel) return;

      const points = [];
      const count = 9;

       for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      points.push(
      new THREE.Vector3(
        -0.85 + t * 1.7 + (Math.random() - 0.5) * 0.18,
        0.45 - t * 0.9 + (Math.random() - 0.5) * 0.22,
        0.16 + (Math.random() - 0.5) * 0.08
      )
      );
     }

     const geometry = new THREE.BufferGeometry().setFromPoints(points);

     const material = new THREE.LineBasicMaterial({
      color: 0x9ff6ff,
      transparent: true,
      opacity: 1
      });

     const line = new THREE.Line(geometry, material);
      line.userData.life = 1;

      currentModel.add(line);
      electricLines.push(line);
     }

     function triggerElectricFlash(now) {
     const hero = mount.closest(".hero-3d");
     hero?.classList.add("electric-flash");

     for (let i = 0; i < 5; i++) {
      createElectricLine();
     }

     setTimeout(() => {
      hero?.classList.remove("electric-flash");
     }, 850);

     nextElectricFlash = now + 12000 + Math.random() * 12000;
     }

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

    document.getElementById("modelNextBtn")?.addEventListener("click", () => {
     nextModel();
     restartAutoModelTimer();
    });

    document.getElementById("modelPrevBtn")?.addEventListener("click", () => {
     prevModel();
     restartAutoModelTimer();
    });

    renderer.domElement.addEventListener("pointerdown", () => {
     isPointerActive = true;
     lastInteraction = performance.now();
    });

    renderer.domElement.addEventListener("pointerup", () => {
     isPointerActive = false;
     lastInteraction = performance.now();
    });

    renderer.domElement.addEventListener("pointercancel", () => {
     isPointerActive = false;
     lastInteraction = performance.now();
    });

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

      currentModel.position.y =
       Math.sin(elapsed * 0.55) * 0.05;

      currentModel.position.z =
       Math.sin(elapsed * 0.28) * 0.03;

    // ---------------------------
    // Electric Flash
    // ---------------------------
     if (now > nextElectricFlash) {
      triggerElectricFlash(now);
      }

     electricLines = electricLines.filter((line) => {
      line.userData.life -= 0.035;
      line.material.opacity = Math.max(line.userData.life, 0);
      line.scale.setScalar(1 + (1 - line.userData.life) * 0.08);

      if (line.userData.life <= 0) {
       line.parent?.remove(line);
       line.geometry.dispose();
       line.material.dispose();
       return false;
      }

      return true;
     });

     controls.update();
     renderer.render(scene, camera);

     } // ← if(currentModel)

     } // ← animate()

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

    // 初期化
        (function init() {
         setupSearchAndSort();
         setupModalClose();
         setupMenu();
         setupWorksLightbox();

         loadCreators();

         try {
         setupCgcHero3D();
         } catch (err) {
         console.error("3D init error:", err);
         }
        })();

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