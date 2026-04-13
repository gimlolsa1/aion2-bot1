const express = require("express");
const axios = require("axios");

const app = express();

/* =========================
   1️⃣ 캐릭터 검색 API
========================= */
app.get("/search", async (req, res) => {
    try {

        let name = req.query.name;

        let url =
        "https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character"
        + "?keyword=" + encodeURIComponent(name)
        + "&page=1&size=10";

        let result = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://aion2.plaync.com/",
                "Accept": "application/json"
            }
        });

        res.json(result.data);

    } catch (e) {
        res.json({ error: e.toString() });
    }
});

/* =========================
   2️⃣ 전투력 API (최종 안정 버전)
========================= */
app.get("/power", async (req, res) => {

    try {

        let name = req.query.name;

        // 1. 검색
        let search = await axios.get(
            "https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character"
            + "?keyword=" + encodeURIComponent(name)
            + "&page=1&size=1",
            {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://aion2.plaync.com/"
                }
            }
        );

        let char = search.data.list[0];

        if (!char) {
            return res.json({ error: "not found" });
        }

        // 2. info API (핵심)
        let info = await axios.get(
            "https://aion2.plaync.com/api/character/info",
            {
                params: {
                    lang: "ko",
                    characterId: char.characterId,
                    serverId: char.serverId
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Referer": "https://aion2.plaync.com/ko-kr/characters/index",
                    "Origin": "https://aion2.plaync.com",
                    "Accept": "application/json"
                }
            }
        );

        // 🔥 전투력 안전 추출 (최종 버전)
        let raw = info.data || {};

        let power =
            raw.combatPower ||
            raw.combat_power ||
            raw.summary?.combatPower ||
            raw.summary?.combat_power ||
            raw.characterInfo?.combatPower ||
            raw.character?.combatPower ||
            raw.data?.combatPower;

        res.json({
            name: char.name.replace(/<[^>]*>/g, ""),
            server: char.serverName,
            combatPower: power || "정보 없음"
        });

    } catch (e) {
        res.json({ error: e.toString() });
    }
});

/* =========================
   서버 실행
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
